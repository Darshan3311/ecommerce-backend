const UserModel = require('../models/User.model');
const SellerModel = require('../models/Seller.model');
const RoleModel = require('../models/Role.model');
const EmailConfig = require('../config/email.config');

class SellerController {
  // Register as seller
  async registerSeller(req, res, next) {
    try {
      const {
        // Personal information
        firstName,
        lastName,
        email,
        password,
        phone,
        // Business information
        businessName,
        businessEmail,
        businessPhone,
        description,
        taxId,
        businessLicense,
        businessAddress
      } = req.body;

      console.log('📝 Seller registration request:', { email, businessName });

      // Check if user already exists
      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      // Get Customer role (initially, will be upgraded to Seller after approval)
      const customerRole = await RoleModel.findOne({ name: 'Customer' });
      console.log('🔍 Customer role found:', customerRole ? 'Yes' : 'No');
      
      if (!customerRole) {
        console.error('❌ Customer role not found! Run: npm run seed');
        return res.status(500).json({
          success: false,
          message: 'Customer role not found. Please run: npm run seed'
        });
      }

      // Create user account
      const user = await UserModel.create({
        firstName,
        lastName,
        email,
        password,
        phone,
        role: customerRole._id
      });
      console.log('✅ User created:', user._id);

      // Create seller profile (with pending status)
      const seller = await SellerModel.create({
        user: user._id,
        businessName,
        businessEmail: businessEmail || email,
        businessPhone: businessPhone || phone,
        description,
        taxId,
        businessLicense,
        businessAddress,
        status: 'pending', // Uses 'status' field from model
        isVerified: false  // Uses 'isVerified' field from model
      });
      console.log('✅ Seller profile created:', seller._id);

      console.log('📧 Seller registration complete - waiting for admin approval');

      res.status(201).json({
        success: true,
        message: 'Seller registration successful! Your application is pending admin approval. You will be able to login once approved.',
        data: {
          user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email
          },
          seller: {
            id: seller._id,
            businessName: seller.businessName,
            status: seller.status
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get seller profile
  async getSellerProfile(req, res, next) {
    try {
      const userId = req.user.id;

      const seller = await SellerModel.findOne({ user: userId })
        .populate('user', '-password');

      if (!seller) {
        return res.status(404).json({
          success: false,
          message: 'Seller profile not found'
        });
      }

      res.json({
        success: true,
        data: seller
      });
    } catch (error) {
      next(error);
    }
  }

  // Update seller profile
  async updateSellerProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const {
        businessName,
        businessEmail,
        businessPhone,
        description,
        businessAddress,
        bankDetails
      } = req.body;

      const seller = await SellerModel.findOneAndUpdate(
        { user: userId },
        {
          businessName,
          businessEmail,
          businessPhone,
          description,
          businessAddress,
          bankDetails
        },
        { new: true, runValidators: true }
      ).populate('user', '-password');

      if (!seller) {
        return res.status(404).json({
          success: false,
          message: 'Seller profile not found'
        });
      }

      res.json({
        success: true,
        message: 'Seller profile updated successfully',
        data: seller
      });
    } catch (error) {
      next(error);
    }
  }

  // Get all sellers (Admin only)
  async getAllSellers(req, res, next) {
    try {
      const { status, isVerified, page = 1, limit = 10 } = req.query;
      const query = {};

      if (status) {
        query.status = status; // Use 'status' instead of 'verificationStatus'
      }
      if (isVerified !== undefined) {
        query.isVerified = isVerified === 'true'; // Use 'isVerified' instead of 'isApproved'
      }

      const sellers = await SellerModel.find(query)
        .populate('user', '-password')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });

      const count = await SellerModel.countDocuments(query);

      res.json({
        success: true,
        data: sellers,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        total: count
      });
    } catch (error) {
      next(error);
    }
  }

  // Approve seller (Admin only)
  async approveSeller(req, res, next) {
    try {
      const { sellerId } = req.params;

      const seller = await SellerModel.findById(sellerId).populate('user');
      if (!seller) {
        return res.status(404).json({
          success: false,
          message: 'Seller not found'
        });
      }

      // Get Seller role
      const sellerRole = await RoleModel.findOne({ name: 'Seller' });
      if (!sellerRole) {
        return res.status(500).json({
          success: false,
          message: 'Seller role not found'
        });
      }

      // Update seller status
      seller.status = 'approved'; // Use 'status' field
      seller.isVerified = true;   // Use 'isVerified' field
      seller.verifiedAt = Date.now(); // Add verification timestamp
      await seller.save();

      // Update user role to Seller
      const user = await UserModel.findById(seller.user._id);
      user.role = sellerRole._id;
      await user.save();

      // Send approval email
      // TODO: Implement approval email

      res.json({
        success: true,
        message: 'Seller approved successfully',
        data: seller
      });
    } catch (error) {
      next(error);
    }
  }

  // Reject seller (Admin only)
  async rejectSeller(req, res, next) {
    try {
      const { sellerId } = req.params;
      const { reason } = req.body;

      const seller = await SellerModel.findById(sellerId);
      if (!seller) {
        return res.status(404).json({
          success: false,
          message: 'Seller not found'
        });
      }

      seller.status = 'rejected'; // Use 'status' field
      seller.isVerified = false;  // Use 'isVerified' field
      // Note: rejectionReason field doesn't exist in model, consider adding it if needed
      await seller.save();

      // Send rejection email
      // TODO: Implement rejection email

      res.json({
        success: true,
        message: 'Seller rejected',
        data: seller
      });
    } catch (error) {
      next(error);
    }
  }

  // Get seller statistics
  async getSellerStats(req, res, next) {
    try {
      const userId = req.user.id;

      const seller = await SellerModel.findOne({ user: userId });
      if (!seller) {
        return res.status(404).json({
          success: false,
          message: 'Seller profile not found'
        });
      }

      // Get product count
      const ProductModel = require('../models/Product.model');
      const productCount = await ProductModel.countDocuments({ seller: seller._id });

      // Get order count and revenue
      const OrderModel = require('../models/Order.model');
      const orders = await OrderModel.find({
        'items.seller': seller._id,
        status: { $in: ['processing', 'shipped', 'delivered'] }
      });

      const revenue = orders.reduce((total, order) => {
        const sellerItems = order.items.filter(item => 
          item.seller.toString() === seller._id.toString()
        );
        const sellerTotal = sellerItems.reduce((sum, item) => 
          sum + (item.price * item.quantity), 0
        );
        return total + sellerTotal;
      }, 0);

      // Get review stats
      const ReviewModel = require('../models/Review.model');
      const reviews = await ReviewModel.find({ seller: seller._id });
      const avgRating = reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
        : 0;

      res.json({
        success: true,
        data: {
          totalProducts: productCount,
          totalOrders: orders.length,
          totalRevenue: parseFloat(revenue.toFixed(2)),
          pendingOrders: orders.filter(o => o.orderStatus === 'processing').length,
          rating: avgRating.toFixed(1),
          totalReviews: reviews.length,
          seller: {
            _id: seller._id,
            businessName: seller.businessName,
            verificationStatus: seller.verificationStatus,
            isApproved: seller.isApproved
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

const sellerController = new SellerController();

module.exports = {
  registerSeller: sellerController.registerSeller.bind(sellerController),
  getSellerProfile: sellerController.getSellerProfile.bind(sellerController),
  updateSellerProfile: sellerController.updateSellerProfile.bind(sellerController),
  getAllSellers: sellerController.getAllSellers.bind(sellerController),
  approveSeller: sellerController.approveSeller.bind(sellerController),
  rejectSeller: sellerController.rejectSeller.bind(sellerController),
  getSellerStats: sellerController.getSellerStats.bind(sellerController)
};
