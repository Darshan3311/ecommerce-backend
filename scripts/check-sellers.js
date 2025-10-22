const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const checkSellers = async () => {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const SellerModel = mongoose.model('Seller');
    
    console.log('📊 Checking Sellers in Database:');
    console.log('='.repeat(50));
    
    const allSellers = await SellerModel.find().populate('user', 'firstName lastName email');
    console.log(`\nTotal Sellers: ${allSellers.length}\n`);
    
    if (allSellers.length > 0) {
      allSellers.forEach((seller, index) => {
        console.log(`${index + 1}. ${seller.businessName}`);
        console.log(`   Owner: ${seller.user?.firstName} ${seller.user?.lastName} (${seller.user?.email})`);
        console.log(`   Status: ${seller.verificationStatus}`);
        console.log(`   Approved: ${seller.isApproved}`);
        console.log(`   Created: ${seller.createdAt}`);
        console.log('');
      });
    } else {
      console.log('❌ No sellers found in database');
    }
    
    console.log('\n📊 Pending Sellers:');
    console.log('='.repeat(50));
    const pendingSellers = await SellerModel.find({ verificationStatus: 'pending' })
      .populate('user', 'firstName lastName email');
    console.log(`Total Pending: ${pendingSellers.length}\n`);
    
    if (pendingSellers.length > 0) {
      pendingSellers.forEach((seller, index) => {
        console.log(`${index + 1}. ${seller.businessName}`);
        console.log(`   Owner: ${seller.user?.firstName} ${seller.user?.lastName}`);
        console.log(`   Email: ${seller.user?.email}`);
        console.log('');
      });
    } else {
      console.log('❌ No pending sellers found');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

checkSellers();
