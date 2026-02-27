// Review Service
export class ReviewService {
  constructor(db) {
    this.Review = db.Review;
    this.Product = db.Product;
    this.User = db.User;
    this.Order = db.Order;
  }

  async createReview(userId, productId, reviewData) {
    const { rating, title, comment } = reviewData;

    // Verify user has purchased product
    const purchase = await this.Order.findOne({
      where: { userId },
      include: [
        {
          model: this.Product.sequelize.models.OrderItem,
          where: { productId },
        },
      ],
    });

    if (!purchase && process.env.NODE_ENV === 'production') {
      throw { statusCode: 403, message: 'Can only review purchased products', code: 'NOT_PURCHASED' };
    }

    const review = await this.Review.create({
      productId,
      userId,
      rating,
      title,
      comment,
      isVerifiedPurchase: !!purchase,
      orderId: purchase?.id,
    });

    // Update product rating
    await this.updateProductRating(productId);

    return this.getReviewById(review.id);
  }

  async getProductReviews(productId, page = 1, perPage = 10) {
    const offset = (page - 1) * perPage;

    const { count, rows } = await this.Review.findAndCountAll({
      where: { productId },
      include: [
        { model: this.User, attributes: ['id', 'name', 'profileImage'] },
      ],
      offset,
      limit: perPage,
      order: [['createdAt', 'DESC']],
    });

    return {
      reviews: rows,
      pagination: {
        page,
        perPage,
        total: count,
        pages: Math.ceil(count / perPage),
      },
    };
  }

  async getReviewById(reviewId) {
    const review = await this.Review.findByPk(reviewId, {
      include: [
        { model: this.User, attributes: ['id', 'name', 'profileImage'] },
        { model: this.Product, attributes: ['id', 'name'] },
      ],
    });

    if (!review) {
      throw { statusCode: 404, message: 'Review not found', code: 'NOT_FOUND' };
    }

    return review;
  }

  async updateReview(reviewId, userId, updateData) {
    const review = await this.Review.findByPk(reviewId);

    if (!review) {
      throw { statusCode: 404, message: 'Review not found', code: 'NOT_FOUND' };
    }

    if (review.userId !== userId) {
      throw { statusCode: 403, message: 'Unauthorized', code: 'FORBIDDEN' };
    }

    const allowedFields = ['rating', 'title', 'comment'];
    const dataToUpdate = {};

    allowedFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        dataToUpdate[field] = updateData[field];
      }
    });

    await review.update(dataToUpdate);

    // Update product rating
    await this.updateProductRating(review.productId);

    return this.getReviewById(reviewId);
  }

  async deleteReview(reviewId, userId) {
    const review = await this.Review.findByPk(reviewId);

    if (!review) {
      throw { statusCode: 404, message: 'Review not found', code: 'NOT_FOUND' };
    }

    if (review.userId !== userId) {
      throw { statusCode: 403, message: 'Unauthorized', code: 'FORBIDDEN' };
    }

    const productId = review.productId;
    await review.destroy();

    // Update product rating
    await this.updateProductRating(productId);

    return { message: 'Review deleted successfully' };
  }

  async markHelpful(reviewId) {
    const review = await this.Review.findByPk(reviewId);

    if (!review) {
      throw { statusCode: 404, message: 'Review not found', code: 'NOT_FOUND' };
    }

    await review.increment('helpfulCount');
    return review;
  }

  async updateProductRating(productId) {
    const product = await this.Product.findByPk(productId);

    if (!product) return;

    const reviews = await this.Review.findAll({ where: { productId } });
    const totalReviews = reviews.length;

    if (totalReviews === 0) {
      await product.update({ rating: 0, totalReviews: 0 });
      return;
    }

    const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;

    await product.update({
      rating: parseFloat(averageRating.toFixed(2)),
      totalReviews,
    });
  }
}
