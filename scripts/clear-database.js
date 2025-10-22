const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const clearDatabase = async () => {
  try {
    console.log('🗑️  Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n🗑️  Dropping database...');
    await mongoose.connection.dropDatabase();
    console.log('✅ Database dropped successfully');

    console.log('\n📝 Database cleared! Now run:');
    console.log('   npm run seed');
    console.log('   npm start');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

clearDatabase();
