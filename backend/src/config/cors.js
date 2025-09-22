import cors from 'cors';
import env from './env.js';

export default function buildCors() {
  const origins = (env.CORS_ORIGIN || '')
    .split(/[\s,]+/)
    .map(s => s.trim())
    .filter(Boolean);

  const corsOptions = {
    origin: (origin, callback) => {
      if (!origin || origins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  };

  return cors(corsOptions);
}
