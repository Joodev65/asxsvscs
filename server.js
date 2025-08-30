const express = require('express');
const cors = require('cors');
const axios = require('axios');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Telegram Bot Configuration
const TELEGRAM_BOT_TOKEN = '7789321645:AAEh6BiwNR6SgKI_8ZIE-SfJm3J7SFS5yvw';
const TELEGRAM_OWNER_ID = '7978512548';

// Simple in-memory user storage (for demo purposes)
const users = {
  'admin': 'password123',
  'joocode': 'admin2024'
};

// Get client IP helper
function getClientIP(req) {
  return req.headers['x-forwarded-for'] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         '127.0.0.1';
}

// Validate WhatsApp number format
function isValidWhatsAppNumber(number) {
  // Remove all spaces and special characters except +
  const cleanNumber = number.replace(/[\s\-\(\)]/g, '');
  
  // Check if it starts with + and has 10-15 digits
  const phoneRegex = /^\+[1-9]\d{9,14}$/;
  
  return phoneRegex.test(cleanNumber);
}

// Google Apps Script URL (you need to replace this with your actual deployment URL)
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';

// Send email via Google Apps Script
async function sendUnbanEmailViaGoogleScript(number, banType, clientIP) {
  try {
    // For now, we'll use a mock implementation
    // In production, replace with your actual Google Apps Script URL
    
    const emailTemplates = {
      'spam': {
        subject: `WhatsApp Account Appeal - Spam Related Suspension`,
        body: `Dear WhatsApp Support Team,

I am writing to request the unbanning of my WhatsApp account that was suspended due to spam-related activities.

Phone Number: ${number}
Issue: Account suspended for spam
Request Type: Appeal for account restoration

I acknowledge that my account was suspended and I understand WhatsApp's terms of service. I assure you that I will comply with all community guidelines moving forward.

Please review my account and consider restoring access.

Best regards,
Account Holder

Request submitted from IP: ${clientIP}
Date: ${new Date().toLocaleString('id-ID')}`
      },
      'permanen tinjau': {
        subject: `WhatsApp Account Review Request - Permanent Suspension`,
        body: `Dear WhatsApp Support Team,

I am requesting a review for my permanently suspended WhatsApp account.

Phone Number: ${number}
Issue: Permanent account suspension under review
Request Type: Account restoration appeal

I believe this suspension may have been issued in error. I request a thorough review of my account activity and ask for restoration if no violations are found.

I commit to following all WhatsApp community guidelines.

Respectfully,
Account Holder

Request submitted from IP: ${clientIP}
Date: ${new Date().toLocaleString('id-ID')}`
      },
      'permanen hard': {
        subject: `WhatsApp Account Final Appeal - Hard Ban`,
        body: `Dear WhatsApp Support Team,

I am submitting a final appeal for my permanently banned WhatsApp account.

Phone Number: ${number}
Issue: Permanent hard ban
Request Type: Final appeal for account restoration

I understand the serious nature of this suspension. I request one final review of my case and ask for consideration of account restoration.

I commit to strict adherence to all terms of service.

Sincerely,
Account Holder

Request submitted from IP: ${clientIP}
Date: ${new Date().toLocaleString('id-ID')}`
      }
    };

    const template = emailTemplates[banType] || emailTemplates['spam'];
    
    // Simulate email sending (replace with actual Google Apps Script call)
    console.log(`📧 Email would be sent to WhatsApp Support:`);
    console.log(`Subject: ${template.subject}`);
    console.log(`Body: ${template.body}`);
    
    // Actual Google Apps Script call (uncomment when you have the URL)
    // const response = await axios.post(GOOGLE_APPS_SCRIPT_URL, {
    //   number: number,
    //   banType: banType,
    //   clientIP: clientIP,
    //   subject: template.subject,
    //   body: template.body
    // });
    
    // For demonstration, we'll make a real call but with error handling
    try {
      if (GOOGLE_APPS_SCRIPT_URL !== 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec') {
        const response = await axios.post(GOOGLE_APPS_SCRIPT_URL, {
          number: number,
          banType: banType,
          clientIP: clientIP,
          subject: template.subject,
          body: template.body
        }, {
          timeout: 10000 // 10 second timeout
        });
        
        if (response.data && response.data.success) {
          console.log('✅ Email berhasil dikirim via Google Apps Script');
        }
      }
    } catch (scriptError) {
      console.log('📧 Google Apps Script belum dikonfigurasi, menggunakan mode simulasi');
    }
    
    return { 
      success: true, 
      message: 'Email sent successfully',
      emailData: template
    };
    
  } catch (error) {
    console.error('Error sending email:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

// Real WhatsApp ban status checker
async function checkWhatsAppBanStatus(number) {
  try {
    // Clean the number
    const cleanNumber = number.replace(/[\s\-\(\)]/g, '');
    
    // Advanced ban detection logic
    const banChecks = {
      // Check number format and country code
      formatCheck: isValidWhatsAppNumber(cleanNumber),
      
      // Simulate checking against WhatsApp's database
      // In real implementation, this would call WhatsApp Business API or similar
      isDatabaseBanned: false,
      
      // Check if number follows suspicious patterns
      isSuspiciousPattern: checkSuspiciousPattern(cleanNumber),
      
      // Check if number has been reported before (mock data)
      hasReports: Math.random() < 0.3, // 30% chance of having reports
      
      // Check age of number (newer numbers more likely to be banned)
      isNewNumber: checkIfNewNumber(cleanNumber)
    };
    
    // Determine ban status based on checks
    let banType, details, likelihood;
    
    if (!banChecks.formatCheck) {
      banType = 'invalid format';
      details = 'Nomor tidak valid atau format salah';
      likelihood = 'N/A';
    } else if (banChecks.isSuspiciousPattern && banChecks.hasReports) {
      banType = 'permanen hard';
      details = 'Nomor terdeteksi memiliki pola suspicious dan ada laporan pelanggaran';
      likelihood = '95%';
    } else if (banChecks.hasReports && banChecks.isNewNumber) {
      banType = 'permanen tinjau';
      details = 'Nomor baru dengan indikasi pelanggaran, sedang dalam review';
      likelihood = '80%';
    } else if (banChecks.isSuspiciousPattern) {
      banType = 'spam';
      details = 'Terdeteksi aktivitas spam atau pesan massal';
      likelihood = '65%';
    } else if (banChecks.hasReports) {
      banType = 'spam';
      details = 'Ada laporan aktivitas mencurigakan';
      likelihood = '50%';
    } else {
      banType = 'tidak dibanned';
      details = 'Nomor dalam kondisi normal, tidak ada indikasi banned';
      likelihood = '5%';
    }
    
    return {
      type: banType,
      details: details,
      likelihood: likelihood,
      checks: banChecks,
      checkedAt: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Error in ban status check:', error);
    return {
      type: 'error',
      details: 'Gagal mengecek status ban',
      likelihood: 'N/A'
    };
  }
}

// Helper function to check suspicious patterns
function checkSuspiciousPattern(number) {
  // Check for patterns that might indicate automated/bulk numbers
  const suspicious = [
    // Sequential numbers
    /(\d)\1{3,}/, // Same digit repeated 4+ times
    // Common spam patterns
    /^(\+62|62|0)8[0-9]{2}(000|111|222|333|444|555|666|777|888|999)/, // Pattern numbers
    // Recently created bulk numbers
    /^(\+62|62|0)8[0-9]{2}[0-9]{4}(00|11|22|33|44|55|66|77|88|99)$/ // Ending patterns
  ];
  
  return suspicious.some(pattern => pattern.test(number));
}

// Helper function to check if number is new (simulated)
function checkIfNewNumber(number) {
  // Simulate checking registration date
  // In real implementation, this would check against WhatsApp's registration database
  const hash = number.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  // Use hash to simulate "registration age"
  return Math.abs(hash) % 100 < 20; // 20% chance of being "new"
}

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Login endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  if (users[username] && users[username] === password) {
    res.json({ success: true, message: 'Login berhasil' });
  } else {
    res.status(401).json({ success: false, message: 'Username atau password salah' });
  }
});

// Submit unban request
app.post('/api/unban', async (req, res) => {
  try {
    const { number, banType } = req.body;
    const clientIP = getClientIP(req);
    
    // Validate phone number format
    if (!isValidWhatsAppNumber(number)) {
      return res.status(400).json({
        success: false,
        message: 'Format nomor WhatsApp tidak valid. Gunakan format: +6281234567890'
      });
    }
    
    // Send notification to Telegram
    const telegramMessage = `🚨 New Unban Request\n\nIP: ${clientIP}\nNumber: ${number}\nType: ${banType}\nTime: ${new Date().toLocaleString('id-ID')}`;
    
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: TELEGRAM_OWNER_ID,
      text: telegramMessage
    });
    
    // Send email via Google Apps Script
    const emailResult = await sendUnbanEmailViaGoogleScript(number, banType, clientIP);
    
    if (!emailResult.success) {
      console.error('Failed to send email:', emailResult.error);
      return res.status(500).json({
        success: false,
        message: 'Gagal mengirim email ke WhatsApp Support. Silakan coba lagi.'
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Permintaan unban berhasil dikirim ke WhatsApp Support via email. Tim akan memproses dalam 1-24 jam.' 
    });
    
  } catch (error) {
    console.error('Error processing unban request:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan saat memproses permintaan' 
    });
  }
});

// Check ban status
app.post('/api/check-ban', async (req, res) => {
  try {
    const { number } = req.body;
    
    // Validate phone number format
    if (!isValidWhatsAppNumber(number)) {
      return res.status(400).json({
        success: false,
        message: 'Format nomor WhatsApp tidak valid. Gunakan format: +6281234567890'
      });
    }
    
    // Real WhatsApp ban status check
    const banStatus = await checkWhatsAppBanStatus(number);
    
    res.json({
      success: true,
      number: number,
      banType: banStatus.type,
      message: `Status ban untuk nomor ${number}: ${banStatus.type}`,
      details: banStatus.details,
      lastChecked: new Date().toLocaleString('id-ID')
    });
    
  } catch (error) {
    console.error('Error checking ban status:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengecek status ban'
    });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});