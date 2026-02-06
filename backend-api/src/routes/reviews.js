// Review Routes
import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  createReview,
  getProductReviews,
  updateReview,
  deleteReview,
  markHelpful,
  initReviewController,
} from '../controllers/reviewController.js';

const router = express.Router();

// Initialize controller
export const setupReviewRoutes = (db) => {
  initReviewController(db);
  return router;
};

// Public routes
router.get('/products/:productId', getProductReviews);

// Authenticated routes
router.post('/products/:productId', authenticate, createReview);
router.put('/:reviewId', authenticate, updateReview);
router.delete('/:reviewId', authenticate, deleteReview);
router.post('/:reviewId/helpful', markHelpful);

export default router;
