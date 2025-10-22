const Review = require('../models/Review.model');
const Product = require('../models/Product.model');
const Order = require('../models/Order.model');
const CloudinaryConfig = require('../config/cloudinary.config');
const { ErrorHandler } = require('../middleware/error.middleware');

class ReviewService {
  // Create review
  async createReview(userId, reviewData, images = []) {
    try {
      const { productId, rating, title, comment, orderId } = reviewData;

      // Check if product exists
      const product = await Product.findById(productId);
      if (!product) {
        throw new ErrorHandler('Product not found', 404);
      }

      // Check if user has purchased the product
      let isVerifiedPurchase = false;
      if (orderId) {
        const order = await Order.findOne({
          _id: orderId,
          user: userId,
          'items.product': productId,
          orderStatus: 'delivered'
        });
        isVerifiedPurchase = !!order;
      }

      // Upload images
      const uploadedImages = [];
      if (images && images.length > 0) {
        for (const image of images) {
          const result = await CloudinaryConfig.uploadImage(
            `data:${image.mimetype};base64,${image.buffer.toString('base64')}`,
            'reviews'
          );
          uploadedImages.push({
            public_id: result.public_id,
            url: result.url
          });
        }
      }

      // Create review
      const review = await Review.create({
        product: productId,
        user: userId,
        order: orderId,
        rating,
        title,
        comment,
        images: uploadedImages,
        isVerifiedPurchase
      });

      return await review.populate('user', 'firstName lastName avatar');
    } catch (error) {
      if (error.code === 11000) {
        throw new ErrorHandler('You have already reviewed this product', 400);
      }
      throw error;
    }
  }

  // Get product reviews
  async getProductReviews(productId, options = {}) {
    try {
      const { page = 1, limit = 10, sort = '-createdAt', rating } = options;
      const skip = (page - 1) * limit;

      const query = { product: productId, isApproved: true };
      if (rating) {
        query.rating = rating;
      }

      const reviews = await Review.find(query)
        .populate('user', 'firstName lastName avatar')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Review.countDocuments(query);

      // Get rating distribution
      const ratingDistribution = await Review.aggregate([
        { $match: { product: productId, isApproved: true } },
        {
          $group: {
            _id: '$rating',
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: -1 } }
      ]);

      return {
        reviews,
        ratingDistribution,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Update review
  async updateReview(reviewId, userId, updateData, newImages = []) {
    try {
      const review = await Review.findOne({ _id: reviewId, user: userId });

      if (!review) {
        throw new ErrorHandler('Review not found', 404);
      }

      // Upload new images
      if (newImages && newImages.length > 0) {
        const uploadedImages = [];
        for (const image of newImages) {
          const result = await CloudinaryConfig.uploadImage(
            `data:${image.mimetype};base64,${image.buffer.toString('base64')}`,
            'reviews'
          );
          uploadedImages.push({
            public_id: result.public_id,
            url: result.url
          });
        }
        updateData.images = [...(review.images || []), ...uploadedImages];
      }

      Object.assign(review, updateData);
      review.isApproved = false; // Reset approval status
      await review.save();

      return review;
    } catch (error) {
      throw error;
    }
  }

  // Delete review
  async deleteReview(reviewId, userId) {
    try {
      const review = await Review.findOne({ _id: reviewId, user: userId });

      if (!review) {
        throw new ErrorHandler('Review not found', 404);
      }

      // Delete images from Cloudinary
      for (const image of review.images) {
        await CloudinaryConfig.deleteImage(image.public_id);
      }

      await review.remove();

      return { message: 'Review deleted successfully' };
    } catch (error) {
      throw error;
    }
  }

  // Approve review (admin)
  async approveReview(reviewId) {
    try {
      const review = await Review.findById(reviewId);

      if (!review) {
        throw new ErrorHandler('Review not found', 404);
      }

      await review.approve();

      return review;
    } catch (error) {
      throw error;
    }
  }

  // Add vote to review
  async addVote(reviewId, userId, voteType) {
    try {
      const review = await Review.findById(reviewId);

      if (!review) {
        throw new ErrorHandler('Review not found', 404);
      }

      await review.addVote(userId, voteType);

      return review;
    } catch (error) {
      throw error;
    }
  }

  // Add seller response
  async addSellerResponse(reviewId, sellerId, comment) {
    try {
      const review = await Review.findById(reviewId).populate('product');

      if (!review) {
        throw new ErrorHandler('Review not found', 404);
      }

      await review.addSellerResponse(comment);

      return review;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ReviewService();
