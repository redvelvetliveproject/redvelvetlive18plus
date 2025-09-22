// backend/src/routes/health.routes.js
import { Router } from 'express';
import mongoose from 'mongoose';

const router = Router();

router.get('/health', async (_req, res) => {
  const mongo = mongoose.connection?.readyState === 1 ? 'up' : 'down';
  res.set('Cache-Control', 'no-store');
  res.json({
    ok: true,
    time: new Date().toISOString(),
    mongo,
    env: process.env.NODE_ENV,
    version: process.env.npm_package_version || '0.0.1',
  });
});

export default router;
