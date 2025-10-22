const Brand = require('../models/Brand.model');

class BrandController {
  // Get all brands
  async getAllBrands(req, res, next) {
    try {
      const brands = await Brand.find({ isActive: true })
        .select('name slug description logo')
        .sort({ name: 1 });

      res.status(200).json({
        status: 'success',
        data: brands
      });
    } catch (error) {
      next(error);
    }
  }

  // Get brand by ID
  async getBrandById(req, res, next) {
  try {
    const brand = await Brand.findById(req.params.id);

    if (!brand) {
      return res.status(404).json({
        status: 'error',
        message: 'Brand not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: brand
    });
    } catch (error) {
      next(error);
    }
  }

  // Create brand (Admin only)
  async createBrand(req, res, next) {
  try {
    const brand = await Brand.create(req.body);

    res.status(201).json({
      status: 'success',
      data: brand
    });
    } catch (error) {
      next(error);
    }
  }

  // Update brand (Admin only)
  async updateBrand(req, res, next) {
  try {
    const brand = await Brand.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!brand) {
      return res.status(404).json({
        status: 'error',
        message: 'Brand not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: brand
    });
    } catch (error) {
      next(error);
    }
  }

  // Delete brand (Admin only)
  async deleteBrand(req, res, next) {
  try {
    const brand = await Brand.findByIdAndDelete(req.params.id);

    if (!brand) {
      return res.status(404).json({
        status: 'error',
        message: 'Brand not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Brand deleted successfully'
    });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new BrandController();
