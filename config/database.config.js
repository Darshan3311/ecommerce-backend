const mongoose = require('mongoose');

class DatabaseConnection {
  constructor() {
    this.connectionString = process.env.MONGODB_URI;
    this.options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };
  }

  async connect() {
    try {
      await mongoose.connect(this.connectionString, this.options);
      console.log('✅ MongoDB connected successfully');
      
      mongoose.connection.on('error', (err) => {
        console.error('❌ MongoDB connection error:', err);
      });

      mongoose.connection.on('disconnected', () => {
        console.log('⚠️  MongoDB disconnected');
      });

      process.on('SIGINT', async () => {
        await mongoose.connection.close();
        console.log('MongoDB connection closed due to app termination');
        process.exit(0);
      });
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error.message);
      process.exit(1);
    }
  }

  async disconnect() {
    try {
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
    } catch (error) {
      console.error('Error closing MongoDB connection:', error);
    }
  }

  getConnection() {
    return mongoose.connection;
  }
}

module.exports = DatabaseConnection;
