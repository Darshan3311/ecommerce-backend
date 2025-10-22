const OrderService = require('../services/Order.service');

class OrderController {
  // Create order
  async createOrder(req, res, next) {
    try {
      console.log('Create order request by user:', req.user?._id?.toString());
      console.log('Order payload:', JSON.stringify(req.body).slice(0, 1000));

      const order = await OrderService.createOrder(req.user._id, req.body);

      res.status(201).json({
        status: 'success',
        data: { order }
      });
    } catch (error) {
      console.error('CreateOrder error:', error && (error.stack || error.message || error));
      next(error);
    }
  }

  // Get user orders
  async getUserOrders(req, res, next) {
    try {
      const result = await OrderService.getUserOrders(req.user._id, req.query);

      res.status(200).json({
        status: 'success',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Get order by ID
  async getOrderById(req, res, next) {
    try {
      const order = await OrderService.getOrderById(req.params.id, req.user._id);

      res.status(200).json({
        status: 'success',
        data: { order }
      });
    } catch (error) {
      next(error);
    }
  }

  // Update order status (admin/seller)
  async updateOrderStatus(req, res, next) {
    try {
      const { status } = req.body;
      const order = await OrderService.updateOrderStatus(req.params.id, status);

      res.status(200).json({
        status: 'success',
        data: { order }
      });
    } catch (error) {
      next(error);
    }
  }

  // Cancel order
  async cancelOrder(req, res, next) {
    try {
      const { reason } = req.body;
      const order = await OrderService.cancelOrder(
        req.params.id,
        req.user._id,
        reason
      );

      res.status(200).json({
        status: 'success',
        data: { order }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get seller orders
  async getSellerOrders(req, res, next) {
    try {
      const result = await OrderService.getSellerOrders(req.params.sellerId, req.query);

      res.status(200).json({
        status: 'success',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new OrderController();
