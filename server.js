// ============================================
// SAMTRONICS SOLUTIONS - BACKEND SERVER
// This file creates a web server that handles:
// 1. Serving your website files (HTML, CSS, JS)
// 2. Processing M-Pesa payments
// 3. Communicating with Safaricom's API
// ============================================

// Import required packages (like importing tools from a toolbox)
const express = require('express');
// Express is like a toolkit for building web servers

const axios = require('axios');
// Axios helps us make HTTP requests to other servers (like Safaricom's)

const cors = require('cors');
// CORS allows our website to talk to our server (security thing)

const path = require('path');
// Path helps us work with file paths (like finding where files are stored)

// Create an instance of Express (start building our server)
const app = express();

// ============================================
// MIDDLEWARE - Things that run for every request
// ============================================

// Enable CORS - allows requests from any domain (your website can talk to server)
app.use(cors());

// Parse JSON data from requests (convert JSON strings into JavaScript objects)
app.use(express.json());

// Serve static files (HTML, CSS, JS, images) from the current folder
// This means when someone visits your site, it sends them index.html
app.use(express.static(path.join(__dirname, '/')));

// ============================================
// M-PESA CONFIGURATION
// These are your credentials for connecting to M-Pesa
// ============================================

const MPESA_CONFIG = {
  // Your consumer key - like a username for M-Pesa API
  consumerKey: process.env.MPESA_CONSUMER_KEY || '7Ve5y5c180Zwbd8qHEGIp4ROTe1wBSnhAtL3c6AGbS7AAdhQ',
  
  // Your consumer secret - like a password for M-Pesa API
  consumerSecret: process.env.MPESA_CONSUMER_SECRET || 'kJqcTHi82hANEoMVDzRkrz16Qrh4ik9kVBZhsG9eh4JT5rtSlieIUhXIKyQeeNLJ',
  
  // The business shortcode (174379 is Safaricom's test shortcode)
  businessShortCode: process.env.MPESA_BUSINESS_SHORTCODE || '174379',
  
  // Passkey for STK Push (Lipa Na M-Pesa)
  passkey: process.env.MPESA_PASSKEY || 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919',
  
  // Environment: 'sandbox' for testing, 'production' for real money
  environment: process.env.NODE_ENV || 'sandbox'
};

// Store active transactions (like a notebook to remember pending payments)
// Map is like a dictionary - stores key-value pairs
const activeTransactions = new Map();

// Print to console so we know server is starting
console.log('🚀 Server starting...');
console.log('📱 Environment:', MPESA_CONFIG.environment);

// ============================================
// FUNCTION: Get Access Token from Safaricom
// This is required before making any M-Pesa API calls
// ============================================

async function getAccessToken() {
  // Encode consumer key and secret in Base64 (required by Safaricom)
  const auth = Buffer.from(`${MPESA_CONFIG.consumerKey}:${MPESA_CONFIG.consumerSecret}`).toString('base64');
  
  try {
    // Choose the correct URL based on environment (sandbox or production)
    const baseUrl = MPESA_CONFIG.environment === 'production' 
      ? 'https://api.safaricom.co.ke'      // Live URL for real money
      : 'https://sandbox.safaricom.co.ke';  // Test URL for development
    
    // Make a request to Safaricom to get an access token
    const response = await axios.get(
      `${baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
      {
        headers: {
          Authorization: `Basic ${auth}`  // Send credentials in header
        }
      }
    );
    
    console.log('✅ Access token obtained successfully');
    return response.data.access_token;  // Return the token for future requests
    
  } catch (error) {
    console.error('❌ Error getting access token:', error.response?.data || error.message);
    throw new Error('Failed to get access token');
  }
}

// ============================================
// ENDPOINT 1: Initiate STK Push Payment
// URL: /api/mpesa/stkpush
// This sends a payment request to the customer's phone
// ============================================

app.post('/api/mpesa/stkpush', async (req, res) => {
  // Extract data from the request body (sent from your website)
  const { phone, amount, accountReference, transactionDesc } = req.body;
  
  console.log('📱 STK Push request:', { phone, amount });
  
  // Format phone number to required format (2547XXXXXXXX)
  // Remove all non-digit characters
  let formattedPhone = phone.toString().replace(/\D/g, '');
  
  // If number starts with 0 (e.g., 0712345678), replace with 254
  if (formattedPhone.startsWith('0')) {
    formattedPhone = '254' + formattedPhone.substring(1);
  } 
  // If number starts with + (e.g., +254712345678), remove the +
  else if (formattedPhone.startsWith('+')) {
    formattedPhone = formattedPhone.substring(1);
  } 
  // If number doesn't start with 254, add it
  else if (!formattedPhone.startsWith('254')) {
    formattedPhone = '254' + formattedPhone;
  }
  
  try {
    // Step 1: Get an access token from Safaricom
    const accessToken = await getAccessToken();
    
    // Step 2: Create timestamp (required format: YYYYMMDDHHMMSS)
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    
    // Step 3: Create password (Base64 encoded string of shortcode + passkey + timestamp)
    const password = Buffer.from(
      `${MPESA_CONFIG.businessShortCode}${MPESA_CONFIG.passkey}${timestamp}`
    ).toString('base64');
    
    // Step 4: Choose correct API URL
    const baseUrl = MPESA_CONFIG.environment === 'production' 
      ? 'https://api.safaricom.co.ke' 
      : 'https://sandbox.safaricom.co.ke';
    
    // Step 5: Get the callback URL (where M-Pesa will send payment confirmation)
    // RENDER_EXTERNAL_HOSTNAME is automatically set by Render.com
    const callbackUrl = `https://${process.env.RENDER_EXTERNAL_HOSTNAME || 'localhost'}/api/mpesa-callback`;
    
    // Step 6: Prepare the request data
    const requestData = {
      BusinessShortCode: MPESA_CONFIG.businessShortCode,  // 174379
      Password: password,  // Generated password
      Timestamp: timestamp,  // Current timestamp
      TransactionType: 'CustomerPayBillOnline',  // Type of transaction
      Amount: Math.round(amount),  // Amount to charge (rounded to whole number)
      PartyA: formattedPhone,  // Customer's phone number
      PartyB: MPESA_CONFIG.businessShortCode,  // Business shortcode
      PhoneNumber: formattedPhone,  // Customer's phone number (again)
      CallBackURL: callbackUrl,  // Where to send confirmation
      AccountReference: accountReference || 'Samtronics Payment',  // Reference for your records
      TransactionDesc: transactionDesc || 'LED Signage Purchase'  // Description
    };
    
    // Step 7: Send the request to Safaricom
    const response = await axios.post(
      `${baseUrl}/mpesa/stkpush/v1/processrequest`,
      requestData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,  // Use the access token we got
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Step 8: Store the transaction for later reference
    activeTransactions.set(response.data.CheckoutRequestID, {
      phone: formattedPhone,
      amount: amount,
      status: 'pending',  // Payment hasn't been completed yet
      timestamp: new Date(),
      checkoutRequestID: response.data.CheckoutRequestID
    });
    
    // Step 9: Send success response back to the website
    res.json({
      success: true,
      checkoutRequestID: response.data.CheckoutRequestID,
      message: 'Payment request sent. Please check your phone to complete payment.'
    });
    
  } catch (error) {
    // If something went wrong, send error message
    console.error('❌ STK Push Error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: error.response?.data?.errorMessage || 'Payment request failed. Please try again.'
    });
  }
});

