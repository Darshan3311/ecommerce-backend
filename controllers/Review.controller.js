const ReviewService = require('../services/Review.service');

class ReviewController {
  // Create review
  async createReview(req, res, next) {
    try {
      const images = req.files || [];
      const review = await ReviewService.createReview(req.user._id, req.body, images);

      res.status(201).json({
        status: 'success',
        data: { review }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get product reviews
  async getProductReviews(req, res, next) {
    try {
      const result = await ReviewService.getProductReviews(
        req.params.productId,
        req.query
      );

      res.status(200).json({
        status: 'success',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Update review
  async updateReview(req, res, next) {
    try {
      const images = req.files || [];
      const review = await ReviewService.updateReview(
        req.params.id,
        req.user._id,
        req.body,
        images
      );

      res.status(200).json({
        status: 'success',
        data: { review }
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete review
  async deleteReview(req, res, next) {
    try {
      const result = await ReviewService.deleteReview(req.params.id, req.user._id);

      res.status(200).json({
        status: 'success',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Approve review (admin)
  async approveReview(req, res, next) {
    try {
      const review = await ReviewService.approveReview(req.params.id);

      res.status(200).json({
        status: 'success',
        data: { review }
      });
    } catch (error) {
      next(error);
    }
  }

  // Add vote to review
  async addVote(req, res, next) {
    try {
      const { voteType } = req.body;
      const review = await ReviewService.addVote(
        req.params.id,
        req.user._id,
        voteType
      );

      res.status(200).json({
        status: 'success',
        data: { review }
      });
    } catch (error) {
      next(error);
    }
  }

  // Add seller response
  async addSellerResponse(req, res, next) {
    try {
      const { comment } = req.body;
      const review = await ReviewService.addSellerResponse(
        req.params.id,
        req.user.seller,
        comment
      );

      res.status(200).json({
        status: 'success',
        data: { review }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReviewController();
