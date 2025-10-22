const UserModel = require('../models/User.model');
const RoleModel = require('../models/Role.model');
const CloudinaryConfig = require('../config/cloudinary.config');

class UserController {
  // Get user by ID
  async getUserById(req, res, next) {
    try {
      const user = await UserModel.findById(req.params.id)
        .populate('role')
        .select('-password');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  // Get all users (Admin only)
  async getAllUsers(req, res, next) {
    try {
      const { role, page = 1, limit = 10 } = req.query;
      const query = {};

      // Filter by role if provided
      if (role) {
        const roleDoc = await RoleModel.findOne({ name: role });
        if (roleDoc) {
          query.role = roleDoc._id;
        }
      }

      const users = await UserModel.find(query)
        .populate('role')
        .select('-password')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });

      const count = await UserModel.countDocuments(query);

      res.json({
        success: true,
        data: users,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        total: count
      });
    } catch (error) {
      next(error);
    }
  }

  // Assign role to user (Admin only)
  async assignRole(req, res, next) {
    try {
      const { userId } = req.params;
      const { roleName } = req.body;

      // Find the role
      const role = await RoleModel.findOne({ name: roleName });
      if (!role) {
        return res.status(404).json({
          success: false,
          message: 'Role not found'
        });
      }

      // Update user's role
      const user = await UserModel.findByIdAndUpdate(
        userId,
        { role: role._id },
        { new: true }
      ).populate('role').select('-password');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: `User role updated to ${roleName}`,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  // Update user profile
  async updateProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const { firstName, lastName, phone } = req.body;

      const user = await UserModel.findByIdAndUpdate(
        userId,
        { firstName, lastName, phone },
        { new: true, runValidators: true }
      ).populate('role').select('-password');

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  // Upload profile avatar
  async uploadAvatar(req, res, next) {
    try {
      const userId = req.user.id;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Please upload an image'
        });
      }

      // Get current user to delete old avatar
      const currentUser = await UserModel.findById(userId);
      
      // Delete old avatar from Cloudinary if exists
      if (currentUser.avatar && currentUser.avatar.public_id) {
        await CloudinaryConfig.deleteImage(currentUser.avatar.public_id);
      }

      // Upload new avatar to Cloudinary
      const result = await CloudinaryConfig.uploadImage(req.file.path, 'avatars');

      // Update user with new avatar
      const user = await UserModel.findByIdAndUpdate(
        userId,
        {
          avatar: {
            public_id: result.public_id,
            url: result.url
          }
        },
        { new: true }
      ).populate('role').select('-password');

      res.json({
        success: true,
        message: 'Avatar uploaded successfully',
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete user (Admin only)
  async deleteUser(req, res, next) {
    try {
      const { userId } = req.params;

      const user = await UserModel.findByIdAndDelete(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
