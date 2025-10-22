const Product = require('../models/Product.model');
const ProductVariant = require('../models/ProductVariant.model');
const Category = require('../models/Category.model');
const Brand = require('../models/Brand.model');
const CloudinaryConfig = require('../config/cloudinary.config');
const { ErrorHandler } = require('../middleware/error.middleware');

class ProductService {
  // Create product
  async createProduct(productData, images = []) {
    try {
      // Upload images to Cloudinary
      const uploadedImages = [];
      if (images && images.length > 0) {
        for (const image of images) {
          const result = await CloudinaryConfig.uploadImage(
            `data:${image.mimetype};base64,${image.buffer.toString('base64')}`,
            'products'
          );
          uploadedImages.push({
            public_id: result.public_id,
            url: result.url,
            isPrimary: uploadedImages.length === 0
          });
        }
      }

      const product = await Product.create({
        ...productData,
        images: uploadedImages
      });

      return await product.populate('categories');
    } catch (error) {
      throw error;
    }
  }

  // Get all products with filters and pagination
  async getAllProducts(filters = {}, options = {}) {
    try {
      const {
        page = 1,
        limit = 12,
        sort = '-createdAt',
        search = '',
        category = '',
        brand = '',
        minPrice = 0,
        maxPrice = Number.MAX_SAFE_INTEGER,
        rating = 0,
        inStock = false
      } = options;

      const query = { isActive: true, isDeleted: false };

      // Search
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { shortDescription: { $regex: search, $options: 'i' } }
        ];
      }

      // Category filter
      if (category) {
        query.categories = category;
      }

      // Brand filter
      if (brand) {
        query.brand = brand;
      }

      // Rating filter
      if (rating > 0) {
        query.averageRating = { $gte: rating };
      }

      const skip = (page - 1) * limit;

      const products = await Product.find(query)
        .populate('categories')
        .populate({
          path: 'variants',
          match: { 
            isActive: true,
            ...(inStock && { stockQuantity: { $gt: 0 } })
          }
        })
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit));

      // Filter products based on variant prices
      let filteredProducts = products;
      if (minPrice > 0 || maxPrice < Number.MAX_SAFE_INTEGER) {
        filteredProducts = products.filter(product => {
          if (product.variants && product.variants.length > 0) {
            return product.variants.some(
              variant => variant.price >= minPrice && variant.price <= maxPrice
            );
          }
          return false;
        });
      }

      const total = await Product.countDocuments(query);

      return {
        products: filteredProducts,
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

  // Get product by ID or slug
  async getProductById(identifier, incrementViews = true) {
    try {
      const query = identifier.match(/^[0-9a-fA-F]{24}$/)
        ? { _id: identifier }
        : { slug: identifier };

      const product = await Product.findOne({ ...query, isActive: true })
        .populate('categories')
        .populate({
          path: 'variants',
          match: { isActive: true }
        });

      if (!product) {
        throw new ErrorHandler('Product not found', 404);
      }

      if (incrementViews) {
        await product.incrementViews();
      }

      return product;
    } catch (error) {
      throw error;
    }
  }

  // Update product
  async updateProduct(productId, updateData, newImages = []) {
    try {
      const product = await Product.findById(productId);

      if (!product) {
        throw new ErrorHandler('Product not found', 404);
      }

      // Upload new images if provided
      if (newImages && newImages.length > 0) {
        const uploadedImages = [];
        for (const image of newImages) {
          const result = await CloudinaryConfig.uploadImage(
            `data:${image.mimetype};base64,${image.buffer.toString('base64')}`,
            'products'
          );
          uploadedImages.push({
            public_id: result.public_id,
            url: result.url
          });
        }
        updateData.images = [...(product.images || []), ...uploadedImages];
      }

      Object.assign(product, updateData);
      await product.save();

      return await product.populate('categories');
    } catch (error) {
      throw error;
    }
  }

  // Hard delete product (permanently remove from database)
  async deleteProduct(productId) {
    try {
      const product = await Product.findById(productId);

      if (!product) {
        throw new ErrorHandler('Product not found', 404);
      }

      // Permanently delete from database
      await Product.findByIdAndDelete(productId);

      return { message: 'Product permanently deleted' };
    } catch (error) {
      throw error;
    }
  }

  // Toggle product active status (soft delete/restore)
  async toggleProductStatus(productId) {
    try {
      const product = await Product.findById(productId);

      if (!product) {
        throw new ErrorHandler('Product not found', 404);
      }

      // Toggle active status
      product.isActive = !product.isActive;
      await product.save();

      return { 
        message: product.isActive ? 'Product activated' : 'Product deactivated',
        isActive: product.isActive
      };
    } catch (error) {
      throw error;
    }
  }

  // Create product variant
  async createProductVariant(productId, variantData) {
    try {
      const product = await Product.findById(productId);

      if (!product) {
        throw new ErrorHandler('Product not found', 404);
      }

      const variant = await ProductVariant.create({
        ...variantData,
        product: productId
      });

      return variant;
    } catch (error) {
      throw error;
    }
  }

  // Get featured products
  async getFeaturedProducts(limit = 8) {
    try {
      const products = await Product.find({ isFeatured: true, isActive: true })
        .populate('categories')
        .populate({
          path: 'variants',
          match: { isActive: true }
        })
        .limit(limit)
        .sort('-createdAt');

      return products;
    } catch (error) {
      throw error;
    }
  }

  // Get related products
  async getRelatedProducts(productId, limit = 4) {
    try {
      const product = await Product.findById(productId);

      if (!product) {
        throw new ErrorHandler('Product not found', 404);
      }

      const relatedProducts = await Product.find({
        _id: { $ne: productId },
        categories: { $in: product.categories },
        isActive: true
      })
        .populate('categories')
        .populate({
          path: 'variants',
          match: { isActive: true }
        })
        .limit(limit)
        .sort('-averageRating');

      return relatedProducts;
    } catch (error) {
      throw error;
    }
  }

  // Search products
  async searchProducts(searchQuery, options = {}) {
    try {
      const { page = 1, limit = 12 } = options;

      const query = {
        $or: [
          { name: { $regex: searchQuery, $options: 'i' } },
          { description: { $regex: searchQuery, $options: 'i' } },
          { shortDescription: { $regex: searchQuery, $options: 'i' } }
        ],
        isActive: true
      };

      const skip = (page - 1) * limit;

      const products = await Product.find(query)
        .populate('categories')
        .populate({
          path: 'variants',
          match: { isActive: true }
        })
        .skip(skip)
        .limit(parseInt(limit))
        .sort('-averageRating');

      const total = await Product.countDocuments(query);

      return {
        products,
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

module.exports = new ProductService();
