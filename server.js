const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const compression = require('compression');

const app = express();

// ============================================
// COMPRESSION & SECURITY MIDDLEWARE
// ============================================

// Enable compression for faster loading
app.use(compression());

// Security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
});

// Enable CORS
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Serve static files with caching
app.use(express.static(__dirname, {
    maxAge: '30d',
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache');
        }
    }
}));

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============================================
// SEO ROUTES
// ============================================

// Serve sitemap.xml
app.get('/sitemap.xml', (req, res) => {
    const sitemapPath = path.join(__dirname, 'sitemap.xml');
    if (fs.existsSync(sitemapPath)) {
        res.setHeader('Content-Type', 'application/xml');
        res.sendFile(sitemapPath);
    } else {
        const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>https://samtronics-mpesa-signs.onrender.com/</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
    </url>
</urlset>`;
        res.setHeader('Content-Type', 'application/xml');
        res.send(fallbackSitemap);
    }
});

// Serve robots.txt
app.get('/robots.txt', (req, res) => {
    const robotsPath = path.join(__dirname, 'robots.txt');
    if (fs.existsSync(robotsPath)) {
        res.setHeader('Content-Type', 'text/plain');
        res.sendFile(robotsPath);
    } else {
        const fallbackRobots = `User-agent: *
Allow: /

Sitemap: https://samtronics-mpesa-signs.onrender.com/sitemap.xml`;
        res.setHeader('Content-Type', 'text/plain');
        res.send(fallbackRobots);
    }
});

// ============================================
// M-PESA CONFIGURATION
// ============================================

const MPESA_CONFIG = {
    consumerKey: process.env.MPESA_CONSUMER_KEY || '7Ve5y5c180Zwbd8qHEGIp4ROTe1wBSnhAtL3c6AGbS7AAdhQ',
    consumerSecret: process.env.MPESA_CONSUMER_SECRET || 'kJqcTHi82hANEoMVDzRkrz16Qrh4ik9kVBZhsG9eh4JT5rtSlieIUhXIKyQeeNLJ',
    businessShortCode: '174379',
    passkey: 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919',
    environment: process.env.NODE_ENV || 'sandbox'
};

console.log('🚀 Samtronics Solutions Server Starting...');
console.log('📍 Location: Eldoret, Kenya');
console.log('📱 M-Pesa Environment:', MPESA_CONFIG.environment);

// Store active transactions
const activeTransactions = new Map();

// Get Access Token
async function getAccessToken() {
    const auth = Buffer.from(`${MPESA_CONFIG.consumerKey}:${MPESA_CONFIG.consumerSecret}`).toString('base64');
    
    try {
        const baseUrl = MPESA_CONFIG.environment === 'production' 
            ? 'https://api.safaricom.co.ke' 
            : 'https://sandbox.safaricom.co.ke';
            
        const response = await axios.get(
            `${baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
            {
                headers: {
                    Authorization: `Basic ${auth}`
                }
            }
        );
        console.log('✅ Access token obtained');
        return response.data.access_token;
    } catch (error) {
        console.error('❌ Error getting access token:', error.response?.data || error.message);
        throw new Error('Failed to get access token');
    }
}

// STK Push Endpoint
app.post('/api/mpesa/stkpush', async (req, res) => {
    const { phone, amount, accountReference, transactionDesc } = req.body;
    
    console.log('📱 STK Push request:', { phone, amount });
    
    let formattedPhone = phone.toString().replace(/\D/g, '');
    if (formattedPhone.startsWith('0')) {
        formattedPhone = '254' + formattedPhone.substring(1);
    } else if (formattedPhone.startsWith('+')) {
        formattedPhone = formattedPhone.substring(1);
    } else if (!formattedPhone.startsWith('254')) {
        formattedPhone = '254' + formattedPhone;
    }
    
    try {
        const accessToken = await getAccessToken();
        const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
        const password = Buffer.from(
            `${MPESA_CONFIG.businessShortCode}${MPESA_CONFIG.passkey}${timestamp}`
        ).toString('base64');
        
        const baseUrl = MPESA_CONFIG.environment === 'production' 
            ? 'https://api.safaricom.co.ke' 
            : 'https://sandbox.safaricom.co.ke';
        
        const callbackUrl = process.env.RENDER_EXTERNAL_HOSTNAME 
            ? `https://${process.env.RENDER_EXTERNAL_HOSTNAME}/api/mpesa-callback`
            : 'https://samtronics-mpesa-signs.onrender.com/api/mpesa-callback';
        
        const response = await axios.post(
            `${baseUrl}/mpesa/stkpush/v1/processrequest`,
            {
                BusinessShortCode: MPESA_CONFIG.businessShortCode,
                Password: password,
                Timestamp: timestamp,
                TransactionType: 'CustomerPayBillOnline',
                Amount: Math.round(amount),
                PartyA: formattedPhone,
                PartyB: MPESA_CONFIG.businessShortCode,
                PhoneNumber: formattedPhone,
                CallBackURL: callbackUrl,
                AccountReference: accountReference || 'Samtronics Payment',
                TransactionDesc: transactionDesc || 'LED Signage Purchase'
            },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        activeTransactions.set(response.data.CheckoutRequestID, {
            phone: formattedPhone,
            amount: amount,
            status: 'pending',
            timestamp: new Date(),
            checkoutRequestID: response.data.CheckoutRequestID
        });
        
        res.json({
            success: true,
            checkoutRequestID: response.data.CheckoutRequestID,
            message: 'Payment request sent. Check your phone to enter PIN.'
        });
        
    } catch (error) {
        console.error('❌ STK Push Error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: error.response?.data?.errorMessage || 'Payment request failed. Please try again.'
        });
    }
});

