const mongoose = require('mongoose');
const BaseModel = require('./base/BaseModel');

const productVariantSchemaDefinition = {
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    unique: true,
    uppercase: true
  },
  attributes: [{
    name: {
      type: String,
      required: true
    },
    value: {
      type: String,
      required: true
    }
  }],
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0
  },
  compareAtPrice: {
    type: Number,
    min: 0
  },
  costPrice: {
    type: Number,
    min: 0
  },
  stockQuantity: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  weight: {
    value: Number,
    unit: {
      type: String,
      enum: ['kg', 'g', 'lb', 'oz'],
      default: 'kg'
    }
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    unit: {
      type: String,
      enum: ['cm', 'in', 'm'],
      default: 'cm'
    }
  },
  image: {
    public_id: String,
    url: String
  },
  barcode: String,
  isDefault: {
    type: Boolean,
    default: false
  }
};

class ProductVariantModel extends BaseModel {
  constructor() {
    super(productVariantSchemaDefinition);
    this.addVariantMethods();
    this.addVariantMiddleware();
  }

  addVariantMethods() {
    // Check stock availability
    this.schema.methods.isInStock = function(quantity = 1) {
      return this.stockQuantity >= quantity;
    };

    // Calculate discount percentage
    this.schema.methods.getDiscountPercentage = function() {
      if (this.compareAtPrice && this.compareAtPrice > this.price) {
        return Math.round(((this.compareAtPrice - this.price) / this.compareAtPrice) * 100);
      }
      return 0;
    };

    // Update stock
    this.schema.methods.updateStock = function(quantity, operation = 'subtract') {
      if (operation === 'subtract') {
        this.stockQuantity -= quantity;
      } else {
        this.stockQuantity += quantity;
      }
      return this.save();
    };

    // Get variant name
    this.schema.methods.getVariantName = function() {
      return this.attributes.map(attr => `${attr.name}: ${attr.value}`).join(', ');
    };
  }

  addVariantMiddleware() {
    // Ensure only one default variant per product
    this.schema.pre('save', async function(next) {
      if (this.isDefault && this.isModified('isDefault')) {
        await this.constructor.updateMany(
          { product: this.product, _id: { $ne: this._id } },
          { isDefault: false }
        );
      }
      next();
    });
  }
}

const productVariantModel = new ProductVariantModel();
module.exports = productVariantModel.createModel('ProductVariant');
