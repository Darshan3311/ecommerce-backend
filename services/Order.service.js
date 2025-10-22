const Order = require('../models/Order.model');
const Cart = require('../models/Cart.model');
const ProductListing = require('../models/ProductListing.model');
const EmailConfig = require('../config/email.config');
const { ErrorHandler } = require('../middleware/error.middleware');

class OrderService {
  // Create order from cart
  async createOrder(userId, orderData) {
    try {
      const { shippingAddress, billingAddress, notes } = orderData;
      // Support payload shapes where payment.method is provided or paymentMethod top-level
      const paymentMethod = (orderData.payment && orderData.payment.method) || orderData.paymentMethod;

      // Get user's cart
      const cart = await Cart.findOne({ user: userId })
        .populate('items.product');

      console.log('Cart loaded for user', userId.toString(), 'cartItems:', cart?.items?.length || 0);

      if (!cart || cart.items.length === 0) {
        throw new ErrorHandler('Cart is empty', 400);
      }

      // Validate stock availability
      for (const item of cart.items) {
        if (item.product && item.product.stock != null) {
          if (item.product.stock < item.quantity) {
            throw new ErrorHandler(`${item.product.name} is not available in requested quantity`, 400);
          }
        }
      }

      // Prepare order items
      const orderItems = cart.items.map(item => {
        return {
          product: item.product?._id || item.product,
          productListing: item.productListing || null,
          productVariant: item.productVariant || null,
          seller: item.seller || null,
          productName: item.product?.name || '',
          variantName: '',
          quantity: item.quantity,
          priceAtPurchase: item.price,
          status: 'pending'
        };
      });

      // Generate order number
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      const count = await Order.countDocuments({
        createdAt: {
          $gte: new Date(year, date.getMonth(), date.getDate()),
          $lt: new Date(year, date.getMonth(), date.getDate() + 1)
        }
      });
      
      const orderNumber = `ORD-${year}${month}${day}-${String(count + 1).padStart(4, '0')}`;

      // Create order
      const order = await Order.create({
        orderNumber,
        user: userId,
        items: orderItems,
        shippingAddress,
        billingAddress: billingAddress || shippingAddress,
        payment: {
          method: paymentMethod,
          status: paymentMethod === 'cod' ? 'pending' : 'pending'
        },
        pricing: {
          subtotal: cart.subtotal,
          tax: cart.tax,
          shipping: 0,
          discount: 0,
          total: cart.total
        },
        notes
      });

      // Update stock quantities
      for (const item of cart.items) {
        if (item.product && item.product.stock != null) {
          const Product = require('../models/Product.model');
          const prod = await Product.findById(item.product._id || item.product);
          if (prod) {
            prod.stock = Math.max(0, (prod.stock || 0) - item.quantity);
            await prod.save();
          }
        }
      }

      // Clear cart
      await cart.clearCart();

      // Send order confirmation email
      const user = await require('../models/User.model').findById(userId);
      if (user && user.email) {
        try {
          await EmailConfig.sendOrderConfirmation(user.email, {
            orderId: order.orderNumber,
            total: order.pricing.total,
            status: order.orderStatus
          });
        } catch (emailError) {
          console.error('Failed to send order confirmation email:', emailError.message);
        }
      }

      return await order.populate('items.product');
    } catch (error) {
      throw error;
    }
  }  // Get user orders
  async getUserOrders(userId, options = {}) {
    try {
      const { page = 1, limit = 10, status } = options;
      const skip = (page - 1) * limit;

      const query = { user: userId };
      if (status) {
        query.orderStatus = status;
      }

      const orders = await Order.find(query)
        .populate([
          { path: 'items.product' },
          { path: 'items.productVariant' },
          { path: 'items.seller' }
        ])
        .sort('-createdAt')
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Order.countDocuments(query);

      return {
        orders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Get order by ID
  async getOrderById(orderId, userId = null) {
    try {
      const query = { _id: orderId };
      if (userId) {
        query.user = userId;
      }

      const order = await Order.findOne(query)
        .populate([
          { path: 'user', select: 'firstName lastName email' },
          { path: 'items.product' },
          { path: 'items.productVariant' },
          { path: 'items.seller' }
        ]);

      if (!order) {
        throw new ErrorHandler('Order not found', 404);
      }

      return order;
    } catch (error) {
      throw error;
    }
  }

  // Update order status
  async updateOrderStatus(orderId, status) {
    try {
      const order = await Order.findById(orderId);

      if (!order) {
        throw new ErrorHandler('Order not found', 404);
      }

      await order.updateStatus(status);

      return order;
    } catch (error) {
      throw error;
    }
  }

  // Cancel order
  async cancelOrder(orderId, userId, reason) {
    try {
      const order = await Order.findOne({ _id: orderId, user: userId });

      if (!order) {
        throw new ErrorHandler('Order not found', 404);
      }

      if (!['pending', 'confirmed'].includes(order.orderStatus)) {
        throw new ErrorHandler('Order cannot be cancelled at this stage', 400);
      }

      // Restore stock
      for (const item of order.items) {
        const productListing = await ProductListing.findById(item.productListing);
        if (productListing) {
          await productListing.updateStock(item.quantity, 'add');
        }
      }

      await order.cancelOrder(reason);

      return order;
    } catch (error) {
      throw error;
    }
  }

  // Get seller orders
  async getSellerOrders(sellerId, options = {}) {
    try {
      const { page = 1, limit = 10, status } = options;
      const skip = (page - 1) * limit;

      const query = { 'items.seller': sellerId };
      if (status) {
        query['items.status'] = status;
      }

      const orders = await Order.find(query)
        .populate([
          { path: 'user', select: 'firstName lastName email' },
          { path: 'items.product' },
          { path: 'items.productVariant' }
        ])
        .sort('-createdAt')
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Order.countDocuments(query);

      return {
        orders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new OrderService();
