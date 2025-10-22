const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/Auth.controller');
const AuthMiddleware = require('../middleware/auth.middleware');
const ValidationMiddleware = require('../middleware/validation.middleware');

// Public routes
router.post('/register', ValidationMiddleware.userRegistration, AuthController.register);
router.post('/login', ValidationMiddleware.userLogin, AuthController.login);
router.get('/verify-email', AuthController.verifyEmail);
router.post('/resend-verification', AuthController.resendVerificationEmail);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);

// Protected routes
router.get('/me', AuthMiddleware.protect, AuthController.getCurrentUser);
router.post('/logout', AuthMiddleware.protect, AuthController.logout);
router.post('/refresh-token', AuthController.refreshToken);

module.exports = router;
