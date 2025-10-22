const ProductService = require('../services/Product.service');

class ProductController {
  // Create product
  async createProduct(req, res, next) {
    try {
      const images = req.files || [];
      
      // Find seller ID from user ID
      const Seller = require('../models/Seller.model');
      const seller = await Seller.findOne({ user: req.user.id });
      
      if (!seller) {
        return res.status(403).json({
          status: 'error',
          message: 'You must have an approved seller account to create products'
        });
      }
      
      // Add seller ID to product data
      const productData = {
        ...req.body,
        seller: seller._id
      };
      const product = await ProductService.createProduct(productData, images);

      res.status(201).json({
        status: 'success',
        success: true,
        data: { product }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get all products
  async getAllProducts(req, res, next) {
    try {
      const result = await ProductService.getAllProducts({}, req.query);

      res.status(200).json({
        status: 'success',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Get product by ID
  async getProductById(req, res, next) {
    try {
      const product = await ProductService.getProductById(req.params.id);

      res.status(200).json({
        status: 'success',
        data: { product }
      });
    } catch (error) {
      next(error);
    }
  }

  // Update product
  async updateProduct(req, res, next) {
    try {
      const images = req.files || [];
      const product = await ProductService.updateProduct(
        req.params.id,
        req.body,
        images
      );

      res.status(200).json({
        status: 'success',
        data: { product }
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete product (hard delete - permanently remove)
  async deleteProduct(req, res, next) {
    try {
      const result = await ProductService.deleteProduct(req.params.id);

      res.status(200).json({
        status: 'success',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Toggle product status (activate/deactivate)
  async toggleProductStatus(req, res, next) {
    try {
      const result = await ProductService.toggleProductStatus(req.params.id);

      res.status(200).json({
        status: 'success',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Get featured products
  async getFeaturedProducts(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 8;
      const products = await ProductService.getFeaturedProducts(limit);

      res.status(200).json({
        status: 'success',
        data: { products }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get related products
  async getRelatedProducts(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 4;
      const products = await ProductService.getRelatedProducts(req.params.id, limit);

      res.status(200).json({
        status: 'success',
        data: { products }
      });
    } catch (error) {
      next(error);
    }
  }

  // Search products
  async searchProducts(req, res, next) {
    try {
      const { q } = req.query;
      const result = await ProductService.searchProducts(q, req.query);

      res.status(200).json({
        status: 'success',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Create product variant
  async createProductVariant(req, res, next) {
    try {
      const variant = await ProductService.createProductVariant(
        req.params.id,
        req.body
      );

      res.status(201).json({
        status: 'success',
        data: { variant }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get seller's products
  async getMyProducts(req, res, next) {
    try {
      // Find seller ID from user ID
      const Seller = require('../models/Seller.model');
      const seller = await Seller.findOne({ user: req.user.id });
      
      if (!seller) {
        return res.status(403).json({
          status: 'error',
          message: 'You must have a seller account'
        });
      }
      
      const ProductModel = require('../models/Product.model');
      const products = await ProductModel.find({ seller: seller._id })
        .sort({ createdAt: -1 })
        .populate('categories')
        .populate('seller');

      res.status(200).json({
        success: true,
        data: products
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProductController();
