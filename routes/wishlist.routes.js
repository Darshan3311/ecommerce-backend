const express = require('express');
const router = express.Router();
const WishlistController = require('../controllers/Wishlist.controller');
const AuthMiddleware = require('../middleware/auth.middleware');

// All wishlist routes require authentication
router.use(AuthMiddleware.protect);

// Get user's wishlist
router.get('/', WishlistController.getWishlist);

// Add item to wishlist
router.post('/', WishlistController.addToWishlist);

// Remove item from wishlist
router.delete('/:productId', WishlistController.removeFromWishlist);

// Clear wishlist
router.delete('/', WishlistController.clearWishlist);

// Move item from wishlist to cart
router.post('/:productId/move-to-cart', WishlistController.moveToCart);

module.exports = router;
