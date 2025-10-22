const mongoose = require('mongoose');
const BaseModel = require('./base/BaseModel');

const permissionSchemaDefinition = {
  name: {
    type: String,
    required: [true, 'Permission name is required'],
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: true
  },
  resource: {
    type: String,
    required: true,
    enum: ['user', 'product', 'order', 'category', 'review', 'seller', 'inventory', 'all']
  },
  action: {
    type: String,
    required: true,
    enum: ['create', 'read', 'update', 'delete', 'manage', 'all']
  }
};

class PermissionModel extends BaseModel {
  constructor() {
    super(permissionSchemaDefinition);
  }
}

const permissionModel = new PermissionModel();
module.exports = permissionModel.createModel('Permission');
