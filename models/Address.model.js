const mongoose = require('mongoose');
const BaseModel = require('./base/BaseModel');

const addressSchemaDefinition = {
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  addressLine1: {
    type: String,
    required: [true, 'Address line 1 is required'],
    trim: true
  },
  addressLine2: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true,
    default: 'USA'
  },
  zipCode: {
    type: String,
    required: [true, 'Zip code is required'],
    trim: true
  },
  addressType: {
    type: String,
    enum: ['home', 'work', 'other'],
    default: 'home'
  },
  isDefault: {
    type: Boolean,
    default: false
  }
};

class AddressModel extends BaseModel {
  constructor() {
    super(addressSchemaDefinition);
    this.addAddressMethods();
    this.addAddressMiddleware();
  }

  addAddressMethods() {
    // Get formatted address
    this.schema.methods.getFormattedAddress = function() {
      let address = this.addressLine1;
      if (this.addressLine2) address += `, ${this.addressLine2}`;
      address += `, ${this.city}, ${this.state} ${this.zipCode}, ${this.country}`;
      return address;
    };

    // Set as default
    this.schema.methods.setAsDefault = async function() {
      // Remove default from all other addresses
      await this.constructor.updateMany(
        { user: this.user, _id: { $ne: this._id } },
        { isDefault: false }
      );
      this.isDefault = true;
      return this.save();
    };
  }

  addAddressMiddleware() {
    // Ensure only one default address per user
    this.schema.pre('save', async function(next) {
      if (this.isDefault && this.isModified('isDefault')) {
        await this.constructor.updateMany(
          { user: this.user, _id: { $ne: this._id } },
          { isDefault: false }
        );
      }
      next();
    });
  }
}

const addressModel = new AddressModel();
module.exports = addressModel.createModel('Address');
