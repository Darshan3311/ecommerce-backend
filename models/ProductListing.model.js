const mongoose = require('mongoose');
const BaseModel = require('./base/BaseModel');

const productListingSchemaDefinition = {
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: true
  },
  productVariant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductVariant',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0
  },
  stockQuantity: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  condition: {
    type: String,
    enum: ['new', 'refurbished', 'used'],
    default: 'new'
  },
  shippingTime: {
    min: {
      type: Number,
      default: 3
    },
    max: {
      type: Number,
      default: 7
    },
    unit: {
      type: String,
      default: 'days'
    }
  },
  returnable: {
    type: Boolean,
    default: true
  },
  returnWindow: {
    type: Number,
    default: 30 // days
  },
  warranty: {
    duration: Number,
    unit: {
      type: String,
      enum: ['days', 'months', 'years']
    },
    description: String
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  totalSold: {
    type: Number,
    default: 0
  }
};

class ProductListingModel extends BaseModel {
  constructor() {
    super(productListingSchemaDefinition);
    this.addListingMethods();
  }

  addListingMethods() {
    // Check availability
    this.schema.methods.checkAvailability = function(quantity = 1) {
      return this.isAvailable && this.stockQuantity >= quantity;
    };

    // Update stock
    this.schema.methods.updateStock = function(quantity, operation = 'subtract') {
      if (operation === 'subtract') {
        this.stockQuantity -= quantity;
        if (this.stockQuantity <= 0) {
          this.isAvailable = false;
        }
      } else {
        this.stockQuantity += quantity;
        if (this.stockQuantity > 0) {
          this.isAvailable = true;
        }
      }
      return this.save();
    };

    // Increment sold count
    this.schema.methods.incrementSold = function(quantity) {
      this.totalSold += quantity;
      return this.save();
    };
  }
}

const productListingModel = new ProductListingModel();
module.exports = productListingModel.createModel('ProductListing');
