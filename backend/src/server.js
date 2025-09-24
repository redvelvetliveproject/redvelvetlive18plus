// backend/src/server.js
import 'dotenv/config';
import http from 'http';
import app from './app.js';
import logger from './config/logger.js';

const {
  NODE_ENV = 'development',
  PORT = process.env.PORT || 3001,
  PUBLIC_URL = `http://localhost:${process.env.PORT || 3001}`,
} = process.env;

const server = http.createServer(app);

server.listen(PORT, () => {
  logger.info(`🚀 Servidor corriendo en ${PUBLIC_URL} (env: ${NODE_ENV})`);
});
