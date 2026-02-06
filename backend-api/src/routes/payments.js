// Razorpay Payment Routes
import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Initialize Razorpay instance - will be set up in setupPaymentRoutes
let razorpay = null;
let db = null;

/**
 * Setup payment routes with database instance
 */
export const setupPaymentRoutes = (database) => {
  db = database;
  
  // Initialize Razorpay
  // TODO: Replace with your actual Razorpay credentials from dashboard
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_YOUR_KEY_ID',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'YOUR_KEY_SECRET',
  });

  return router;
};

/**
 * Create a Razorpay order
 * POST /api/payments/razorpay/create-order
 */
router.post('/razorpay/create-order', authenticateToken, async (req, res) => {
  try {
    const { orderId, amount, currency = 'INR' } = req.body;

    if (!orderId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'orderId and amount are required',
      });
    }

    // Verify the order exists and belongs to the user
    const order = await db.Order.findOne({
      where: {
        id: orderId,
        userId: req.user.id,
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: amount, // Amount in paise
      currency: currency,
      receipt: `order_${orderId}`,
      notes: {
        orderId: orderId.toString(),
        userId: req.user.id.toString(),
      },
    });

    // Store Razorpay order ID in payment record
    await db.Payment.create({
      orderId: orderId,
      razorpayOrderId: razorpayOrder.id,
      amount: amount / 100, // Store in rupees
      currency: currency,
      status: 'created',
    });

    res.json({
      success: true,
      data: {
        id: razorpayOrder.id,
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        receipt: razorpayOrder.receipt,
        status: razorpayOrder.status,
      },
    });
  } catch (error) {
    console.error('Razorpay create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order',
      error: error.message,
    });
  }
});

/**
 * Verify Razorpay payment signature
 * POST /api/payments/razorpay/verify
 */
router.post('/razorpay/verify', authenticateToken, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      order_id,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment verification parameters',
      });
    }

    // Verify signature using HMAC SHA256
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'YOUR_KEY_SECRET')
      .update(body)
      .digest('hex');

    const isSignatureValid = expectedSignature === razorpay_signature;

    if (!isSignatureValid) {
      // Update payment record as failed
      await db.Payment.update(
        { status: 'failed', failureReason: 'Invalid signature' },
        { where: { razorpayOrderId: razorpay_order_id } }
      );

      return res.status(400).json({
        success: false,
        message: 'Payment verification failed - invalid signature',
      });
    }

    // Update payment record
    const payment = await db.Payment.findOne({
      where: { razorpayOrderId: razorpay_order_id },
    });

    if (payment) {
      await payment.update({
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: 'captured',
        paidAt: new Date(),
      });

      // Update order status
      await db.Order.update(
        {
          paymentStatus: 'paid',
          status: 'confirmed',
        },
        { where: { id: payment.orderId } }
      );
    }

    res.json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        paymentId: razorpay_payment_id,
        orderId: order_id || payment?.orderId,
      },
    });
  } catch (error) {
    console.error('Razorpay verify error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message,
    });
  }
});

/**
 * Handle Razorpay webhook events
 * POST /api/payments/razorpay/webhook
 */
router.post('/razorpay/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'YOUR_WEBHOOK_SECRET';
    const signature = req.headers['x-razorpay-signature'];

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (signature !== expectedSignature) {
      return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
    }

    const event = req.body;
    const eventType = event.event;

    console.log('Razorpay webhook event:', eventType);

    switch (eventType) {
      case 'payment.authorized':
        // Payment authorized but not captured
        console.log('Payment authorized:', event.payload.payment.entity.id);
        break;

      case 'payment.captured':
        // Payment successfully captured
        const paymentEntity = event.payload.payment.entity;
        await db.Payment.update(
          {
            razorpayPaymentId: paymentEntity.id,
            status: 'captured',
            paidAt: new Date(),
          },
          { where: { razorpayOrderId: paymentEntity.order_id } }
        );
        break;

      case 'payment.failed':
        // Payment failed
        const failedPayment = event.payload.payment.entity;
        await db.Payment.update(
          {
            status: 'failed',
            failureReason: failedPayment.error_description || 'Payment failed',
          },
          { where: { razorpayOrderId: failedPayment.order_id } }
        );
        break;

      case 'refund.created':
        // Refund initiated
        console.log('Refund created:', event.payload.refund.entity.id);
        break;

      default:
        console.log('Unhandled webhook event:', eventType);
    }

    res.json({ success: true, received: true });
  } catch (error) {
    console.error('Razorpay webhook error:', error);
    res.status(500).json({ success: false, message: 'Webhook processing failed' });
  }
});

/**
 * Initiate a refund
 * POST /api/payments/razorpay/refund
 */
router.post('/razorpay/refund', authenticateToken, async (req, res) => {
  try {
    const { orderId, amount, reason } = req.body;

    // Find the payment record
    const payment = await db.Payment.findOne({
      where: { orderId },
      include: [{ model: db.Order, where: { userId: req.user.id } }],
    });

    if (!payment || !payment.razorpayPaymentId) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found for this order',
      });
    }

    // Calculate refund amount (in paise)
    const refundAmount = amount ? amount * 100 : payment.amount * 100;

    // Create refund via Razorpay
    const refund = await razorpay.payments.refund(payment.razorpayPaymentId, {
      amount: refundAmount,
      notes: {
        reason: reason || 'Customer requested refund',
        orderId: orderId.toString(),
      },
    });

    // Update payment record
    await payment.update({
      refundId: refund.id,
      refundAmount: refundAmount / 100,
      refundStatus: 'initiated',
      refundedAt: new Date(),
    });

    // Update order status
    await db.Order.update(
      { status: 'refund_initiated' },
      { where: { id: orderId } }
    );

    res.json({
      success: true,
      message: 'Refund initiated successfully',
      data: {
        refundId: refund.id,
        amount: refundAmount / 100,
        status: refund.status,
      },
    });
  } catch (error) {
    console.error('Razorpay refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate refund',
      error: error.message,
    });
  }
});

export default router;
