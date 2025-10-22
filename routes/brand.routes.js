const express = require('express');
const router = express.Router();
const BrandController = require('../controllers/Brand.controller');
const AuthMiddleware = require('../middleware/auth.middleware');

// Public routes
router.get('/', BrandController.getAllBrands);
router.get('/:id', BrandController.getBrandById);

// Admin only routes
router.post('/', AuthMiddleware.protect, AuthMiddleware.authorize('Admin'), BrandController.createBrand);
router.put('/:id', AuthMiddleware.protect, AuthMiddleware.authorize('Admin'), BrandController.updateBrand);
router.delete('/:id', AuthMiddleware.protect, AuthMiddleware.authorize('Admin'), BrandController.deleteBrand);

module.exports = router;
