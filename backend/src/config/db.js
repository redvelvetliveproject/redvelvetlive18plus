import logger from './logger.js';

export default async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!process.env.MONGO_URI) throw new Error("Falta MONGO_URI en .env");

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGO_URI, {
      dbName: process.env.MONGO_DB_NAME || undefined,
    }).then((mongoose) => {
      logger.info("MongoDB conectado correctamente");
      return mongoose;
    }).catch(err => {
      logger.error({ err }, "Error conectando a MongoDB");
      throw err;
    });
  }

  cached.conn = await cached.promise;
  global.mongoose = cached;
  return cached.conn;
}
