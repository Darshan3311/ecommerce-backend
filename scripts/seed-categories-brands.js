const mongoose = require('mongoose');
require('dotenv').config();

async function seedCategoriesAndBrands() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const Category = require('../models/Category.model');
    const Brand = require('../models/Brand.model');

    // Check if already exist
    const existingCats = await Category.find();
    const existingBrands = await Brand.find();

    if (existingCats.length > 0) {
      console.log(`ℹ️  ${existingCats.length} categories already exist`);
    } else {
      // Create categories
      const categories = [
        { name: 'Electronics', description: 'Electronic devices and gadgets', slug: 'electronics' },
        { name: 'Clothing', description: 'Apparel and fashion items', slug: 'clothing' },
        { name: 'Home & Kitchen', description: 'Home and kitchen essentials', slug: 'home-kitchen' },
        { name: 'Books', description: 'Books and reading materials', slug: 'books' },
        { name: 'Sports & Outdoors', description: 'Sports equipment and outdoor gear', slug: 'sports-outdoors' },
        { name: 'Toys & Games', description: 'Toys and games for all ages', slug: 'toys-games' },
        { name: 'Beauty & Personal Care', description: 'Beauty and personal care products', slug: 'beauty-personal-care' },
        { name: 'Automotive', description: 'Automotive parts and accessories', slug: 'automotive' },
        { name: 'Pet Supplies', description: 'Pet food and supplies', slug: 'pet-supplies' },
        { name: 'Office Products', description: 'Office supplies and equipment', slug: 'office-products' }
      ];

      const createdCats = await Category.insertMany(categories);
      console.log(`✅ Created ${createdCats.length} categories`);
    }

    if (existingBrands.length > 0) {
      console.log(`ℹ️  ${existingBrands.length} brands already exist`);
    } else {
      // Create brands
      const brands = [
        { name: 'Apple', description: 'Technology products', slug: 'apple' },
        { name: 'Samsung', description: 'Electronics and appliances', slug: 'samsung' },
        { name: 'Nike', description: 'Sportswear and equipment', slug: 'nike' },
        { name: 'Adidas', description: 'Sports and lifestyle', slug: 'adidas' },
        { name: 'Sony', description: 'Electronics and entertainment', slug: 'sony' },
        { name: 'LG', description: 'Home appliances and electronics', slug: 'lg' },
        { name: 'Dell', description: 'Computers and technology', slug: 'dell' },
        { name: 'HP', description: 'Computing and printing', slug: 'hp' },
        { name: 'Canon', description: 'Cameras and printers', slug: 'canon' },
        { name: 'Generic', description: 'No specific brand', slug: 'generic' }
      ];

      const createdBrands = await Brand.insertMany(brands);
      console.log(`✅ Created ${createdBrands.length} brands`);
    }

    // Show all categories and brands
    const allCats = await Category.find();
    const allBrands = await Brand.find();

    console.log('\n📂 Categories:');
    allCats.forEach((cat, i) => {
      console.log(`${i + 1}. ${cat.name} (ID: ${cat._id})`);
    });

    console.log('\n🏷️  Brands:');
    allBrands.forEach((brand, i) => {
      console.log(`${i + 1}. ${brand.name} (ID: ${brand._id})`);
    });

    console.log('\n✅ Categories and brands are ready!');
    console.log('💡 You can now create products with these categories and brands.');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seedCategoriesAndBrands();
