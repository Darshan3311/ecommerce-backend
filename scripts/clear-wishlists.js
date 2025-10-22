const mongoose = require('mongoose');
require('dotenv').config();

async function clearWishlists() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const Wishlist = require('../models/Wishlist.model');

    // First, show what's in the database
    const wishlistsBefore = await Wishlist.find();
    console.log(`📋 Current wishlists: ${wishlistsBefore.length}`);
    wishlistsBefore.forEach((w, i) => {
      console.log(`  ${i + 1}. User ID: ${w.user}, Items: ${w.items.length}`);
      w.items.forEach((item, j) => {
        console.log(`     Item ${j + 1}: Product ID: ${item.product}`);
      });
    });

    const result = await Wishlist.deleteMany({});
    console.log(`\n✅ Deleted ${result.deletedCount} wishlists`);

    // Verify deletion
    const wishlistsAfter = await Wishlist.find();
    console.log(`✅ Remaining wishlists: ${wishlistsAfter.length}`);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

clearWishlists();
