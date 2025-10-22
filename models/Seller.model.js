const mongoose = require('mongoose');
const BaseModel = require('./base/BaseModel');

const sellerSchemaDefinition = {
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  businessName: {
    type: String,
    required: [true, 'Business name is required'],
    trim: true
  },
  businessEmail: {
    type: String,
    required: [true, 'Business email is required'],
    lowercase: true,
    trim: true
  },
  businessPhone: {
    type: String,
    required: [true, 'Business phone is required']
  },
  description: {
    type: String,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  logo: {
    public_id: String,
    url: String
  },
  banner: {
    public_id: String,
    url: String
  },
  businessAddress: {
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  taxId: {
    type: String,
    required: [true, 'Tax ID is required']
  },
  businessLicense: {
    public_id: String,
    url: String
  },
  payoutDetails: {
    accountHolderName: String,
    accountNumber: String,
    bankName: String,
    routingNumber: String,
    accountType: {
      type: String,
      enum: ['checking', 'savings']
    }
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalReviews: {
      type: Number,
      default: 0
    }
  },
  totalSales: {
    type: Number,
    default: 0
  },
  totalProducts: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'suspended'],
    default: 'pending'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedAt: Date,
  commission: {
    type: Number,
    default: 10, // Percentage
    min: 0,
    max: 100
  }
};

class SellerModel extends BaseModel {
  constructor() {
    super(sellerSchemaDefinition);
    this.addSellerMethods();
  }

  addSellerMethods() {
    // Approve seller
    this.schema.methods.approve = function() {
      this.status = 'approved';
      this.isVerified = true;
      this.verifiedAt = Date.now();
      return this.save();
    };

    // Reject seller
    this.schema.methods.reject = function() {
      this.status = 'rejected';
      return this.save();
    };

    // Suspend seller
    this.schema.methods.suspend = function() {
      this.status = 'suspended';
      this.isActive = false;
      return this.save();
    };

    // Update rating
    this.schema.methods.updateRating = async function() {
      const SellerReview = mongoose.model('SellerReview');
      const stats = await SellerReview.aggregate([
        { $match: { seller: this._id, isApproved: true } },
        {
          $group: {
            _id: '$seller',
            averageRating: { $avg: '$rating' },
            totalReviews: { $sum: 1 }
          }
        }
      ]);

      if (stats.length > 0) {
        this.rating.average = Math.round(stats[0].averageRating * 10) / 10;
        this.rating.totalReviews = stats[0].totalReviews;
      } else {
        this.rating.average = 0;
        this.rating.totalReviews = 0;
      }

      await this.save();
    };

    // Calculate commission amount
    this.schema.methods.calculateCommission = function(amount) {
      return (amount * this.commission) / 100;
    };
  }
}

const sellerModel = new SellerModel();
module.exports = sellerModel.createModel('Seller');
