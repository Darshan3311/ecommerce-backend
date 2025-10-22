const mongoose = require('mongoose');
const slugify = require('slugify');
const BaseModel = require('./base/BaseModel');

const productSchemaDefinition = {
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [500, 'Short description cannot exceed 500 characters']
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0
  },
  compareAtPrice: {
    type: Number,
    min: 0
  },
  costPerItem: {
    type: Number,
    min: 0
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    default: 0,
    min: 0
  },
  sku: {
    type: String,
    trim: true
  },
  barcode: {
    type: String,
    trim: true
  },
  trackQuantity: {
    type: Boolean,
    default: true
  },
  continueSellingWhenOutOfStock: {
    type: Boolean,
    default: false
  },
  brand: {
    type: String,
    trim: true
  },
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  }],
  images: [{
    public_id: String,
    url: {
      type: String,
      required: true
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  specifications: [{
    name: String,
    value: String
  }],
  features: [String],
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  totalSold: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  metaTitle: String,
  metaDescription: String,
  metaKeywords: [String]
};

class ProductModel extends BaseModel {
  constructor() {
    super(productSchemaDefinition);
    this.addProductMethods();
    this.addProductMiddleware();
    this.addProductVirtuals();
  }

  addProductMethods() {
    // Get primary image
    this.schema.methods.getPrimaryImage = function() {
      const primaryImage = this.images.find(img => img.isPrimary);
      return primaryImage || (this.images.length > 0 ? this.images[0] : null);
    };

    // Update rating
    this.schema.methods.updateRating = async function() {
      const Review = mongoose.model('Review');
      const stats = await Review.aggregate([
        { $match: { product: this._id, isApproved: true } },
        {
          $group: {
            _id: '$product',
            averageRating: { $avg: '$rating' },
            totalReviews: { $sum: 1 }
          }
        }
      ]);

      if (stats.length > 0) {
        this.averageRating = Math.round(stats[0].averageRating * 10) / 10;
        this.totalReviews = stats[0].totalReviews;
      } else {
        this.averageRating = 0;
        this.totalReviews = 0;
      }

      await this.save();
    };

    // Increment views
    this.schema.methods.incrementViews = function() {
      this.views += 1;
      return this.save();
    };

    // Get cheapest variant
    this.schema.methods.getCheapestVariant = async function() {
      const ProductVariant = mongoose.model('ProductVariant');
      return await ProductVariant.findOne({ product: this._id, isActive: true })
        .sort({ price: 1 })
        .limit(1);
    };
  }

  addProductMiddleware() {
    // Generate slug before saving
    this.schema.pre('save', function(next) {
      if (this.isModified('name')) {
        this.slug = slugify(this.name, { lower: true, strict: true });
      }
      next();
    });

    // Ensure at least one image is primary
    this.schema.pre('save', function(next) {
      if (this.images && this.images.length > 0) {
        const hasPrimary = this.images.some(img => img.isPrimary);
        if (!hasPrimary) {
          this.images[0].isPrimary = true;
        }
      }
      next();
    });
  }

  addProductVirtuals() {
    // Virtual populate for variants
    this.schema.virtual('variants', {
      ref: 'ProductVariant',
      localField: '_id',
      foreignField: 'product'
    });

    // Virtual populate for reviews
    this.schema.virtual('reviews', {
      ref: 'Review',
      localField: '_id',
      foreignField: 'product'
    });
  }
}

const productModel = new ProductModel();
module.exports = productModel.createModel('Product');
