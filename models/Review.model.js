const mongoose = require('mongoose');
const BaseModel = require('./base/BaseModel');

const reviewSchemaDefinition = {
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
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
  title: {
    type: String,
    required: [true, 'Review title is required'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    maxlength: [2000, 'Comment cannot exceed 2000 characters']
  },
  images: [{
    public_id: String,
    url: String
  }],
  isVerifiedPurchase: {
    type: Boolean,
    default: false
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  approvedAt: Date,
  helpfulCount: {
    type: Number,
    default: 0
  },
  notHelpfulCount: {
    type: Number,
    default: 0
  },
  userVotes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    vote: {
      type: String,
      enum: ['helpful', 'not_helpful']
    }
  }],
  sellerResponse: {
    comment: String,
    respondedAt: Date
  }
};

class ReviewModel extends BaseModel {
  constructor() {
    super(reviewSchemaDefinition);
    this.addReviewMethods();
    this.addReviewMiddleware();
    this.addReviewIndexes();
  }

  addReviewMethods() {
    // Approve review
    this.schema.methods.approve = function() {
      this.isApproved = true;
      this.approvedAt = Date.now();
      return this.save();
    };

    // Add vote
    this.schema.methods.addVote = function(userId, voteType) {
      // Remove existing vote from this user
      this.userVotes = this.userVotes.filter(
        v => v.user.toString() !== userId.toString()
      );

      // Add new vote
      this.userVotes.push({
        user: userId,
        vote: voteType
      });

      // Update counts
      this.helpfulCount = this.userVotes.filter(v => v.vote === 'helpful').length;
      this.notHelpfulCount = this.userVotes.filter(v => v.vote === 'not_helpful').length;

      return this.save();
    };

    // Add seller response
    this.schema.methods.addSellerResponse = function(comment) {
      this.sellerResponse = {
        comment: comment,
        respondedAt: Date.now()
      };
      return this.save();
    };
  }

  addReviewMiddleware() {
    // Update product rating after save
    this.schema.post('save', async function() {
      const Product = mongoose.model('Product');
      const product = await Product.findById(this.product);
      if (product) {
        await product.updateRating();
      }
    });

    // Update product rating after delete
    this.schema.post('remove', async function() {
      const Product = mongoose.model('Product');
      const product = await Product.findById(this.product);
      if (product) {
        await product.updateRating();
      }
    });
  }

  addReviewIndexes() {
    // Prevent duplicate reviews from same user for same product
    this.schema.index({ product: 1, user: 1 }, { unique: true });
  }
}

const reviewModel = new ReviewModel();
module.exports = reviewModel.createModel('Review');
