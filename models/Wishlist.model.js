const mongoose = require('mongoose');
const BaseModel = require('./base/BaseModel');

const wishlistSchemaDefinition = {
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }]
};

class WishlistModel extends BaseModel {
  constructor() {
    super(wishlistSchemaDefinition);
    this.addWishlistMethods();
  }

  addWishlistMethods() {
    // Add item
    this.schema.methods.addItem = function(productId) {
      const exists = this.items.some(
        item => item.product.toString() === productId.toString()
      );

      if (!exists) {
        this.items.push({ product: productId });
        return this.save();
      }

      return this;
    };

    // Remove item
    this.schema.methods.removeItem = function(productId) {
      this.items = this.items.filter(
        item => item.product.toString() !== productId.toString()
      );
      return this.save();
    };

    // Check if item exists
    this.schema.methods.hasItem = function(productId) {
      return this.items.some(
        item => item.product.toString() === productId.toString()
      );
    };

    // Clear wishlist
    this.schema.methods.clearWishlist = function() {
      this.items = [];
      return this.save();
    };
  }
}

const wishlistModel = new WishlistModel();
module.exports = wishlistModel.createModel('Wishlist');
