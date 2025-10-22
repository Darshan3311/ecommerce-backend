const mongoose = require('mongoose');
require('dotenv').config();

async function checkCategoriesAndBrands() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const Category = require('../models/Category.model');
    const Brand = require('../models/Brand.model');

    const categories = await Category.find();
    const brands = await Brand.find();

    console.log(`📂 Categories: ${categories.length}`);
    if (categories.length === 0) {
      console.log('❌ No categories found! Need to create some.');
    } else {
      console.log('\nAvailable Categories:');
      categories.forEach((cat, i) => {
        console.log(`${i + 1}. ${cat.name} (ID: ${cat._id})`);
      });
    }

    console.log(`\n🏷️  Brands: ${brands.length}`);
    if (brands.length === 0) {
      console.log('❌ No brands found! Need to create some.');
    } else {
      console.log('\nAvailable Brands:');
      brands.forEach((brand, i) => {
        console.log(`${i + 1}. ${brand.name} (ID: ${brand._id})`);
      });
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkCategoriesAndBrands();
