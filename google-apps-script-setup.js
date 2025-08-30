/**
 * GOOGLE APPS SCRIPT SETUP UNTUK JOOCODE SERVICE
 * Copy paste script ini ke Google Apps Script untuk integrasi email real
 */

// Konfigurasi email WhatsApp Support
const WHATSAPP_SUPPORT_EMAIL = "support@whatsapp.com"; // Email resmi WhatsApp support
const FROM_EMAIL = "your-email@gmail.com"; // Ganti dengan email Anda

/**
 * Fungsi utama untuk mengirim email unban request
 */
function sendUnbanEmail(data) {
  try {
    const { number, banType, clientIP, subject, body } = data;
    
    // Validasi data input
    if (!number || !banType || !subject || !body) {
      return {
        success: false,
        error: "Data tidak lengkap"
      };
    }
    
    // Template email berdasarkan jenis banned
    const emailTemplates = {
      'spam': {
        to: WHATSAPP_SUPPORT_EMAIL,
        subject: `WhatsApp Account Appeal - Spam Related Suspension - ${number}`,
        body: `Dear WhatsApp Support Team,

I am writing to request the unbanning of my WhatsApp account that was suspended due to spam-related activities.

Account Details:
- Phone Number: ${number}
- Issue: Account suspended for spam activities
- Request Type: Appeal for account restoration
- Submission IP: ${clientIP}
- Submission Date: ${new Date().toLocaleString()}

I acknowledge that my account was suspended and I understand WhatsApp's terms of service. I assure you that I will comply with all community guidelines moving forward.

I have reviewed the WhatsApp Terms of Service and Community Guidelines, and I commit to:
1. Not sending spam or bulk messages
2. Respecting other users' privacy
3. Following all community standards
4. Using WhatsApp only for legitimate communication

Please review my account and consider restoring access.

Best regards,
Account Holder

This request was submitted through Joocode Service - Professional WhatsApp Recovery Service.`
      },
      
      'permanen tinjau': {
        to: WHATSAPP_SUPPORT_EMAIL,
        subject: `WhatsApp Account Review Request - Permanent Suspension - ${number}`,
        body: `Dear WhatsApp Support Team,

I am requesting a thorough review for my permanently suspended WhatsApp account.

Account Details:
- Phone Number: ${number}
- Issue: Permanent account suspension under review
- Request Type: Account restoration appeal
- Submission IP: ${clientIP}
- Submission Date: ${new Date().toLocaleString()}

I believe this suspension may have been issued in error or due to a misunderstanding. I request a comprehensive review of my account activity and ask for restoration if no actual violations are found.

Account Usage History:
- I have been using WhatsApp for personal/business communication
- I have not engaged in spam or bulk messaging
- I respect all users and community guidelines
- I have not violated any terms of service to my knowledge

I commit to following all WhatsApp community guidelines and terms of service moving forward.

Please conduct a thorough review of my case and consider account restoration.

Respectfully,
Account Holder

This request was submitted through Joocode Service - Professional WhatsApp Recovery Service.`
      },
      
      'permanen hard': {
        to: WHATSAPP_SUPPORT_EMAIL,
        subject: `WhatsApp Account Final Appeal - Hard Ban Review - ${number}`,
        body: `Dear WhatsApp Support Team,

I am submitting a final appeal for my permanently banned WhatsApp account.

Account Details:
- Phone Number: ${number}
- Issue: Permanent hard ban
- Request Type: Final appeal for account restoration
- Submission IP: ${clientIP}
- Submission Date: ${new Date().toLocaleString()}

I understand the serious nature of this suspension and the gravity of a permanent ban. However, I believe there may have been an error in the assessment of my account activity.

Final Appeal Points:
1. I have carefully reviewed all WhatsApp Terms of Service
2. I cannot identify any violations that would warrant a permanent ban
3. I am committed to strict adherence to all platform rules
4. I request one final, comprehensive review of my case

If my account is restored, I commit to:
- Strict compliance with all WhatsApp policies
- Respectful communication with all users
- No engagement in any prohibited activities
- Regular review of community guidelines to ensure compliance

I understand this is my final appeal and respect whatever decision is made after this review.

Thank you for your time and consideration.

Sincerely,
Account Holder

This request was submitted through Joocode Service - Professional WhatsApp Recovery Service.`
      }
    };
    
    // Pilih template berdasarkan jenis ban
    const template = emailTemplates[banType] || emailTemplates['spam'];
    
    // Kirim email menggunakan Gmail API
    MailApp.sendEmail({
      to: template.to,
      subject: template.subject,
      body: template.body,
      replyTo: FROM_EMAIL
    });
    
    // Log untuk monitoring
    console.log(`Email sent for ${number} - ${banType} - IP: ${clientIP}`);
    
    return {
      success: true,
      message: "Email berhasil dikirim ke WhatsApp Support",
      emailSent: {
        to: template.to,
        subject: template.subject,
        timestamp: new Date().toISOString()
      }
    };
    
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Fungsi untuk handle POST request dari website
 */
function doPost(e) {
  try {
    // Parse data dari request
    const data = JSON.parse(e.postData.contents);
    
    // Validasi request
    if (!data.number || !data.banType) {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          error: "Missing required fields: number, banType"
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Kirim email
    const result = sendUnbanEmail(data);
    
    // Return response
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: "Invalid request format: " + error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Fungsi untuk testing (opsional)
 */
function testEmailSending() {
  const testData = {
    number: "+6281234567890",
    banType: "spam",
    clientIP: "127.0.0.1",
    subject: "Test Subject",
    body: "Test Body"
  };
  
  const result = sendUnbanEmail(testData);
  console.log("Test result:", result);
}

/**
 * CARA SETUP:
 * 
 * 1. Buka https://script.google.com
 * 2. Klik "New Project"
 * 3. Copy paste script ini
 * 4. Ganti FROM_EMAIL dengan email Anda
 * 5. Save project dengan nama "WhatsApp Unban Service"
 * 6. Klik "Deploy" > "New Deployment"
 * 7. Choose type: "Web app"
 * 8. Execute as: "Me"
 * 9. Access: "Anyone"
 * 10. Copy Web App URL yang diberikan
 * 11. Ganti GOOGLE_APPS_SCRIPT_URL di server.js dengan URL tersebut
 * 
 * IZIN YANG DIPERLUKAN:
 * - Gmail API untuk mengirim email
 * - Script akan meminta izin saat pertama kali dijalankan
 */