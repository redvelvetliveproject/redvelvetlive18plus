// backend/src/routes/users.routes.js
import { Router } from 'express';
import { auth } from '../middlewares/auth.js';
import User from '../models/User.js';

const router = Router();

/**
 * GET /api/users/profile
 * Devuelve el perfil del usuario autenticado.
 */
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).lean();
    if (!user) return res.status(404).json({ ok: false, error: 'User not found' });

    return res.json({
      ok: true,
      id: user._id,
      name: user.name,
      email: user.email,
      wallet: user.wallet,
      role: user.role,
      locale: user.locale || 'es',
    });
  } catch (err) {
    req.log?.error({ err }, 'users/profile failed');
    return res.status(500).json({ ok: false, error: 'Server error' });
  }
});

/**
 * PUT /api/users/profile
 * Permite actualizar nombre y preferencia de idioma.
 */
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, locale } = req.body || {};
    const patch = {};
    if (typeof name === 'string' && name.trim()) patch.name = name.trim();
    if (locale === 'en' || locale === 'es') patch.locale = locale;

    const user = await User.findByIdAndUpdate(req.user.id, patch, { new: true, lean: true });
    if (!user) return res.status(404).json({ ok: false, error: 'User not found' });

    return res.json({
      ok: true,
      id: user._id,
      name: user.name,
      email: user.email,
      wallet: user.wallet,
      role: user.role,
      locale: user.locale || 'es',
    });
  } catch (err) {
    req.log?.error({ err }, 'users/profile update failed');
    return res.status(500).json({ ok: false, error: 'Server error' });
  }
});

export default router;
