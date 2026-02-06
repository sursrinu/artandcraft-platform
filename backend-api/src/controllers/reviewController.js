// Review Controller
import { ReviewService } from '../services/reviewService.js';

let reviewService;

export const initReviewController = (db) => {
  reviewService = new ReviewService(db);
};

export const createReview = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.params;
    const { rating, title, comment } = req.body;
    
    const review = await reviewService.createReview(userId, parseInt(productId), {
      rating: parseInt(rating),
      title,
      comment,
    });
    
    res.status(201).json({
      success: true,
      data: review,
      message: 'Review created successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { page = 1, per_page = 10 } = req.query;
    
    const result = await reviewService.getProductReviews(
      parseInt(productId),
      parseInt(page),
      parseInt(per_page)
    );
    
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateReview = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { reviewId } = req.params;
    const updateData = req.body;
    
    const review = await reviewService.updateReview(parseInt(reviewId), userId, updateData);
    
    res.status(200).json({
      success: true,
      data: review,
      message: 'Review updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { reviewId } = req.params;
    
    const result = await reviewService.deleteReview(parseInt(reviewId), userId);
    
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const markHelpful = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    
    const review = await reviewService.markHelpful(parseInt(reviewId));
    
    res.status(200).json({
      success: true,
      data: review,
      message: 'Marked as helpful',
    });
  } catch (error) {
    next(error);
  }
};
