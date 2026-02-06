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
  
  // Seed endpoint (protected with secret)
  router.post('/seed-admin', async (req, res) => {
    const { secret } = req.body;
    if (secret !== 'artcraft-seed-2026') {
      return res.status(401).json({ success: false, message: 'Invalid secret' });
    }
    
    try {
      const bcrypt = (await import('bcryptjs')).default;
      
      // Check if admin already exists
      const existingAdmin = await db.User.findOne({
        where: { email: 'admin@artandcraft.com' }
      });
      
      if (existingAdmin) {
        return res.json({ success: true, message: 'Admin user already exists' });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash('Admin@123', 10);
      
      // Create admin user
      await db.User.create({
        name: 'Admin User',
        email: 'admin@artandcraft.com',
        password: hashedPassword,
        userType: 'admin',
        phone: '+1234567890',
        isActive: true,
        isVerified: true,
      });
      
      res.json({ 
        success: true, 
        message: 'Admin user created',
        credentials: {
          email: 'admin@artandcraft.com',
          password: 'Admin@123'
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });
  
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
