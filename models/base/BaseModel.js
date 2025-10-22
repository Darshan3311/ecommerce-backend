const mongoose = require('mongoose');

class BaseModel {
  constructor(schemaDefinition, options = {}) {
    const baseSchemaDefinition = {
      ...schemaDefinition,
      isActive: {
        type: Boolean,
        default: true
      },
      isDeleted: {
        type: Boolean,
        default: false
      }
    };

    const defaultOptions = {
      timestamps: true,
      toJSON: { 
        virtuals: true,
        transform: function(doc, ret) {
          delete ret.__v;
          return ret;
        }
      },
      toObject: { virtuals: true },
      ...options
    };

    this.schema = new mongoose.Schema(baseSchemaDefinition, defaultOptions);
    this.addBaseMethods();
  }

  addBaseMethods() {
    // Soft delete
    this.schema.methods.softDelete = function() {
      this.isDeleted = true;
      this.isActive = false;
      return this.save();
    };

    // Restore
    this.schema.methods.restore = function() {
      this.isDeleted = false;
      this.isActive = true;
      return this.save();
    };

    // Query helper for active records
    this.schema.query.active = function() {
      return this.where({ isActive: true, isDeleted: false });
    };
  }

  getSchema() {
    return this.schema;
  }

  createModel(modelName) {
    return mongoose.model(modelName, this.schema);
  }
}

module.exports = BaseModel;
