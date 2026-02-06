// Routes for Vendor Payouts and Bank Accounts
import express from 'express';
import {
  calculatePayout,
  requestPayout,
  getVendorPayouts,
  getAllPayouts,
  getPayoutById,
  updatePayoutStatus,
  addDeduction,
  cancelPayout,
  getPayoutStats,
  addBankAccount,
  getBankAccounts,
  updateBankAccount,
  setPrimaryBankAccount,
  deleteBankAccount,
  verifyBankAccount,
  initPayoutController,
} from '../controllers/payoutController.js';
import { authenticate, authorize } from '../middleware/auth.js';

export const setupPayoutRoutes = (db) => {
  const router = express.Router();
  
  // Initialize controller with db
  initPayoutController(db);

  // Payout calculation and creation (vendor)
  router.post('/calculate', authenticate, calculatePayout);
  router.post('/', authenticate, requestPayout);

  // Admin endpoints - MUST come before /:payoutId routes
  router.get('/all', authenticate, authorize('admin'), getAllPayouts);
  
  // Payout statistics
  router.get('/stats', authenticate, getPayoutStats);

  // Vendor payout history
  router.get('/', authenticate, getVendorPayouts);

  // Get payout details - MUST come after /all and /stats
  router.get('/:payoutId', authenticate, getPayoutById);

  router.put('/:payoutId/status', authenticate, authorize('admin'), updatePayoutStatus);
  router.post('/:payoutId/deductions', authenticate, authorize('admin'), addDeduction);
  router.put('/:payoutId/cancel', authenticate, cancelPayout);

  return router;
};

export const setupBankAccountRoutes = (db) => {
  const router = express.Router();
  
  // Initialize controller with db
  initPayoutController(db);

  // Bank account management (vendor)
  router.post('/', authenticate, addBankAccount);
  router.get('/', authenticate, getBankAccounts);
  router.put('/:accountId', authenticate, updateBankAccount);
  router.put('/:accountId/primary', authenticate, setPrimaryBankAccount);
  router.delete('/:accountId', authenticate, deleteBankAccount);

  // Admin verification
  router.put('/:accountId/verify', authenticate, authorize(['admin']), verifyBankAccount);

  return router;
};
