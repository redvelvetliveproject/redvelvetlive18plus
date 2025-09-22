// backend/src/routes/users.routes.js
import { Router } from 'express';
import { auth } from '../middlewares/auth.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import User from '../models/User.js';
import logger from '../config/logger.js';

const router = Router();

/**
 * GET /api/users/profile
 * Devuelve perfil del usuario autenticado.
 */
router.get('/profile', auth, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ ok: false, error: 'Usuario no encontrado' });
  }
  return res.json(user.toSafeJSON());
}));

/**
 * PUT /api/users/me
 * Actualiza datos básicos (ej: nombre).
 */
router.put('/me', auth, asyncHandler(async (req, res) => {
  const { name } = req.body || {};
  const update = {};

  if (typeof name === 'string' && name.trim().length >= 2) {
    update.name = name.trim();
  }

  const user = await User.findByIdAndUpdate(req.user.id, update, { new: true });
  if (!user) {
    return res.status(404).json({ ok: false, error: 'Usuario no encontrado' });
  }

  logger.info(`Usuario ${req.user.id} actualizado`);
  return res.json(user.toSafeJSON());
}));

export default router;
