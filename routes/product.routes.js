const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/Product.controller');
const AuthMiddleware = require('../middleware/auth.middleware');
const UploadMiddleware = require('../middleware/upload.middleware');
const ValidationMiddleware = require('../middleware/validation.middleware');

// Public routes
router.get('/', ProductController.getAllProducts);
router.get('/featured', ProductController.getFeaturedProducts);
router.get('/search', ProductController.searchProducts);

// Seller routes - Must come BEFORE /:id to avoid conflicts
router.get('/seller/my-products',
  AuthMiddleware.protect,
  AuthMiddleware.authorize('seller', 'admin'),
  ProductController.getMyProducts
);

// More public routes
router.get('/:id', ProductController.getProductById);
router.get('/:id/related', ProductController.getRelatedProducts);

// Protected routes (seller/admin)
router.post(
  '/',
  AuthMiddleware.protect,
  AuthMiddleware.authorize('seller', 'admin'),
  UploadMiddleware.multiple('images', 5),
  ValidationMiddleware.createProduct,
  ProductController.createProduct
);

router.put(
  '/:id',
  AuthMiddleware.protect,
  AuthMiddleware.authorize('seller', 'admin'),
  UploadMiddleware.multiple('images', 5),
  ProductController.updateProduct
);

// Toggle product status (activate/deactivate)
router.patch(
  '/:id/status',
  AuthMiddleware.protect,
  AuthMiddleware.authorize('seller', 'admin'),
  ProductController.toggleProductStatus
);

// Delete product (hard delete)
router.delete(
  '/:id',
  AuthMiddleware.protect,
  AuthMiddleware.authorize('seller', 'admin'),
  ProductController.deleteProduct
);

router.post(
  '/:id/variants',
  AuthMiddleware.protect,
  AuthMiddleware.authorize('seller', 'admin'),
  ValidationMiddleware.createProductVariant,
  ProductController.createProductVariant
);

module.exports = router;
