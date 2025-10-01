import mongoose from 'mongoose';
import logger from './logger.js';

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    logger.info('✅ Conectado a MongoDB');
  } catch (err) {
    logger.error({ err }, '❌ Error conectando a MongoDB');
    process.exit(1);
  }
}

export default connectDB;
