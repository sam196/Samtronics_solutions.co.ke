const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const compression = require('compression');

const app = express();

// ============================================
// DOMAIN CONFIGURATION
// ============================================

// Choose your main domain (pick ONE)
const MAIN_DOMAIN = 'https://samtronics-solutions-co-ke.onrender.com';
const OLD_DOMAIN = 'https://samtronics-mpesa-signs.onrender.com';

// ============================================
// REDIRECT OLD DOMAIN TO MAIN DOMAIN
// ============================================

app.use((req, res, next) => {
    const host = req.headers.host;
    
    // Redirect old domain to main domain
    if (host === 'samtronics-mpesa-signs.onrender.com') {
        return res.redirect(301, `${MAIN_DOMAIN}${req.url}`);
    }
    
    // Ensure HTTPS (Render already handles this, but good practice)
    if (req.headers['x-forwarded-proto'] !== 'https' && process.env.NODE_ENV === 'production') {
        return res.redirect(301, `https://${host}${req.url}`);
    }
    
    next();
});

// ============================================
// COMPRESSION & SECURITY MIDDLEWARE
// ============================================

// Enable compression for faster loading
app.use(compression());

// Security headers (relaxed for M-Pesa API connectivity)
app.use((req, res, next) => {
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');
    
    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // XSS protection
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // HTTPS enforcement (HSTS)
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    
    // Referrer policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Relaxed CSP for M-Pesa API connectivity - allows all connections
    res.setHeader('Content-Security-Policy', "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;");
    
    next();
});

// Enable CORS
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// ============================================
// STATIC FILE SERVING WITH CACHE
// ============================================

// Serve static files with caching
app.use(express.static(__dirname, {
    maxAge: '30d',
    setHeaders: (res, filePath) => {
        // Don't cache HTML files
        if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
        }
        // Cache images, CSS, JS for 30 days
        if (filePath.match(/\.(css|js|jpg|jpeg|png|gif|ico|webp|mp4)$/)) {
            res.setHeader('Cache-Control', 'public, max-age=2592000');
        }
    }
}));

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============================================
// SEO ROUTES
// ============================================

// Serve sitemap.xml with correct domain
app.get('/sitemap.xml', (req, res) => {
    const sitemapPath = path.join(__dirname, 'sitemap.xml');
    const today = new Date().toISOString().split('T')[0];
    
    // If custom sitemap exists, serve it
    if (fs.existsSync(sitemapPath)) {
        let sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
        // Replace any old domain with new main domain
        sitemapContent = sitemapContent.replace(/https:\/\/samtronics-mpesa-signs\.onrender\.com/g, MAIN_DOMAIN);
        res.setHeader('Content-Type', 'application/xml');
        return res.send(sitemapContent);
    }
    
    // Fallback sitemap
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>${MAIN_DOMAIN}/</loc>
        <lastmod>${today}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
    </url>
</urlset>`;
    
    res.setHeader('Content-Type', 'application/xml');
    res.send(sitemap);
});

// Serve robots.txt
app.get('/robots.txt', (req, res) => {
    const robotsPath = path.join(__dirname, 'robots.txt');
    
    if (fs.existsSync(robotsPath)) {
        let robotsContent = fs.readFileSync(robotsPath, 'utf8');
        // Replace any old domain with new main domain
        robotsContent = robotsContent.replace(/https:\/\/samtronics-mpesa-signs\.onrender\.com/g, MAIN_DOMAIN);
        res.setHeader('Content-Type', 'text/plain');
        return res.send(robotsContent);
    }
    
    // Fallback robots.txt
    const robots = `User-agent: *
Allow: /

Sitemap: ${MAIN_DOMAIN}/sitemap.xml`;
    
    res.setHeader('Content-Type', 'text/plain');
    res.send(robots);
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
console.log(`📍 Main Domain: ${MAIN_DOMAIN}`);
console.log(`📱 M-Pesa Environment: ${MPESA_CONFIG.environment}`);
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
                },
                timeout: 30000  // 30 second timeout
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
        
        // Get callback URL using main domain
        const callbackUrl = `${MAIN_DOMAIN}/api/mpesa-callback`;
        
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
                },
                timeout: 30000  // 30 second timeout
            }
        );
        
        // Store transaction for status checking
        activeTransactions.set(response.data.CheckoutRequestID, {
            phone: formattedPhone,
            amount: amount,
            status: 'pending',
            timestamp: new Date(),
            checkoutRequestID: response.data.CheckoutRequestID,
            store: 'Samtronics Solutions - Kenya'
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
                },
                timeout: 30000  // 30 second timeout
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
        domain: MAIN_DOMAIN,
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
// TEST M-PESA CONNECTION ENDPOINT
// ============================================

app.get('/api/mpesa-test', async (req, res) => {
    try {
        const auth = Buffer.from(`${MPESA_CONFIG.consumerKey}:${MPESA_CONFIG.consumerSecret}`).toString('base64');
        const baseUrl = MPESA_CONFIG.environment === 'production' 
            ? 'https://api.safaricom.co.ke' 
            : 'https://sandbox.safaricom.co.ke';
        
        console.log('Testing M-Pesa connection...');
        console.log('Using baseUrl:', baseUrl);
        console.log('Environment:', MPESA_CONFIG.environment);
        
        const response = await axios.get(
            `${baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
            {
                headers: { Authorization: `Basic ${auth}` },
                timeout: 30000
            }
        );
        
        res.json({ 
            success: true, 
            message: 'M-Pesa API is working!',
            environment: MPESA_CONFIG.environment,
            hasToken: !!response.data.access_token,
            tokenPreview: response.data.access_token ? response.data.access_token.substring(0, 20) + '...' : null
        });
    } catch (error) {
        console.error('Test error:', error.message);
        console.error('Error details:', error.response?.data || error.code);
        res.json({ 
            success: false, 
            message: error.message,
            error: error.response?.data || error.code,
            environment: MPESA_CONFIG.environment
        });
    }
});

// ============================================
// CANONICAL URL HANDLER - Add to HTML responses
// ============================================

// Intercept HTML responses to inject canonical URL if not present
app.use((req, res, next) => {
    const originalSend = res.send;
    res.send = function(data) {
        if (typeof data === 'string' && data.includes('</head>') && !data.includes('canonical')) {
            const canonicalTag = `<link rel="canonical" href="${MAIN_DOMAIN}${req.path === '/' ? '' : req.path}" />\n`;
            data = data.replace('</head>', `${canonicalTag}</head>`);
        }
        originalSend.call(this, data);
    };
    next();
});

// ============================================
// 404 PAGE
// ============================================

app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, '404.html'));
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
╔══════════════════════════════════════════════════════════════════╗
║     🏪 Samtronics Solutions - LED Signages Kenya                ║
╠══════════════════════════════════════════════════════════════════╣
║  🚀 Server running on port: ${PORT}                                     
║  🌐 Main Domain: ${MAIN_DOMAIN}
║  🔄 Redirects: ${OLD_DOMAIN} → ${MAIN_DOMAIN}
║  📍 Location: Eldoret, Kenya                                    
║  📱 M-Pesa Environment: ${MPESA_CONFIG.environment.padEnd(20)} 
║  💳 Payment: M-Pesa STK Push & Till Number                      
║  🤖 SEO: Fully optimized with canonical URLs, sitemap, robots.txt
║  🔒 Security: HSTS, XSS Protection enabled
║  🧪 Test endpoint: ${MAIN_DOMAIN}/api/mpesa-test
╚══════════════════════════════════════════════════════════════════╝
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
