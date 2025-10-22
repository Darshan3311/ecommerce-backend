const express = require('express');
const router = express.Router();
const CartController = require('../controllers/Cart.controller');
const AuthMiddleware = require('../middleware/auth.middleware');

// All cart routes require authentication
router.use(AuthMiddleware.protect);

router.get('/', CartController.getCart);
router.post('/add', CartController.addToCart);
router.put('/:productId', CartController.updateCartItem);
router.put('/:productListingId', CartController.updateCartItem); // Backward compatibility
router.delete('/:productId', CartController.removeFromCart);
router.delete('/:productListingId', CartController.removeFromCart); // Backward compatibility
router.delete('/', CartController.clearCart);
router.post('/sync', CartController.syncCart);

module.exports = router;
