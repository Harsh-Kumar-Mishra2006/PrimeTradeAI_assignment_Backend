const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Create indexes for better performance
    await conn.connection.db.collection('users').createIndex({ email: 1 }, { unique: true });
    await conn.connection.db.collection('users').createIndex({ username: 1 }, { unique: true });
    await conn.connection.db.collection('tasks').createIndex({ user: 1 });
    await conn.connection.db.collection('tasks').createIndex({ status: 1 });
    await conn.connection.db.collection('tasks').createIndex({ priority: 1 });
    
    console.log('Database indexes created successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;