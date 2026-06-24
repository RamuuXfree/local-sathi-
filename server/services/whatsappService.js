/**
 * WhatsApp Notification Service — Placeholder
 * 
 * This service is a placeholder for WhatsApp Business API integration.
 * To activate, integrate with:
 * - Twilio WhatsApp API (twilio.com/whatsapp)
 * - Meta WhatsApp Business API
 * - Gupshup / Kaleyra (popular in India)
 */

let whatsappClient = null;

const initWhatsApp = () => {
  try {
    if (
      process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_ACCOUNT_SID !== 'your_twilio_account_sid'
    ) {
      const twilio = require('twilio');
      whatsappClient = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
      console.log('✅ WhatsApp service initialized via Twilio');
    } else {
      console.log('⚠️  WhatsApp not configured — WA notifications disabled');
    }
  } catch (error) {
    console.error('❌ WhatsApp init error:', error.message);
  }
};

/**
 * Send WhatsApp message
 * @param {string} to - Recipient phone (E.164 format)
 * @param {string} message - Message body
 */
const sendWhatsApp = async (to, message) => {
  const waTo = `whatsapp:${to}`;
  const waFrom = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

  if (!whatsappClient) {
    console.log(`[WHATSAPP MOCK] To: ${waTo} | Message: ${message}`);
    return { success: true, mock: true };
  }

  try {
    const result = await whatsappClient.messages.create({
      body: message,
      from: waFrom,
      to: waTo,
    });
    console.log(`✅ WhatsApp sent to ${to}: ${result.sid}`);
    return { success: true, sid: result.sid };
  } catch (error) {
    console.error(`❌ WhatsApp error to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send booking confirmation on WhatsApp
 */
const sendBookingConfirmationWA = async (phone, bookingDetails) => {
  const message = `🙏 *LocalSaathi Booking Confirmed!*\n\n` +
    `📋 Booking ID: #${bookingDetails.bookingId}\n` +
    `🔧 Service: ${bookingDetails.service}\n` +
    `📅 Date: ${bookingDetails.date}\n` +
    `🕐 Time: ${bookingDetails.time}\n` +
    `📍 Address: ${bookingDetails.address}\n\n` +
    `We'll notify you when your provider confirms. Thank you for choosing LocalSaathi! 🏠`;
  return await sendWhatsApp(phone, message);
};

/**
 * Send booking status update on WhatsApp
 */
const sendBookingStatusWA = async (phone, status, bookingDetails) => {
  const emoji = { accepted: '✅', rejected: '❌', completed: '⭐', cancelled: '🚫' };
  const message = `${emoji[status] || '🔔'} *LocalSaathi Booking Update*\n\n` +
    `Your booking for *${bookingDetails.service}* has been *${status.toUpperCase()}*.\n\n` +
    `Track your bookings on the LocalSaathi app.`;
  return await sendWhatsApp(phone, message);
};

module.exports = {
  initWhatsApp,
  sendWhatsApp,
  sendBookingConfirmationWA,
  sendBookingStatusWA,
};
