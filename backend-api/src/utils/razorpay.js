// Razorpay integration utility
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Create a Razorpay order
 * @param {number} amount - Amount in INR (not paise)
 * @param {string} currency - Currency (default 'INR')
 * @returns {Promise<object>} Razorpay order object
 */
async function createRazorpayOrder(amount, currency = 'INR') {
  const options = {
    amount: Math.round(amount * 100), // Razorpay expects paise
    currency,
    receipt: `order_rcptid_${Date.now()}`,
    payment_capture: 1,
  };
  return await razorpay.orders.create(options);
}

module.exports = { createRazorpayOrder };
