/**
 * Twilio SMS Notification Service
 * Sends SMS notifications for booking events
 */

let twilioClient = null;

const initTwilio = () => {
  try {
    if (
      process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_ACCOUNT_SID !== 'your_twilio_account_sid'
    ) {
      const twilio = require('twilio');
      twilioClient = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
      console.log('✅ Twilio SMS service initialized');
    } else {
      console.log('⚠️  Twilio not configured — SMS notifications disabled');
    }
  } catch (error) {
    console.error('❌ Twilio init error:', error.message);
  }
};

/**
 * Send SMS via Twilio
 * @param {string} to - Recipient phone number (E.164 format, e.g., +919876543210)
 * @param {string} message - SMS message body
 */
const sendSMS = async (to, message) => {
  if (!twilioClient) {
    console.log(`[SMS MOCK] To: ${to} | Message: ${message}`);
    return { success: true, mock: true };
  }

  try {
    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });
    console.log(`✅ SMS sent to ${to}: ${result.sid}`);
    return { success: true, sid: result.sid };
  } catch (error) {
    console.error(`❌ SMS send error to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send booking confirmation SMS to user
 */
const sendBookingConfirmationSMS = async (userPhone, bookingDetails) => {
  const message = `🙏 LocalSaathi: Your booking #${bookingDetails.bookingId} for ${bookingDetails.service} has been created successfully! Date: ${bookingDetails.date}, Time: ${bookingDetails.time}. We'll notify you when the provider confirms.`;
  return await sendSMS(userPhone, message);
};

/**
 * Send new booking alert SMS to provider
 */
const sendNewBookingAlertSMS = async (providerPhone, bookingDetails) => {
  const message = `🔔 LocalSaathi: New booking request! Service: ${bookingDetails.service}, Customer: ${bookingDetails.customerName}, Date: ${bookingDetails.date}, Time: ${bookingDetails.time}. Login to accept or reject.`;
  return await sendSMS(providerPhone, message);
};

/**
 * Send booking status update SMS to user
 */
const sendBookingStatusSMS = async (userPhone, status, bookingDetails) => {
  const statusMessages = {
    accepted: `✅ LocalSaathi: Your booking for ${bookingDetails.service} has been ACCEPTED! The provider will arrive on ${bookingDetails.date} at ${bookingDetails.time}.`,
    rejected: `❌ LocalSaathi: Your booking for ${bookingDetails.service} has been declined. Please try booking another provider.`,
    completed: `⭐ LocalSaathi: Your service booking for ${bookingDetails.service} is now completed. Please leave a review!`,
    cancelled: `🚫 LocalSaathi: Your booking for ${bookingDetails.service} has been cancelled.`,
  };
  const message = statusMessages[status] || `LocalSaathi: Your booking status has been updated to: ${status}`;
  return await sendSMS(userPhone, message);
};

module.exports = {
  initTwilio,
  sendSMS,
  sendBookingConfirmationSMS,
  sendNewBookingAlertSMS,
  sendBookingStatusSMS,
};
