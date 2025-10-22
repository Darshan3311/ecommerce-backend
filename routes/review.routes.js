const express = require('express');
const router = express.Router();
const ReviewController = require('../controllers/Review.controller');
const AuthMiddleware = require('../middleware/auth.middleware');
const UploadMiddleware = require('../middleware/upload.middleware');
const ValidationMiddleware = require('../middleware/validation.middleware');

// Public routes
router.get('/product/:productId', ReviewController.getProductReviews);

// Protected routes
router.post(
  '/',
  AuthMiddleware.protect,
  UploadMiddleware.multiple('images', 3),
  ValidationMiddleware.createReview,
  ReviewController.createReview
);

router.put(
  '/:id',
  AuthMiddleware.protect,
  UploadMiddleware.multiple('images', 3),
  ReviewController.updateReview
);

router.delete('/:id', AuthMiddleware.protect, ReviewController.deleteReview);

router.post('/:id/vote', AuthMiddleware.protect, ReviewController.addVote);

// Seller routes
router.post(
  '/:id/response',
  AuthMiddleware.protect,
  AuthMiddleware.authorize('seller'),
  ReviewController.addSellerResponse
);

// Admin routes
router.put(
  '/:id/approve',
  AuthMiddleware.protect,
  AuthMiddleware.authorize('admin'),
  ReviewController.approveReview
);

module.exports = router;
