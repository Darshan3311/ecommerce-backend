const CartService = require('../services/Cart.service');

class CartController {
  // Get cart
  async getCart(req, res, next) {
    try {
      const cart = await CartService.getCart(req.user._id);

      res.status(200).json({
        status: 'success',
        data: { cart }
      });
    } catch (error) {
      next(error);
    }
  }

  // Add to cart
  async addToCart(req, res, next) {
    try {
      const { productId, productListingId, quantity } = req.body;
      const id = productId || productListingId; // Support both field names
      const cart = await CartService.addToCart(
        req.user._id,
        id,
        quantity
      );

      console.log('Cart after add:', { user: req.user._id.toString(), items: cart.items.length });
      res.status(200).json({
        status: 'success',
        data: { cart }
      });
    } catch (error) {
      next(error);
    }
  }

  // Update cart item
  async updateCartItem(req, res, next) {
    try {
      const { productId, productListingId } = req.params;
      const id = productId || productListingId;
      const { quantity } = req.body;
      const cart = await CartService.updateCartItem(
        req.user._id,
        id,
        quantity
      );

      console.log('Cart after update:', { user: req.user._id.toString(), items: cart.items.length });
      res.status(200).json({
        status: 'success',
        data: { cart }
      });
    } catch (error) {
      next(error);
    }
  }

  // Remove from cart
  async removeFromCart(req, res, next) {
    try {
      const { productId, productListingId } = req.params;
      const id = productId || productListingId;
      const cart = await CartService.removeFromCart(req.user._id, id);

      console.log('Cart after remove:', { user: req.user._id.toString(), items: cart.items.length });
      res.status(200).json({
        status: 'success',
        data: { cart }
      });
    } catch (error) {
      next(error);
    }
  }

  // Clear cart
  async clearCart(req, res, next) {
    try {
      const cart = await CartService.clearCart(req.user._id);

      res.status(200).json({
        status: 'success',
        data: { cart }
      });
    } catch (error) {
      next(error);
    }
  }

  // Sync cart
  async syncCart(req, res, next) {
    try {
      const { items } = req.body;
      const cart = await CartService.syncCart(req.user._id, items);

      res.status(200).json({
        status: 'success',
        data: { cart }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CartController();
