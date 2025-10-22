const mongoose = require('mongoose');
require('dotenv').config();

async function checkSellers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const Seller = require('../models/Seller.model');
    const User = require('../models/User.model');

    // Find all sellers
    const sellers = await Seller.find().populate('user');
    
    console.log('\n📊 Total Sellers:', sellers.length);
    console.log('\n📋 Seller Details:');
    
    sellers.forEach((seller, index) => {
      console.log(`\n${index + 1}. Business: ${seller.businessName}`);
      console.log(`   Email: ${seller.user?.email}`);
      console.log(`   Status: ${seller.verificationStatus}`);
      console.log(`   Approved: ${seller.isApproved}`);
      console.log(`   Created: ${seller.createdAt}`);
      console.log(`   User Role: ${seller.user?.role}`);
    });

    // Find pending sellers specifically
    const pendingSellers = await Seller.find({ verificationStatus: 'pending' }).populate('user');
    console.log('\n\n⏳ Pending Sellers:', pendingSellers.length);

    await mongoose.connection.close();
    console.log('\n✅ Connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkSellers();
