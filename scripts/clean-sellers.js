const mongoose = require('mongoose');
require('dotenv').config();

async function cleanOrphanedSellers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const Seller = require('../models/Seller.model');
    
    // Delete all sellers
    const result = await Seller.deleteMany({});
    console.log(`🗑️  Deleted ${result.deletedCount} orphaned sellers`);
    
    console.log('\n✅ Database is clean! You can now:');
    console.log('   1. Register new sellers at: /seller/register');
    console.log('   2. Admin will approve them');
    console.log('   3. Sellers can then login');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

cleanOrphanedSellers();
