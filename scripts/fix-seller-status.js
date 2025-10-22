const mongoose = require('mongoose');
require('dotenv').config();

async function fixSellerStatus() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const Seller = require('../models/Seller.model');
    const User = require('../models/User.model'); // Load User model

    // Update all sellers that don't have status field set
    const result = await Seller.updateMany(
      { 
        $or: [
          { status: { $exists: false } },
          { status: null }
        ]
      },
      { 
        $set: { 
          status: 'pending',
          isVerified: false
        }
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} sellers with pending status`);

    // Show all sellers
    const sellers = await Seller.find().populate('user');
    console.log('\n📋 All Sellers After Update:');
    sellers.forEach((seller, index) => {
      console.log(`\n${index + 1}. Business: ${seller.businessName}`);
      console.log(`   Email: ${seller.user?.email}`);
      console.log(`   Status: ${seller.status}`);
      console.log(`   Verified: ${seller.isVerified}`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Done!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixSellerStatus();
