# E-Commerce Platform - Backend API

A full-featured e-commerce backend API built with Node.js, Express, and MongoDB.

## 🚀 Features

- **Authentication & Authorization**
  - JWT-based authentication
  - Email verification
  - Password reset functionality
  - Role-based access control (Customer, Seller, Admin, Support)
  - Permission-based authorization

- **User Management**
  - User registration and login
  - Profile management
  - Address management
  - Multi-role support

- **Product Management**
  - Product CRUD operations
  - Product variants (size, color, etc.)
  - Categories and brands
  - Product listings by sellers
  - Image upload with Cloudinary
  - Product search and filtering

- **Shopping Cart**
  - Add/remove items
  - Update quantities
  - Cart persistence
  - Multi-seller cart support

- **Order Management**
  - Order creation and tracking
  - Order status updates
  - Order history
  - Multi-seller order splitting
  - Payment integration (Stripe ready)

- **Review System**
  - Product reviews with ratings
  - Review images
  - Seller reviews
  - Helpful votes
  - Seller responses

- **Marketplace Features**
  - Seller registration and verification
  - Product listings per seller
  - Inventory management
  - Commission system

## 📁 Project Structure

```
backend/
├── config/              # Configuration files
│   ├── database.config.js
│   ├── cloudinary.config.js
│   └── email.config.js
├── controllers/         # Request handlers
│   ├── Auth.controller.js
│   ├── Product.controller.js
│   ├── Cart.controller.js
│   ├── Order.controller.js
│   └── Review.controller.js
├── middleware/          # Custom middleware
│   ├── auth.middleware.js
│   ├── error.middleware.js
│   ├── validation.middleware.js
│   └── upload.middleware.js
├── models/             # Database models (OOP)
│   ├── base/
│   │   └── BaseModel.js
│   ├── User.model.js
│   ├── Role.model.js
│   ├── Product.model.js
│   ├── ProductVariant.model.js
│   ├── Cart.model.js
│   ├── Order.model.js
│   ├── Review.model.js
│   └── Seller.model.js
├── routes/             # API routes
│   ├── auth.routes.js
│   ├── product.routes.js
│   ├── cart.routes.js
│   ├── order.routes.js
│   └── review.routes.js
├── services/           # Business logic (OOP)
│   ├── Auth.service.js
│   ├── Product.service.js
│   ├── Cart.service.js
│   ├── Order.service.js
│   └── Review.service.js
├── .env.example        # Environment variables template
├── server.js           # Application entry point
└── package.json        # Dependencies
```

## 🛠️ Installation

1. **Clone the repository**
```bash
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` file with your credentials:
- MongoDB URI
- JWT secrets
- Cloudinary credentials
- Email service credentials
- Stripe keys

4. **Start the server**
```bash
# Development
npm run dev

# Production
npm start
```

## 🔧 Environment Variables

```env
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/ecommerce

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRE=30d

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@ecommerce.com

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify-email` - Verify email
- `POST /api/auth/resend-verification` - Resend verification email
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/featured` - Get featured products
- `GET /api/products/search` - Search products
- `POST /api/products` - Create product (Seller/Admin)
- `PUT /api/products/:id` - Update product (Seller/Admin)
- `DELETE /api/products/:id` - Delete product (Seller/Admin)

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/:productListingId` - Update cart item
- `DELETE /api/cart/:productListingId` - Remove from cart
- `DELETE /api/cart` - Clear cart

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders/:id/cancel` - Cancel order
- `PUT /api/orders/:id/status` - Update order status (Admin/Seller)

### Reviews
- `GET /api/reviews/product/:productId` - Get product reviews
- `POST /api/reviews` - Create review
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review
- `POST /api/reviews/:id/vote` - Vote on review
- `PUT /api/reviews/:id/approve` - Approve review (Admin)

## 🏗️ Database Models

### Core Entities
- **User** - User accounts with authentication
- **Role** - User roles (Customer, Seller, Admin)
- **Permission** - Granular permissions
- **Address** - User addresses
- **Seller** - Seller/vendor profiles
- **Product** - Product catalog
- **ProductVariant** - Product variations
- **ProductListing** - Seller-specific product listings
- **Brand** - Product brands
- **Category** - Product categories
- **Cart** - Shopping carts
- **Order** - Customer orders
- **Review** - Product reviews
- **SellerReview** - Seller reviews
- **Wishlist** - User wishlists

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- HTTP-only cookies
- Rate limiting
- Helmet.js security headers
- Input validation
- XSS protection
- CORS configuration

## 📦 Technologies Used

- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Cloudinary** - Image storage
- **Nodemailer** - Email service
- **Multer** - File upload
- **Express Validator** - Input validation

## 🧪 Testing

```bash
npm test
```

## 📝 Notes

- The application follows OOP principles with service classes
- All models extend from a BaseModel class
- Middleware is organized by concern
- Error handling is centralized
- API responses follow a consistent format

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the ISC License.
