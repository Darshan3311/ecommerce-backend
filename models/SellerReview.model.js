const mongoose = require('mongoose');
const BaseModel = require('./base/BaseModel');

const sellerReviewSchemaDefinition = {
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: [true, 'Comment is required'],
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  approvedAt: Date
};

class SellerReviewModel extends BaseModel {
  constructor() {
    super(sellerReviewSchemaDefinition);
    this.addSellerReviewMethods();
    this.addSellerReviewMiddleware();
  }

  addSellerReviewMethods() {
    this.schema.methods.approve = function() {
      this.isApproved = true;
      this.approvedAt = Date.now();
      return this.save();
    };
  }

  addSellerReviewMiddleware() {
    // Update seller rating after save
    this.schema.post('save', async function() {
      const Seller = mongoose.model('Seller');
      const seller = await Seller.findById(this.seller);
      if (seller) {
        await seller.updateRating();
      }
    });
  }
}

const sellerReviewModel = new SellerReviewModel();
module.exports = sellerReviewModel.createModel('SellerReview');