// M-Pesa Callback
app.post('/api/mpesa-callback', (req, res) => {
    console.log('🔔 M-Pesa Callback received');
    const { Body } = req.body;
    
    if (Body && Body.stkCallback) {
        const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = Body.stkCallback;
        const transaction = activeTransactions.get(CheckoutRequestID);
        
        if (ResultCode === 0) {
            const metadata = {};
            if (CallbackMetadata && CallbackMetadata.Item) {
                CallbackMetadata.Item.forEach(item => {
                    metadata[item.Name] = item.Value;
                });
            }
            console.log('✅ PAYMENT SUCCESSFUL!', { 
                checkoutRequestID: CheckoutRequestID, 
                amount: metadata.Amount, 
                receipt: metadata.MpesaReceiptNumber 
            });
            if (transaction) transaction.status = 'completed';
        } else {
            console.log('❌ PAYMENT FAILED:', ResultDesc);
            if (transaction) transaction.status = 'failed';
        }
    }
    res.json({ ResultCode: 0, ResultDesc: 'Success' });
});

// Check payment status
app.post('/api/mpesa/status', async (req, res) => {
    const { checkoutRequestID } = req.body;
    
    const localTransaction = activeTransactions.get(checkoutRequestID);
    if (localTransaction && localTransaction.status !== 'pending') {
        return res.json({ 
            ResultCode: localTransaction.status === 'completed' ? 0 : 1, 
            ResultDesc: localTransaction.status === 'completed' ? 'Success' : localTransaction.error,
            ...localTransaction 
        });
    }
    
    try {
        const accessToken = await getAccessToken();
        const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
        const password = Buffer.from(`${MPESA_CONFIG.businessShortCode}${MPESA_CONFIG.passkey}${timestamp}`).toString('base64');
        const baseUrl = MPESA_CONFIG.environment === 'production' ? 'https://api.safaricom.co.ke' : 'https://sandbox.safaricom.co.ke';
        
        const response = await axios.post(`${baseUrl}/mpesa/stkpushquery/v1/query`, {
            BusinessShortCode: MPESA_CONFIG.businessShortCode,
            Password: password,
            Timestamp: timestamp,
            CheckoutRequestID: checkoutRequestID
        }, { headers: { Authorization: `Bearer ${accessToken}` } });
        
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to check payment status' });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(), 
        location: 'Eldoret, Kenya', 
        store: 'Samtronics Solutions',
        environment: MPESA_CONFIG.environment,
        uptime: process.uptime()
    });
});

// ============================================
// 404 PAGE
// ============================================

app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, '404.html'));
});

// ============================================
// SERVE FRONTEND
// ============================================

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`
╔══════════════════════════════════════════════════════════╗
║     🏪 Samtronics Solutions - LED Signages Kenya        ║
╠══════════════════════════════════════════════════════════╣
║  🚀 Server running on port: ${PORT}                         
║  📍 Location: Eldoret, Kenya                            
║  📱 M-Pesa Environment: ${MPESA_CONFIG.environment.padEnd(20)} 
║  💳 Payment: M-Pesa STK Push & Till Number              
║  🌐 URL: https://samtronics-mpesa-signs.onrender.com     
║  🤖 SEO: Fully optimized with schema, sitemap, robots.txt
╚══════════════════════════════════════════════════════════╝
    `);
});
