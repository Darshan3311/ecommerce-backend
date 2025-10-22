const Cart = require('../models/Cart.model');
const Product = require('../models/Product.model');
const { ErrorHandler } = require('../middleware/error.middleware');

class CartService {
  // Get or create cart for user
  async getCart(userId) {
    try {
      let cart = await Cart.findOne({ user: userId })
        .populate('items.product');

      if (!cart) {
        cart = await Cart.create({ user: userId });
      }

      return cart;
    } catch (error) {
      throw error;
    }
  }

  // Add item to cart
  async addToCart(userId, productId, quantity = 1) {
    try {
      const product = await Product.findById(productId);

      if (!product) {
        throw new ErrorHandler('Product not found', 404);
      }

      if (!product.isActive) {
        throw new ErrorHandler('Product is not available', 400);
      }

      if (product.stock < quantity) {
        throw new ErrorHandler('Not enough stock available', 400);
      }

      let cart = await this.getCart(userId);

      // Check if product already in cart
      const existingItemIndex = cart.items.findIndex(
        item => item.product.toString() === productId
      );

      if (existingItemIndex > -1) {
        // Update quantity
        const newQuantity = cart.items[existingItemIndex].quantity + quantity;
        if (product.stock < newQuantity) {
          throw new ErrorHandler('Not enough stock available', 400);
        }
        cart.items[existingItemIndex].quantity = newQuantity;
      } else {
        // Add new item
        cart.items.push({
          product: productId,
          quantity,
          price: product.price
        });
      }

      // Calculate totals
      cart.subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      cart.tax = cart.subtotal * 0.08; // 8% tax
      cart.total = cart.subtotal + cart.tax;

      await cart.save();

      return await cart.populate('items.product');
    } catch (error) {
      throw error;
    }
  }

  // Remove item from cart
  async removeFromCart(userId, productId) {
    try {
      const cart = await this.getCart(userId);

      // Try to remove by product id first, but also tolerate removal by productListing id
      const beforeCount = cart.items.length;

      cart.items = cart.items.filter(item => {
        try {
          // item.product and item.productListing may be ObjectId or populated object
          const prodId = item.product?._id ? item.product._id.toString() : (item.product ? item.product.toString() : undefined);
          const listingId = item.productListing?._id ? item.productListing._id.toString() : (item.productListing ? item.productListing.toString() : undefined);

          return prodId !== productId && listingId !== productId;
        } catch (e) {
          // In case of any unexpected shape, keep the item
          return true;
        }
      });

      const afterCount = cart.items.length;
      console.log(`Cart removal requested for id=${productId}; items before=${beforeCount}, after=${afterCount}`);

      // Recalculate totals
      cart.subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      cart.tax = cart.subtotal * 0.08;
      cart.total = cart.subtotal + cart.tax;

      await cart.save();

      return cart;
    } catch (error) {
      throw error;
    }
  }

  // Update item quantity
  async updateCartItem(userId, productId, quantity) {
    try {
      const cart = await this.getCart(userId);
      
      const product = await Product.findById(productId);
      if (!product || product.stock < quantity) {
        throw new ErrorHandler('Product is not available in requested quantity', 400);
      }

      const itemIndex = cart.items.findIndex(
        item => item.product.toString() === productId
      );

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity = quantity;
        cart.items[itemIndex].price = product.price;
      }

      // Recalculate totals
      cart.subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      cart.tax = cart.subtotal * 0.08;
      cart.total = cart.subtotal + cart.tax;

      await cart.save();

      return await cart.populate('items.product');
    } catch (error) {
      throw error;
    }
  }

  // Clear cart
  async clearCart(userId) {
    try {
      const cart = await this.getCart(userId);
      
      cart.items = [];
      cart.subtotal = 0;
      cart.tax = 0;
      cart.total = 0;

      await cart.save();

      return cart;
    } catch (error) {
      throw error;
    }
  }

  // Sync cart with local storage
  async syncCart(userId, localCartItems) {
    try {
      const cart = await this.getCart(userId);

      for (const item of localCartItems) {
        const product = await Product.findById(item.productId || item.productListingId);
        if (product && product.isActive && product.stock >= item.quantity) {
          // Check if already in cart
          const existingIndex = cart.items.findIndex(
            i => i.product.toString() === product._id.toString()
          );

          if (existingIndex > -1) {
            cart.items[existingIndex].quantity += item.quantity;
          } else {
            cart.items.push({
              product: product._id,
              quantity: item.quantity,
              price: product.price
            });
          }
        }
      }

      // Recalculate totals
      cart.subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      cart.tax = cart.subtotal * 0.08;
      cart.total = cart.subtotal + cart.tax;

      await cart.save();

      return await cart.populate('items.product');
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new CartService();
