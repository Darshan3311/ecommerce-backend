const express = require('express');
const router = express.Router();
const UserController = require('../controllers/User.controller');
const AuthMiddleware = require('../middleware/auth.middleware');
const UploadMiddleware = require('../middleware/upload.middleware');

// Protect all routes
router.use(AuthMiddleware.protect);

// Get current user profile
router.get('/me', (req, res) => {
  res.json({
    success: true,
    data: req.user
  });
});

// Update current user profile
router.put('/profile', UserController.updateProfile);

// Upload avatar
router.post('/avatar', UploadMiddleware.single('avatar'), UserController.uploadAvatar);

// Admin only routes
router.get('/', AuthMiddleware.authorize('Admin'), UserController.getAllUsers);
router.get('/:id', AuthMiddleware.authorize('Admin'), UserController.getUserById);
router.put('/:userId/role', AuthMiddleware.authorize('Admin'), UserController.assignRole);
router.delete('/:userId', AuthMiddleware.authorize('Admin'), UserController.deleteUser);

module.exports = router;
