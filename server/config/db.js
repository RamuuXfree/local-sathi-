const mongoose = require('mongoose');

console.log('🔥 DB.JS LOADED FROM:', __filename);

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;

    console.log('📌 Raw MONGO_URI exists:', !!mongoURI);
    console.log('📌 MONGO_URI starts with:', mongoURI ? mongoURI.slice(0, 40) : 'undefined');

    if (!mongoURI) {
      throw new Error('MONGO_URI is missing in server/.env');
    }

    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      family: 4,
    });

    console.log('✅ MongoDB Connected Successfully');
    console.log(`📦 Host: ${conn.connection.host}`);
    console.log(`🗂️ Database: ${conn.connection.name}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;