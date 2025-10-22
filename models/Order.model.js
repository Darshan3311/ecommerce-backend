const mongoose = require('mongoose');
const BaseModel = require('./base/BaseModel');

const orderSchemaDefinition = {
  orderNumber: {
    type: String,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    productListing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductListing'
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    productVariant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductVariant'
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Seller'
    },
    productName: String,
    variantName: String,
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    priceAtPurchase: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
      default: 'pending'
    },
    trackingNumber: String,
    shippedAt: Date,
    deliveredAt: Date
  }],
  shippingAddress: {
    fullName: String,
    phone: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  billingAddress: {
    fullName: String,
    phone: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  payment: {
    method: {
      type: String,
      enum: ['card', 'paypal', 'stripe', 'cod'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionId: String,
    paidAt: Date
  },
  pricing: {
    subtotal: {
      type: Number,
      required: true
    },
    tax: {
      type: Number,
      default: 0
    },
    shipping: {
      type: Number,
      default: 0
    },
    discount: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      required: true
    }
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
    default: 'pending'
  },
  notes: String,
  cancellationReason: String,
  cancelledAt: Date
};

class OrderModel extends BaseModel {
  constructor() {
    super(orderSchemaDefinition);
    this.addOrderMethods();
    this.addOrderMiddleware();
  }

  addOrderMethods() {
    // Generate order number
    this.schema.statics.generateOrderNumber = async function() {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      const count = await this.countDocuments({
        createdAt: {
          $gte: new Date(year, date.getMonth(), date.getDate()),
          $lt: new Date(year, date.getMonth(), date.getDate() + 1)
        }
      });
      
      const orderNum = String(count + 1).padStart(4, '0');
      return `ORD-${year}${month}${day}-${orderNum}`;
    };

    // Update order status
    this.schema.methods.updateStatus = function(status) {
      this.orderStatus = status;
      
      // Update all items to same status
      this.items.forEach(item => {
        item.status = status;
      });
      
      return this.save();
    };

    // Cancel order
    this.schema.methods.cancelOrder = function(reason) {
      this.orderStatus = 'cancelled';
      this.cancellationReason = reason;
      this.cancelledAt = Date.now();
      
      this.items.forEach(item => {
        item.status = 'cancelled';
      });
      
      return this.save();
    };

    // Mark as paid
    this.schema.methods.markAsPaid = function(transactionId) {
      this.payment.status = 'completed';
      this.payment.transactionId = transactionId;
      this.payment.paidAt = Date.now();
      this.orderStatus = 'confirmed';
      return this.save();
    };

    // Get sellers in order
    this.schema.methods.getSellers = function() {
      return [...new Set(this.items.map(item => item.seller.toString()))];
    };
  }

  addOrderMiddleware() {
    // Generate order number before saving
    this.schema.pre('save', async function(next) {
      if (this.isNew && !this.orderNumber) {
        this.orderNumber = await this.constructor.generateOrderNumber();
      }
      next();
    });
  }
}

const orderModel = new OrderModel();
module.exports = orderModel.createModel('Order');
