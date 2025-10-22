const Wishlist = require('../models/Wishlist.model');
const Product = require('../models/Product.model');

class WishlistController {
  // Get user's wishlist
  async getWishlist(req, res, next) {
    try {
      let wishlist = await Wishlist.findOne({ user: req.user.id })
        .populate({
          path: 'items.product',
          select: 'name price images stock brand categories isActive'
        });

      if (!wishlist) {
        wishlist = await Wishlist.create({ user: req.user.id, items: [] });
        // Re-fetch with populate after creation
        wishlist = await Wishlist.findById(wishlist._id)
          .populate({
            path: 'items.product',
            select: 'name price images stock brand categories isActive'
          });
      }

      // Filter out inactive or deleted products
      if (wishlist && wishlist.items) {
        wishlist.items = wishlist.items.filter(
          item => item.product && item.product.isActive
        );
      }

      res.status(200).json({
        status: 'success',
        data: wishlist
      });
    } catch (error) {
      next(error);
    }
  }

  // Add item to wishlist
  async addToWishlist(req, res, next) {
    try {
      const { productId } = req.body;
      console.log('Add to wishlist request:', { userId: req.user.id, productId });

      // Validate productId
      if (!productId) {
        return res.status(400).json({
          status: 'error',
          message: 'Product ID is required'
        });
      }

      // Validate product exists
      const product = await Product.findById(productId);
      if (!product || !product.isActive) {
        console.log('Product not found or inactive:', productId);
        return res.status(404).json({
          status: 'error',
          message: 'Product not found'
        });
      }

      // Get or create wishlist
      let wishlist = await Wishlist.findOne({ user: req.user.id });
      if (!wishlist) {
        wishlist = await Wishlist.create({ user: req.user.id, items: [] });
      }

      console.log('Current wishlist items:', wishlist.items.map(i => i.product.toString()));

      // Check if product already in wishlist
      const existingItem = wishlist.items.find(
        item => item.product.toString() === productId
      );

      if (existingItem) {
        console.log('Product already in wishlist');
        return res.status(400).json({
          status: 'error',
          message: 'Product already in wishlist'
        });
      }

      // Add product to wishlist
      wishlist.items.push({ product: productId });
      await wishlist.save();

      // Re-fetch with populate to ensure data is fresh
      wishlist = await Wishlist.findById(wishlist._id)
        .populate({
          path: 'items.product',
          select: 'name price images stock brand categories isActive'
        });

      // Debug log: show wishlist shape being returned
      console.log('Returning wishlist after add:', {
        id: wishlist._id.toString(),
        itemsCount: wishlist.items.length,
        items: wishlist.items.map(i => ({ id: i._id.toString(), product: i.product }))
      });

      res.status(200).json({
        status: 'success',
        message: 'Product added to wishlist',
        data: wishlist
      });
    } catch (error) {
      next(error);
    }
  }

  // Remove item from wishlist
  async removeFromWishlist(req, res, next) {
    try {
      const { productId } = req.params;

      const wishlist = await Wishlist.findOne({ user: req.user.id });
      
      if (!wishlist) {
        return res.status(404).json({
          status: 'error',
          message: 'Wishlist not found'
        });
      }

      // Remove product from wishlist
      wishlist.items = wishlist.items.filter(
        item => item.product.toString() !== productId
      );
      
      await wishlist.save();

      // Populate the wishlist
      await wishlist.populate({
        path: 'items.product',
        select: 'name price images stock brand categories isActive'
      });

      res.status(200).json({
        status: 'success',
        message: 'Product removed from wishlist',
        data: wishlist
      });
    } catch (error) {
      next(error);
    }
  }

  // Clear entire wishlist
  async clearWishlist(req, res, next) {
    try {
      const wishlist = await Wishlist.findOne({ user: req.user.id });
      
      if (!wishlist) {
        return res.status(404).json({
          status: 'error',
          message: 'Wishlist not found'
        });
      }

      wishlist.items = [];
      await wishlist.save();

      res.status(200).json({
        status: 'success',
        message: 'Wishlist cleared',
        data: wishlist
      });
    } catch (error) {
      next(error);
    }
  }

  // Move item from wishlist to cart
  async moveToCart(req, res, next) {
    try {
      const { productId } = req.params;
      const Cart = require('../models/Cart.model');

      // Get wishlist
      const wishlist = await Wishlist.findOne({ user: req.user.id });
      if (!wishlist) {
        return res.status(404).json({
          status: 'error',
          message: 'Wishlist not found'
        });
      }

      // Check if product in wishlist
      const wishlistItem = wishlist.items.find(
        item => item.product.toString() === productId
      );

      if (!wishlistItem) {
        return res.status(404).json({
          status: 'error',
          message: 'Product not found in wishlist'
        });
      }

      // Get product details
      const product = await Product.findById(productId);
      if (!product || !product.isActive) {
        return res.status(404).json({
          status: 'error',
          message: 'Product not found'
        });
      }

      if (product.stock < 1) {
        return res.status(400).json({
          status: 'error',
          message: 'Product out of stock'
        });
      }

      // Get or create cart
      let cart = await Cart.findOne({ user: req.user.id });
      if (!cart) {
        cart = await Cart.create({ user: req.user.id, items: [] });
      }

      // Check if product already in cart
      const cartItem = cart.items.find(
        item => item.product.toString() === productId
      );

      if (cartItem) {
        // Update quantity if already in cart
        cartItem.quantity += 1;
      } else {
        // Add to cart
        cart.items.push({
          product: productId,
          quantity: 1,
          price: product.price
        });
      }

      // Calculate totals
      cart.subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      cart.tax = cart.subtotal * 0.08;
      cart.total = cart.subtotal + cart.tax;

      await cart.save();

      // Remove from wishlist
      wishlist.items = wishlist.items.filter(
        item => item.product.toString() !== productId
      );
      await wishlist.save();

      res.status(200).json({
        status: 'success',
        message: 'Product moved to cart',
        data: { wishlist, cart }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new WishlistController();
