// Cart Routes
import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getCart,
  getCartSummary,
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  initCartController,
} from '../controllers/cartController.js';

const router = express.Router();

// Initialize controller
export const setupCartRoutes = (db) => {
  initCartController(db);
  return router;
};

// All routes require authentication
router.get('/', authenticate, getCart);
router.get('/summary', authenticate, getCartSummary);
router.post('/items', authenticate, addToCart);
router.delete('/items/:cartItemId', authenticate, removeFromCart);
router.put('/items/:cartItemId', authenticate, updateQuantity);
router.delete('/', authenticate, clearCart);

export default router;
