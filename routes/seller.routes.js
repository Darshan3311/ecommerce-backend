const express = require('express');
const router = express.Router();
const SellerController = require('../controllers/Seller.controller');
const AuthMiddleware = require('../middleware/auth.middleware');

// Public routes
router.post('/register', SellerController.registerSeller);

// Protected routes - Seller only
router.use(AuthMiddleware.protect);

router.get('/profile', SellerController.getSellerProfile);
router.put('/profile', SellerController.updateSellerProfile);
router.get('/stats', SellerController.getSellerStats);

// Admin only routes
router.get('/', AuthMiddleware.authorize('Admin'), SellerController.getAllSellers);
router.put('/:sellerId/approve', AuthMiddleware.authorize('Admin'), SellerController.approveSeller);
router.put('/:sellerId/reject', AuthMiddleware.authorize('Admin'), SellerController.rejectSeller);

module.exports = router;
