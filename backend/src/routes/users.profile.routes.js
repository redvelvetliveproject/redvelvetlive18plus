// backend/src/routes/users.profile.routes.js
import express from 'express';
import { auth } from '../middlewares/auth.js';
import User from '../models/User.js';

const router = express.Router();

/**
 * 📡 GET /api/users/profile
 * Devuelve el perfil completo del usuario autenticado
 */
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).lean();
    if (!user) return res.status(404).json({ ok: false, error: 'Usuario no encontrado' });

    res.json({
      ok: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        wallet: user.wallet,
        role: user.role,
        locale: user.locale,
        bio: user.bio,
        socialLinks: user.socialLinks,
        avatar: user.avatar,
        stats: user.stats,
        status: user.status,
        preferences: user.preferences,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (err) {
    console.error('❌ Error al obtener perfil:', err);
    res.status(500).json({ ok: false, error: 'Error al obtener el perfil' });
  }
});

/**
 * ✏️ PATCH /api/users/profile
 * Permite actualizar datos del perfil del usuario autenticado
 */
router.patch('/profile', auth, async (req, res) => {
  try {
    const updates = {};
    const allowed = [
      'name',
      'locale',
      'bio',
      'socialLinks',
      'avatar',
      'preferences',
    ];

    // Solo permitimos actualizar campos definidos en "allowed"
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    // Validación simple para socialLinks
    if (updates.socialLinks) {
      const links = updates.socialLinks;
      const validKeys = ['instagram', 'twitter', 'onlyfans', 'website'];
      updates.socialLinks = Object.fromEntries(
        Object.entries(links).filter(([k]) => validKeys.includes(k))
      );
    }

    // ✅ Actualizar avatar si llega desde upload.js
    if (updates.avatar) {
      if (typeof updates.avatar.small !== 'string' || typeof updates.avatar.large !== 'string') {
        return res.status(400).json({ ok: false, error: 'Formato de avatar inválido' });
      }
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({ ok: false, error: 'Usuario no encontrado' });
    }

    res.json({ ok: true, message: 'Perfil actualizado correctamente ✅', user: user.toSafeJSON() });
  } catch (err) {
    console.error('❌ Error al actualizar perfil:', err);
    res.status(500).json({ ok: false, error: 'Error al actualizar el perfil', details: err.message });
  }
});

export default router;
