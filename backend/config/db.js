import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer = null;

export const connectDB = async () => {
  const configuredUri = process.env.MONGODB_URI;
  const uri = configuredUri || 'mongodb://127.0.0.1:27017/nexachat';

  try {
    const options = {
      serverSelectionTimeoutMS: 3000,
    };

    await mongoose.connect(uri, options);
    console.log(`[Database] MongoDB connected successfully to ${mongoose.connection.host}`);
  } catch (error) {
    const isLocalUri = uri.startsWith('mongodb://127.0.0.1') || uri.startsWith('mongodb://localhost');
    if (configuredUri && !isLocalUri) {
      throw new Error('[Database] Could not connect to configured MongoDB. Check MONGODB_URI and Atlas network access.');
    }

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
