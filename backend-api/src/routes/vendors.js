// Vendor Routes
import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  registerVendor,
  getVendors,
  getVendorById,
  updateVendor,
  approveVendor,
  rejectVendor,
  suspendVendor,
  getVendorStats,
  updateCommissionRate,
  initVendorController,
} from '../controllers/vendorController.js';

const router = express.Router();

// Initialize controller
export const setupVendorRoutes = (db) => {
  initVendorController(db);
  return router;
};

// Public routes
router.post('/register', registerVendor);
router.get('/', getVendors);
router.get('/:id', getVendorById);

// Vendor routes
router.put('/', authenticate, authorize('vendor'), updateVendor);
router.get('/stats', authenticate, authorize('vendor'), getVendorStats);

// Admin routes
router.put('/:id/approve', authenticate, authorize('admin'), approveVendor);
router.put('/:id/reject', authenticate, authorize('admin'), rejectVendor);
router.put('/:id/suspend', authenticate, authorize('admin'), suspendVendor);
router.put('/:id/commission', authenticate, authorize('admin'), updateCommissionRate);

export default router;
