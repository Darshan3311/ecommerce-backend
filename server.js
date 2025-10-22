const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

// Load environment variables
dotenv.config();

// Import configurations
const DatabaseConnection = require('./config/database.config');
const CloudinaryConfig = require('./config/cloudinary.config');

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const productRoutes = require('./routes/product.routes');
const categoryRoutes = require('./routes/category.routes');
const brandRoutes = require('./routes/brand.routes');
const cartRoutes = require('./routes/cart.routes');
const orderRoutes = require('./routes/order.routes');
const reviewRoutes = require('./routes/review.routes');
const sellerRoutes = require('./routes/seller.routes');
const wishlistRoutes = require('./routes/wishlist.routes');
const addressRoutes = require('./routes/address.routes');
const searchRoutes = require('./routes/search.routes');

// Import middleware
const { errorHandler } = require('./middleware/error.middleware');

class Server {
  constructor() {
    this.app = express();
    // Behind a proxy (Render) — trust the first proxy hop so express-rate-limit
    // can read the X-Forwarded-For header correctly.
    this.app.set('trust proxy', 1);
    this.port = process.env.PORT || 5000;
    this.initializeDatabase();
    this.initializeCloudinary();
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  initializeDatabase() {
    const db = new DatabaseConnection();
    db.connect();
  }

  initializeCloudinary() {
    CloudinaryConfig.configure();
  }

  initializeMiddleware() {
    // Security middleware
    this.app.use(helmet());

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limit each IP to 100 requests per windowMs
    });
    this.app.use('/api', limiter);

    // CORS
    // Support a single FRONTEND_URL or comma-separated FRONTEND_URLS for multiple deployments.
    const rawFrontends = process.env.FRONTEND_URLS || process.env.FRONTEND_URL || 'http://localhost:3000';
    const allowedOrigins = rawFrontends.split(',').map(s => s.trim()).filter(Boolean);

    this.app.use(cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g., server-to-server or curl)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error('CORS policy: This origin is not allowed: ' + origin), false);
      },
      credentials: true,
      optionsSuccessStatus: 200
    }));

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    this.app.use(cookieParser());

    // Logging
    if (process.env.NODE_ENV === 'development') {
      this.app.use(morgan('dev'));
    }
  }

  initializeRoutes() {
    // Health check
    this.app.get('/api/health', (req, res) => {
      res.status(200).json({ 
        status: 'success', 
        message: 'Server is running',
        timestamp: new Date().toISOString()
      });
    });

    // API routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/users', userRoutes);
    this.app.use('/api/products', productRoutes);
    this.app.use('/api/categories', categoryRoutes);
    this.app.use('/api/brands', brandRoutes);
    this.app.use('/api/cart', cartRoutes);
    this.app.use('/api/orders', orderRoutes);
    this.app.use('/api/reviews', reviewRoutes);
    this.app.use('/api/sellers', sellerRoutes);
    this.app.use('/api/wishlist', wishlistRoutes);
    this.app.use('/api/addresses', addressRoutes);
    this.app.use('/api/search', searchRoutes);

    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({
        status: 'error',
        message: 'Route not found'
      });
    });
  }

  initializeErrorHandling() {
    this.app.use(errorHandler);
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${this.port}`);
      console.log(`🔧 FRONTEND_URL = ${process.env.FRONTEND_URL || 'not set'}`);
    });
  }
}

// Start server
const server = new Server();
server.start();

module.exports = server.app;
