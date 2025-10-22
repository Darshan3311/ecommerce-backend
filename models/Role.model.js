const mongoose = require('mongoose');
const BaseModel = require('./base/BaseModel');

const roleSchemaDefinition = {
  name: {
    type: String,
    required: [true, 'Role name is required'],
    unique: true,
    enum: ['customer', 'seller', 'admin', 'support'],
    lowercase: true
  },
  description: {
    type: String,
    required: true
  },
  permissions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Permission'
  }],
  priority: {
    type: Number,
    default: 0 // Higher number = higher priority
  }
};

class RoleModel extends BaseModel {
  constructor() {
    super(roleSchemaDefinition);
    this.addRoleMethods();
  }

  addRoleMethods() {
    // Add permission to role
    this.schema.methods.addPermission = function(permissionId) {
      if (!this.permissions.includes(permissionId)) {
        this.permissions.push(permissionId);
        return this.save();
      }
      return this;
    };

    // Remove permission from role
    this.schema.methods.removePermission = function(permissionId) {
      this.permissions = this.permissions.filter(
        p => p.toString() !== permissionId.toString()
      );
      return this.save();
    };

    // Check if role has permission
    this.schema.methods.hasPermission = async function(permissionName) {
      await this.populate('permissions');
      return this.permissions.some(p => p.name === permissionName);
    };
  }
}

const roleModel = new RoleModel();
module.exports = roleModel.createModel('Role');
