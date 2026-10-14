import mongoose from 'mongoose';
import { ENV } from './env.js';

let memoryServer = null;

/**
 * Connect to MongoDB database.
 * Explicitly connects to MONGODB_URI if provided (e.g. MongoDB Atlas).
 * In production, MONGODB_URI is strictly required and connection failures will halt startup.
 * In development/test, if no MONGODB_URI is provided, falls back explicitly to an in-memory instance
 * with a clear warning so developers know data is ephemeral.
 */
export const connectDB = async (customUri = null) => {
  const isProduction = ENV.NODE_ENV === 'production';
  let uri = customUri || ENV.MONGODB_URI;

  const isPlaceholder = !uri || uri.includes('<username>') || uri.includes('<password>');

  // Strict check for production
  if (isProduction && isPlaceholder) {
    const errorMsg = 'FATAL: Valid MONGODB_URI environment variable is required in production mode. Refusing to start.';
    console.error(`❌ [Database Error] ${errorMsg}`);
    throw new Error(errorMsg);
  }

  // If no URI or template placeholder provided in development/testing, explicitly use MongoMemoryServer
  if (isPlaceholder) {
    console.warn(
      '⚠️  [DATABASE NOTICE] No live MONGODB_URI configured (or template placeholder detected).\n' +
      '   Launching ephemeral in-memory MongoDB for local testing.\n' +
      '   NOTE: Data will NOT persist across server restarts.\n' +
      '   To connect to MongoDB Atlas, set your live Atlas connection string in .env.'
    );
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create();
    uri = memoryServer.getUri();
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });

    const isMemory = Boolean(memoryServer);
    const hostInfo = isMemory ? 'Ephemeral In-Memory Engine' : conn.connection.host;
    console.log(`🚀 MongoDB Connected: ${hostInfo} (Database: ${conn.connection.name})`);

    return conn;
  } catch (error) {
    // If a configured URI failed, do NOT silently fall back to in-memory: report the true Atlas error!
    console.error(`❌ [MongoDB Connection Error]: Could not connect to database.`);
    console.error(`   Details: ${error.message}`);
    if (uri && !memoryServer) {
      console.error(
        '   Please verify:\n' +
        '   1. Your MongoDB Atlas connection string and credentials in MONGODB_URI.\n' +
        '   2. Network access / IP Access List in MongoDB Atlas (e.g. 0.0.0.0/0 or your current IP).\n' +
        '   3. Database user privileges in the MongoDB Atlas console.'
      );
    }
    throw error;
  }
};

export const closeDB = async () => {
  try {
    await mongoose.connection.close();
    if (memoryServer) {
      await memoryServer.stop();
      memoryServer = null;
    }
    console.log('🔌 MongoDB connection closed successfully.');
  } catch (error) {
    console.error('Error closing MongoDB connection:', error.message);
  }
};
