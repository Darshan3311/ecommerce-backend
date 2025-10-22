const mongoose = require('mongoose');
const slugify = require('slugify');
const BaseModel = require('./base/BaseModel');

const categorySchemaDefinition = {
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true,
    maxlength: [100, 'Category name cannot exceed 100 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  image: {
    public_id: String,
    url: String
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  level: {
    type: Number,
    default: 0
  },
  order: {
    type: Number,
    default: 0
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  metaTitle: String,
  metaDescription: String,
  metaKeywords: [String]
};

class CategoryModel extends BaseModel {
  constructor() {
    super(categorySchemaDefinition);
    this.addCategoryMethods();
    this.addCategoryMiddleware();
  }

  addCategoryMethods() {
    // Get all subcategories
    this.schema.methods.getSubcategories = function() {
      return this.constructor.find({ parent: this._id, isActive: true });
    };

    // Get category path
    this.schema.methods.getCategoryPath = async function() {
      const path = [this.name];
      let current = this;
      
      while (current.parent) {
        current = await this.constructor.findById(current.parent);
        if (current) path.unshift(current.name);
      }
      
      return path.join(' > ');
    };

    // Check if category has children
    this.schema.methods.hasChildren = async function() {
      const count = await this.constructor.countDocuments({ parent: this._id });
      return count > 0;
    };
  }

  addCategoryMiddleware() {
    // Generate slug before saving
    this.schema.pre('save', function(next) {
      if (this.isModified('name')) {
        this.slug = slugify(this.name, { lower: true, strict: true });
      }
      next();
    });

    // Set level based on parent
    this.schema.pre('save', async function(next) {
      if (this.parent) {
        const parentCategory = await this.constructor.findById(this.parent);
        this.level = parentCategory ? parentCategory.level + 1 : 0;
      } else {
        this.level = 0;
      }
      next();
    });
  }
}

const categoryModel = new CategoryModel();
module.exports = categoryModel.createModel('Category');
