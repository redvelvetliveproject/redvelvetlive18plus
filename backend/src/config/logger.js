// backend/src/config/logger.js
import pino from 'pino';

const isProd = process.env.NODE_ENV === 'production';
const level = process.env.LOG_LEVEL || (isProd ? 'info' : 'debug');

const logger = pino({
  level,
  transport: isProd ? undefined : {
    target: 'pino-pretty',
    options: { translateTime: 'SYS:yyyy-mm-dd HH:MM:ss', singleLine: true },
  },
});

export default logger;