// ============================================
// ENDPOINT 2: M-Pesa Callback
// URL: /api/mpesa-callback
// This is where M-Pesa sends payment confirmation
// ============================================

app.post('/api/mpesa-callback', (req, res) => {
  console.log('🔔 M-Pesa Callback received at:', new Date().toISOString());
  
  // The callback data from M-Pesa
  const { Body } = req.body;
  
  // Check if we received valid callback data
  if (Body && Body.stkCallback) {
    const { 
      CheckoutRequestID,  // ID of the transaction
      ResultCode,         // 0 = success, anything else = failure
      ResultDesc,         // Description of result
      CallbackMetadata    // Additional data (amount, receipt number, etc.)
    } = Body.stkCallback;
    
    // Find the transaction in our records
    const transaction = activeTransactions.get(CheckoutRequestID);
    
    if (ResultCode === 0) {
      // Payment was successful!
      
      // Extract metadata (amount, receipt number, etc.)
      const metadata = {};
      if (CallbackMetadata && CallbackMetadata.Item) {
        CallbackMetadata.Item.forEach(item => {
          metadata[item.Name] = item.Value;
        });
      }
      
      console.log('✅ PAYMENT SUCCESSFUL!', {
        checkoutRequestID: CheckoutRequestID,
        amount: metadata.Amount,
        receiptNumber: metadata.MpesaReceiptNumber
      });
      
      // Update transaction status
      if (transaction) {
        transaction.status = 'completed';
        transaction.receiptNumber = metadata.MpesaReceiptNumber;
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
  
  // Always send success response to acknowledge receipt
  res.json({ ResultCode: 0, ResultDesc: 'Success' });
});

// ============================================
// ENDPOINT 3: Check Payment Status
// URL: /api/mpesa/status
// Website can check if payment was completed
// ============================================

app.post('/api/mpesa/status', async (req, res) => {
  const { checkoutRequestID } = req.body;
  
  // First, check if we already know the status from callback
  const localTransaction = activeTransactions.get(checkoutRequestID);
  if (localTransaction && localTransaction.status !== 'pending') {
    return res.json({
      ResultCode: localTransaction.status === 'completed' ? 0 : 1,
      ResultDesc: localTransaction.status === 'completed' ? 'Success' : localTransaction.error,
      ...localTransaction
    });
  }
  
  // If we don't know, ask Safaricom for status
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
    
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to check payment status' });
  }
});

// ============================================
// ENDPOINT 4: Health Check
// URL: /api/health
// Simple endpoint to check if server is running
// ============================================

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: MPESA_CONFIG.environment,
    transactions: activeTransactions.size
  });
});

// ============================================
// Serve Frontend Files
// This sends your HTML file when someone visits your website
// ============================================

app.get('/', (req, res) => {
  // Send the index.html file from your project folder
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ============================================
// START THE SERVER
// ============================================

// Use the port assigned by Render, or 3000 for local development
const PORT = process.env.PORT || 3000;

// Start listening for requests
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📱 Environment: ${MPESA_CONFIG.environment}`);
  console.log(`🌐 Local URL: http://localhost:${PORT}`);
  if (process.env.RENDER_EXTERNAL_HOSTNAME) {
    console.log(`🌍 Production URL: https://${process.env.RENDER_EXTERNAL_HOSTNAME}`);
  }
});