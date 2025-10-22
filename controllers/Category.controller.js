const Category = require('../models/Category.model');

class CategoryController {
  // Get all categories
  async getAllCategories(req, res, next) {
    try {
      const categories = await Category.find({ isActive: true })
        .select('name slug description image')
        .sort({ name: 1 });

      res.status(200).json({
        status: 'success',
        data: categories
      });
    } catch (error) {
      next(error);
    }
  }

  // Get category by ID
  async getCategoryById(req, res, next) {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        status: 'error',
        message: 'Category not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: category
    });
    } catch (error) {
      next(error);
    }
  }

  // Create category (Admin only)
  async createCategory(req, res, next) {
  try {
    const category = await Category.create(req.body);

    res.status(201).json({
      status: 'success',
      data: category
    });
    } catch (error) {
      next(error);
    }
  }

  // Update category (Admin only)
  async updateCategory(req, res, next) {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({
        status: 'error',
        message: 'Category not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: category
    });
    } catch (error) {
      next(error);
    }
  }

  // Delete category (Admin only)
  async deleteCategory(req, res, next) {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({
        status: 'error',
        message: 'Category not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Category deleted successfully'
    });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CategoryController();
