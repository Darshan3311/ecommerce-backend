const mongoose = require('mongoose');
const BaseModel = require('./base/BaseModel');

const brandSchemaDefinition = {
  name: {
    type: String,
    required: [true, 'Brand name is required'],
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: String,
  logo: {
    public_id: String,
    url: String
  },
  website: String,
  isFeatured: {
    type: Boolean,
    default: false
  }
};

class BrandModel extends BaseModel {
  constructor() {
    super(brandSchemaDefinition);
  }
}

const brandModel = new BrandModel();
module.exports = brandModel.createModel('Brand');
