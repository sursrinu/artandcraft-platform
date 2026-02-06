// Main API routes
import express from 'express';
import authRoutes from './auth.js';
import productRoutes from './products.js';
import orderRoutes, { setupOrderRoutes } from './orders.js';
import vendorRoutes, { setupVendorRoutes } from './vendors.js';
import cartRoutes, { setupCartRoutes } from './cart.js';
import reviewRoutes, { setupReviewRoutes } from './reviews.js';
import usersRoutes from './users.js';
import categoriesRoutes from './categories.js';
import { setupPayoutRoutes, setupBankAccountRoutes } from './payoutRoutes.js';
import { setupPaymentRoutes } from './payments.js';

const router = express.Router();

// Initialize routes with database
export const setupRoutes = (db) => {
  const ordersRouter = setupOrderRoutes(db);
  const vendorsRouter = setupVendorRoutes(db);
  const cartRouter = setupCartRoutes(db);
  const reviewsRouter = setupReviewRoutes(db);
  const payoutsRouter = setupPayoutRoutes(db);
  const bankAccountsRouter = setupBankAccountRoutes(db);
  const paymentsRouter = setupPaymentRoutes(db);
  
  router.use('/auth', authRoutes);
  router.use('/users', usersRoutes);
  router.use('/categories', categoriesRoutes);
  router.use('/products', productRoutes);
  router.use('/orders', ordersRouter);
  router.use('/vendors', vendorsRouter);
  router.use('/cart', cartRouter);
  router.use('/reviews', reviewsRouter);
  router.use('/payouts', payoutsRouter);
  router.use('/bank-accounts', bankAccountsRouter);
  router.use('/payments', paymentsRouter);
  
  return router;
};

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'API is healthy',
    timestamp: new Date().toISOString(),
  });
});

export default router;
