const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/Order.controller');
const AuthMiddleware = require('../middleware/auth.middleware');
const ValidationMiddleware = require('../middleware/validation.middleware');

// All order routes require authentication
router.use(AuthMiddleware.protect);

router.post('/', ValidationMiddleware.createOrder, OrderController.createOrder);
router.get('/', OrderController.getUserOrders);
router.get('/:id', OrderController.getOrderById);
router.post('/:id/cancel', OrderController.cancelOrder);

// Admin/Seller routes
router.put(
  '/:id/status',
  AuthMiddleware.authorize('admin', 'seller'),
  OrderController.updateOrderStatus
);

router.get(
  '/seller/:sellerId',
  AuthMiddleware.authorize('seller', 'admin'),
  OrderController.getSellerOrders
);

module.exports = router;
