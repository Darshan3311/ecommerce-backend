const Address = require('../models/Address.model');

class AddressController {
  // Get user's default address
  async getDefaultAddress(req, res, next) {
    try {
      // If optional auth and no user attached, return success with null address
      if (!req.user) {
        return res.status(200).json({ status: 'success', data: { address: null } });
      }

      const address = await Address.findOne({ user: req.user._id, isDefault: true });

      // If no default address exists, return success with null address
      if (!address) {
        return res.status(200).json({ status: 'success', data: { address: null } });
      }
      res.status(200).json({ status: 'success', data: { address } });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AddressController();
