const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/Category.controller');
const AuthMiddleware = require('../middleware/auth.middleware');

// Public routes
router.get('/', CategoryController.getAllCategories);
router.get('/:id', CategoryController.getCategoryById);

// Admin only routes
router.post('/', AuthMiddleware.protect, AuthMiddleware.authorize('Admin'), CategoryController.createCategory);
router.put('/:id', AuthMiddleware.protect, AuthMiddleware.authorize('Admin'), CategoryController.updateCategory);
router.delete('/:id', AuthMiddleware.protect, AuthMiddleware.authorize('Admin'), CategoryController.deleteCategory);

module.exports = router;
