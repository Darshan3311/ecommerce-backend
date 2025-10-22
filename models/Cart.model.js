const mongoose = require('mongoose');
const BaseModel = require('./base/BaseModel');

const cartSchemaDefinition = {
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [{
    // productListing references a listing document (may include price, seller, variant)
    productListing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductListing'
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    },
    price: {
      type: Number,
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  subtotal: {
    type: Number,
    default: 0
  },
  tax: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    default: 0
  },
  expiresAt: {
    type: Date,
    default: () => Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
  }
};

class CartModel extends BaseModel {
  constructor() {
    super(cartSchemaDefinition);
    this.addCartMethods();
    this.addCartMiddleware();
  }

  addCartMethods() {
    // Add item to cart
    this.schema.methods.addItem = async function(productListing, quantity = 1) {
      const existingItemIndex = this.items.findIndex(
        item => item.productListing.toString() === productListing._id.toString()
      );

      if (existingItemIndex > -1) {
        this.items[existingItemIndex].quantity += quantity;
      } else {
        this.items.push({
          productListing: productListing._id,
          product: productListing.product,
          productVariant: productListing.productVariant,
          quantity: quantity,
          price: productListing.price
        });
      }

      this.calculateTotal();
      return this.save();
    };

    // Remove item from cart
    this.schema.methods.removeItem = function(productListingId) {
      this.items = this.items.filter(
        item => item.productListing.toString() !== productListingId.toString()
      );
      this.calculateTotal();
      return this.save();
    };

    // Update item quantity
    this.schema.methods.updateItemQuantity = function(productListingId, quantity) {
      const item = this.items.find(
        item => item.productListing.toString() === productListingId.toString()
      );

      if (item) {
        if (quantity <= 0) {
          return this.removeItem(productListingId);
        }
        item.quantity = quantity;
        this.calculateTotal();
        return this.save();
      }

      throw new Error('Item not found in cart');
    };

    // Clear cart
    this.schema.methods.clearCart = function() {
      this.items = [];
      this.subtotal = 0;
      this.tax = 0;
      this.total = 0;
      return this.save();
    };

    // Calculate total
    this.schema.methods.calculateTotal = function() {
      this.subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      this.tax = this.subtotal * 0.08; // 8% tax rate
      this.total = this.subtotal + this.tax;
    };

    // Get item count
    this.schema.methods.getItemCount = function() {
      return this.items.reduce((sum, item) => sum + item.quantity, 0);
    };
  }

  addCartMiddleware() {
    // Calculate total before saving
    this.schema.pre('save', function(next) {
      if (this.isModified('items')) {
        this.calculateTotal();
      }
      next();
    });
  }
}

const cartModel = new CartModel();
module.exports = cartModel.createModel('Cart');
