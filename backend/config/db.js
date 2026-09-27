import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer = null;

export const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nexachat';
    
    // Try connecting to the specified MongoDB URI first with a 3 second timeout
    const options = {
      serverSelectionTimeoutMS: 3000,
    };
    
    await mongoose.connect(uri, options);
    console.log(`[Database] MongoDB connected successfully to ${mongoose.connection.host}`);
  } catch (error) {
    console.warn(`[Database] Standard MongoDB connection failed (${error.message}). Falling back to In-Memory MongoDB...`);
    
    try {
      mongoMemoryServer = await MongoMemoryServer.create();
      const memUri = mongoMemoryServer.getUri();
      await mongoose.connect(memUri);
      console.log(`[Database] In-Memory MongoDB started and connected successfully at ${memUri}`);
    } catch (memError) {
      console.error('[Database] Failed to initialize in-memory database:', memError.message);
      process.exit(1);
    }
  }
};

export default connectDB;
