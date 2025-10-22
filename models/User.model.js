const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const BaseModel = require('./base/BaseModel');

const userSchemaDefinition = {
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  phone: {
    type: String,
    trim: true
  },
  avatar: {
    public_id: String,
    url: {
      type: String,
      default: 'https://via.placeholder.com/150'
    }
  },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpire: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  lastLogin: Date,
  refreshToken: String
};

class UserModel extends BaseModel {
  constructor() {
    super(userSchemaDefinition);
    this.addUserMethods();
    this.addUserMiddleware();
  }

  addUserMethods() {
    // Get full name
    this.schema.virtual('fullName').get(function() {
      return `${this.firstName} ${this.lastName}`;
    });

    // Match password
    this.schema.methods.matchPassword = async function(enteredPassword) {
      return await bcrypt.compare(enteredPassword, this.password);
    };

    // Generate JWT token
    this.schema.methods.generateAuthToken = function() {
      // Accept either a numeric seconds value or a string like '7d'.
      const expiresIn = process.env.JWT_EXPIRE || '7d';
      return jwt.sign(
        { id: this._id, email: this.email },
        process.env.JWT_SECRET,
        { expiresIn }
      );
    };

    // Generate refresh token
    this.schema.methods.generateRefreshToken = function() {
      const refreshExpiresIn = process.env.JWT_REFRESH_EXPIRE || '30d';
      const refreshToken = jwt.sign(
        { id: this._id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: refreshExpiresIn }
      );
      this.refreshToken = refreshToken;
      return refreshToken;
    };

    // Generate email verification token
    this.schema.methods.generateEmailVerificationToken = function() {
      const verificationToken = crypto.randomBytes(32).toString('hex');
      
      this.emailVerificationToken = crypto
        .createHash('sha256')
        .update(verificationToken)
        .digest('hex');
      
      this.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
      
      return verificationToken;
    };

    // Generate password reset token
    this.schema.methods.generatePasswordResetToken = function() {
      const resetToken = crypto.randomBytes(32).toString('hex');
      
      this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
      
      this.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hour
      
      return resetToken;
    };

    // Check if user has role
    this.schema.methods.hasRole = async function(roleName) {
      await this.populate('roles');
      return this.roles.some(role => role.name === roleName);
    };

    // Check if user has permission
    this.schema.methods.hasPermission = async function(permissionName) {
      await this.populate({
        path: 'roles',
        populate: { path: 'permissions' }
      });
      
      return this.roles.some(role => 
        role.permissions.some(permission => permission.name === permissionName)
      );
    };
  }

  addUserMiddleware() {
    // Hash password before saving
    this.schema.pre('save', async function(next) {
      if (!this.isModified('password')) {
        return next();
      }
      
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      next();
    });

    // Update lastLogin on login
    this.schema.methods.updateLastLogin = function() {
      this.lastLogin = Date.now();
      return this.save();
    };
  }
}

const userModel = new UserModel();
module.exports = userModel.createModel('User');
