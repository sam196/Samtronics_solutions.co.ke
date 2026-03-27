const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

// ============================================
// MIDDLEWARE
// ============================================

// Enable CORS for all routes
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Serve static files from root directory
app.use(express.static(__dirname, {
    maxAge: '1d',
    setHeaders: (res, filePath) => {
        // Don't cache HTML files
        if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache');
        }
    }
}));

// Serve uploaded images (if any)
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
        // Fallback sitemap if file doesn't exist
        const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>https://samtronics-mpesa-signs.onrender.com/</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>https://samtronics-mpesa-signs.onrender.com/#products</loc>
        <changefreq>weekly</changefreq>
        <priority>0.9</priority>
    </url>
    <url>
        <loc>https://samtronics-mpesa-signs.onrender.com/#gallery</loc>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>
    <url>
        <loc>https://samtronics-mpesa-signs.onrender.com/#quote</loc>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
    </url>
    <url>
        <loc>https://samtronics-mpesa-signs.onrender.com/#contact</loc>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
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
        // Fallback robots.txt if file doesn't exist
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
console.log('💳 Payment Method: M-Pesa STK Push & Till Number');

// Store active transactions
const activeTransactions = new Map();

// ============================================
// GET M-PESA ACCESS TOKEN
// ============================================

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
        console.log('✅ M-Pesa access token obtained successfully');
        return response.data.access_token;
    } catch (error) {
        console.error('❌ Error getting access token:', error.response?.data || error.message);
        throw new Error('Failed to get access token');
    }
}

// ============================================
// STK PUSH ENDPOINT - Send payment request to phone
// ============================================

app.post('/api/mpesa/stkpush', async (req, res) => {
    const { phone, amount, accountReference, transactionDesc } = req.body;
    
    console.log('📱 STK Push request received:', { phone, amount });
    
    // Format phone number to 2547XXXXXXXX
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
        
        // Get callback URL from environment or use default
        const callbackUrl = process.env.RENDER_EXTERNAL_HOSTNAME 
            ? `https://${process.env.RENDER_EXTERNAL_HOSTNAME}/api/mpesa-callback`
            : 'https://samtronics-mpesa-signs.onrender.com/api/mpesa-callback';
        
        const requestData = {
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
        };
        
        const response = await axios.post(
            `${baseUrl}/mpesa/stkpush/v1/processrequest`,
            requestData,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        // Store transaction for status checking
        activeTransactions.set(response.data.CheckoutRequestID, {
            phone: formattedPhone,
            amount: amount,
            status: 'pending',
            timestamp: new Date(),
            checkoutRequestID: response.data.CheckoutRequestID,
            store: 'Samtronics Solutions - Eldoret'
        });
        
        res.json({
            success: true,
            checkoutRequestID: response.data.CheckoutRequestID,
            message: 'Payment request sent. Please check your phone to enter PIN and complete payment.'
        });
        
    } catch (error) {
        console.error('❌ STK Push Error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: error.response?.data?.errorMessage || 'Payment request failed. Please try again.'
        });
    }
});

// ============================================
// M-PESA CALLBACK ENDPOINT - Receives payment confirmation
// ============================================

app.post('/api/mpesa-callback', (req, res) => {
    console.log('🔔 M-Pesa Callback received at:', new Date().toISOString());
    
    const { Body } = req.body;
    
    if (Body && Body.stkCallback) {
        const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = Body.stkCallback;
        
        const transaction = activeTransactions.get(CheckoutRequestID);
        
        if (ResultCode === 0) {
            // Payment successful
            const metadata = {};
            if (CallbackMetadata && CallbackMetadata.Item) {
                CallbackMetadata.Item.forEach(item => {
                    metadata[item.Name] = item.Value;
                });
            }
            
            console.log('✅ PAYMENT SUCCESSFUL - Samtronics Solutions!', {
                checkoutRequestID: CheckoutRequestID,
                amount: metadata.Amount,
                receiptNumber: metadata.MpesaReceiptNumber,
                phoneNumber: metadata.PhoneNumber
            });
            
            if (transaction) {
                transaction.status = 'completed';
                transaction.receiptNumber = metadata.MpesaReceiptNumber;
                transaction.amount = metadata.Amount;
            }
        } else {
            // Payment failed
            console.log('❌ PAYMENT FAILED:', ResultDesc);
            if (transaction) {
                transaction.status = 'failed';
                transaction.error = ResultDesc;
            }
        }
    }
    
    // Always respond with success to acknowledge receipt
    res.json({ ResultCode: 0, ResultDesc: 'Success' });
});

// ============================================
// CHECK PAYMENT STATUS ENDPOINT
// ============================================

app.post('/api/mpesa/status', async (req, res) => {
    const { checkoutRequestID } = req.body;
    
    // Check local cache first
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
        const password = Buffer.from(
            `${MPESA_CONFIG.businessShortCode}${MPESA_CONFIG.passkey}${timestamp}`
        ).toString('base64');
        
        const baseUrl = MPESA_CONFIG.environment === 'production' 
            ? 'https://api.safaricom.co.ke' 
            : 'https://sandbox.safaricom.co.ke';
        
        const response = await axios.post(
            `${baseUrl}/mpesa/stkpushquery/v1/query`,
            {
                BusinessShortCode: MPESA_CONFIG.businessShortCode,
                Password: password,
                Timestamp: timestamp,
                CheckoutRequestID: checkoutRequestID
            },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        );
        
        // Update local cache
        if (activeTransactions.has(checkoutRequestID)) {
            const transaction = activeTransactions.get(checkoutRequestID);
            transaction.status = response.data.ResultCode === 0 ? 'completed' : 'failed';
            if (response.data.ResultCode !== 0) {
                transaction.error = response.data.ResultDesc;
            }
        }
        
        res.json(response.data);
    } catch (error) {
        console.error('❌ Status check error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to check payment status' });
    }
});

// ============================================
// HEALTH CHECK ENDPOINT
// ============================================

app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        location: 'Eldoret, Kenya',
        store: 'Samtronics Solutions',
        environment: MPESA_CONFIG.environment,
        paymentMethod: 'M-Pesa STK Push & Till Number',
        activeTransactions: activeTransactions.size,
        uptime: process.uptime(),
        memory: process.memoryUsage()
    });
});

// ============================================
// SERVE FRONTEND FOR ALL OTHER ROUTES
// ============================================

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ============================================
// START THE SERVER
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
║  💳 Payment Methods: M-Pesa STK Push & Till Number      
║  🌐 Local URL: http://localhost:${PORT}                    
║  🌍 Live URL: https://samtronics-mpesa-signs.onrender.com
║  🤖 SEO: Enabled (sitemap.xml, robots.txt, schema.org)  
╚══════════════════════════════════════════════════════════╝
    `);
});

// ============================================
// ERROR HANDLING
// ============================================

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});
