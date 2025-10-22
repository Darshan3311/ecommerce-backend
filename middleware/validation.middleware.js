const { body, param, query, validationResult } = require('express-validator');

class ValidationMiddleware {
  // Check validation results
  static validate(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }

  // User registration validation
  static userRegistration = [
    body('firstName')
      .trim()
      .notEmpty().withMessage('First name is required')
      .isLength({ max: 50 }).withMessage('First name cannot exceed 50 characters'),
    body('lastName')
      .trim()
      .notEmpty().withMessage('Last name is required')
      .isLength({ max: 50 }).withMessage('Last name cannot exceed 50 characters'),
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('password')
      .notEmpty().withMessage('Password is required')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
      .matches(/\d/).withMessage('Password must contain at least one number'),
    body('phone')
      .optional()
      .trim()
      .isMobilePhone().withMessage('Please provide a valid phone number'),
    ValidationMiddleware.validate
  ];

  // User login validation
  static userLogin = [
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('password')
      .notEmpty().withMessage('Password is required'),
    ValidationMiddleware.validate
  ];

  // Product creation validation
  static createProduct = [
    body('name')
      .trim()
      .notEmpty().withMessage('Product name is required')
      .isLength({ max: 200 }).withMessage('Product name cannot exceed 200 characters'),
    body('description')
      .trim()
      .notEmpty().withMessage('Product description is required')
      .isLength({ max: 5000 }).withMessage('Description cannot exceed 5000 characters'),
    body('categories')
      .isArray({ min: 1 }).withMessage('At least one category is required'),
    ValidationMiddleware.validate
  ];

  // Product variant creation validation
  static createProductVariant = [
    body('sku')
      .trim()
      .notEmpty().withMessage('SKU is required')
      .isLength({ max: 50 }).withMessage('SKU cannot exceed 50 characters'),
    body('price')
      .notEmpty().withMessage('Price is required')
      .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('stockQuantity')
      .notEmpty().withMessage('Stock quantity is required')
      .isInt({ min: 0 }).withMessage('Stock quantity must be a non-negative integer'),
    ValidationMiddleware.validate
  ];

  // Address validation
  static createAddress = [
    body('fullName')
      .trim()
      .notEmpty().withMessage('Full name is required'),
    body('phone')
      .trim()
      .notEmpty().withMessage('Phone number is required'),
    body('addressLine1')
      .trim()
      .notEmpty().withMessage('Address line 1 is required'),
    body('city')
      .trim()
      .notEmpty().withMessage('City is required'),
    body('state')
      .trim()
      .notEmpty().withMessage('State is required'),
    body('zipCode')
      .trim()
      .notEmpty().withMessage('Zip code is required'),
    ValidationMiddleware.validate
  ];

  // Review validation
  static createReview = [
    body('rating')
      .notEmpty().withMessage('Rating is required')
      .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('title')
      .trim()
      .notEmpty().withMessage('Review title is required')
      .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),
    body('comment')
      .trim()
      .notEmpty().withMessage('Review comment is required')
      .isLength({ max: 2000 }).withMessage('Comment cannot exceed 2000 characters'),
    ValidationMiddleware.validate
  ];

  // Order creation validation
  static createOrder = [
    body('shippingAddress.fullName')
      .trim()
      .notEmpty().withMessage('Full name is required'),
    body('shippingAddress.phone')
      .trim()
      .notEmpty().withMessage('Phone number is required'),
    body('shippingAddress.addressLine1')
      .trim()
      .notEmpty().withMessage('Address is required'),
    body('shippingAddress.city')
      .trim()
      .notEmpty().withMessage('City is required'),
    body('shippingAddress.state')
      .trim()
      .notEmpty().withMessage('State is required'),
    body('shippingAddress.country')
      .trim()
      .notEmpty().withMessage('Country is required'),
    body('shippingAddress.zipCode')
      .trim()
      .notEmpty().withMessage('Zip code is required'),
    body('payment.method')
      .notEmpty().withMessage('Payment method is required')
      .isIn(['card', 'paypal', 'stripe', 'cod']).withMessage('Invalid payment method'),
    ValidationMiddleware.validate
  ];

  // ObjectId validation
  static validateObjectId = (paramName) => [
    param(paramName)
      .isMongoId().withMessage(`Invalid ${paramName}`),
    ValidationMiddleware.validate
  ];

  // Pagination validation
  static validatePagination = [
    query('page')
      .optional()
      .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    ValidationMiddleware.validate
  ];
}

module.exports = ValidationMiddleware;
