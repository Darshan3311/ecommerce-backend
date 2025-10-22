const express = require('express');
const router = express.Router();
const AddressController = require('../controllers/Address.controller');
const AuthMiddleware = require('../middleware/auth.middleware');

// Allow optional authentication for getting default address (frontend may call before login)
router.get('/default', AuthMiddleware.optional, AddressController.getDefaultAddress);

// All other address routes require authentication
router.use(AuthMiddleware.protect);

module.exports = router;
