// Order Routes
import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  createOrder,
  getOrders,
  getOrderById,
  getOrderByIdAdmin,
  updateOrderStatus,
  updateOrderStatusAdmin,
  cancelOrder,
  getVendorOrders,
  getAllOrders,
  initOrderController,
} from '../controllers/orderController.js';

const router = express.Router();

// Initialize controller
export const setupOrderRoutes = (db) => {
  initOrderController(db);

  // Admin routes (must be before /:id to avoid matching admin as an ID)
  router.get('/admin/all', authenticate, authorize('admin'), getAllOrders);
  router.get('/admin/:id', authenticate, authorize('admin'), getOrderByIdAdmin);
  router.put('/admin/:id/status', authenticate, authorize('admin'), updateOrderStatusAdmin);

  // Customer routes
  router.post('/', authenticate, createOrder);
  router.get('/', authenticate, getOrders);
  router.get('/:id', authenticate, getOrderById);
  router.put('/:id/cancel', authenticate, cancelOrder);

  // Vendor routes
  router.get('/vendor/orders', authenticate, authorize('vendor'), getVendorOrders);
  router.put('/:id/status', authenticate, authorize('vendor'), updateOrderStatus);

  return router;
};

export default router;
