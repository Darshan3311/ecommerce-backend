const User = require('../models/User.model');
const Role = require('../models/Role.model');
const EmailConfig = require('../config/email.config');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { ErrorHandler } = require('../middleware/error.middleware');

class AuthService {
  // Register new user
  async register(userData) {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        throw new ErrorHandler('Email already registered', 400);
      }

      // Get customer role
      const customerRole = await Role.findOne({ name: 'customer' });
      if (!customerRole) {
        throw new ErrorHandler('Customer role not found', 500);
      }

      // Create user with customer role and verified email
      const user = await User.create({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password,
        phone: userData.phone,
        role: customerRole._id,
        isEmailVerified: true // Skip email verification
      });

      return {
        user: this.sanitizeUser(user),
        message: 'Registration successful. You can now login.'
      };
    } catch (error) {
      throw error;
    }
  }

  // Login user
  async login(email, password) {
    try {
      // Find user with password and populate role
      const user = await User.findOne({ email }).select('+password').populate('role');

      if (!user || !(await user.matchPassword(password))) {
        throw new ErrorHandler('Invalid email or password', 401);
      }

      if (!user.isActive) {
        throw new ErrorHandler('Account has been deactivated', 401);
      }

      // If the user is a seller, enforce seller application status checks.
      // This prevents admin/support/customer users from being blocked if
      // a Seller profile exists for their user record.
      const userRoleName = (user.role && user.role.name) ? String(user.role.name).toLowerCase() : null;
      if (userRoleName === 'seller') {
        const Seller = require('../models/Seller.model');
        const sellerProfile = await Seller.findOne({ user: user._id });

        if (sellerProfile && sellerProfile.status === 'pending') {
          throw new ErrorHandler('Your seller application is pending admin approval. Please wait for approval to login.', 403);
        }

        if (sellerProfile && sellerProfile.status === 'rejected') {
          throw new ErrorHandler('Your seller application has been rejected. Please contact support.', 403);
        }
      }

      // Update last login
      await user.updateLastLogin();

      // Generate tokens
      const token = user.generateAuthToken();
      const refreshToken = user.generateRefreshToken();
      await user.save();

      return {
        user: this.sanitizeUser(user),
        token,
        refreshToken
      };
    } catch (error) {
      throw error;
    }
  }

  // Verify email
  async verifyEmail(token) {
    try {
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpire: { $gt: Date.now() }
      });

      if (!user) {
        throw new ErrorHandler('Invalid or expired verification token', 400);
      }

      user.isEmailVerified = true;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpire = undefined;
      await user.save();

      return {
        message: 'Email verified successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  // Resend verification email
  async resendVerificationEmail(email) {
    try {
      const user = await User.findOne({ email });

      if (!user) {
        throw new ErrorHandler('User not found', 404);
      }

      if (user.isEmailVerified) {
        throw new ErrorHandler('Email already verified', 400);
      }

      const verificationToken = user.generateEmailVerificationToken();
      await user.save();

      await EmailConfig.sendVerificationEmail(user.email, verificationToken);

      return {
        message: 'Verification email sent successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  // Forgot password
  async forgotPassword(email) {
    try {
      const user = await User.findOne({ email });

      if (!user) {
        throw new ErrorHandler('User not found', 404);
      }

      const resetToken = user.generatePasswordResetToken();
      await user.save();

      await EmailConfig.sendPasswordResetEmail(user.email, resetToken);

      return {
        message: 'Password reset email sent successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  // Reset password
  async resetPassword(token, newPassword) {
    try {
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpire: { $gt: Date.now() }
      });

      if (!user) {
        throw new ErrorHandler('Invalid or expired reset token', 400);
      }

      user.password = newPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      return {
        message: 'Password reset successful'
      };
    } catch (error) {
      throw error;
    }
  }

  // Refresh token
  async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const user = await User.findById(decoded.id);

      if (!user || user.refreshToken !== refreshToken) {
        throw new ErrorHandler('Invalid refresh token', 401);
      }

      const newToken = user.generateAuthToken();
      return { token: newToken };
    } catch (error) {
      throw new ErrorHandler('Invalid refresh token', 401);
    }
  }

  // Sanitize user data (remove sensitive fields)
  sanitizeUser(user) {
    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.emailVerificationToken;
    delete userObj.emailVerificationExpire;
    delete userObj.resetPasswordToken;
    delete userObj.resetPasswordExpire;
    delete userObj.refreshToken;
    
    // Add role name as string for easy access
    if (userObj.role && typeof userObj.role === 'object') {
      userObj.roleName = userObj.role.name;
      userObj.roleId = userObj.role._id;
    }
    
    return userObj;
  }
}

module.exports = new AuthService();
