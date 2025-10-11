// backend/src/routes/models.public.routes.js
import express from 'express';
import User from '../models/User.js';

const router = express.Router();

/**
 * 📄 GET /api/models
 * Lista de modelos públicos con paginación y filtros
 */
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      locale,
      country,
      sort = 'popularity',
    } = req.query;

    const filters = { role: 'model', status: 'active' };
    if (locale) filters.locale = locale;
    if (country) filters.country = country.toUpperCase();

    const total = await User.countDocuments(filters);
    const models = await User.find(filters)
      .sort({ [sort]: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select(
        'name slug bio avatar gallery popularity stats country locale socialLinks'
      )
      .lean();

    res.json({
      ok: true,
      page: Number(page),
      total,
      totalPages: Math.ceil(total / limit),
      results: models,
    });
  } catch (err) {
    console.error('❌ Error al listar modelos:', err);
    res.status(500).json({ ok: false, error: 'Internal server error' });
  }
});

/**
 * 📄 GET /api/models/:slug
 * Perfil público individual
 */
router.get('/:slug', async (req, res) => {
  try {
    const model = await User.findOne({
      slug: req.params.slug,
      role: 'model',
      status: 'active',
    })
      .select(
        'name slug bio avatar gallery popularity stats country locale socialLinks'
      )
      .lean();

    if (!model) {
      return res.status(404).json({ ok: false, error: 'Modelo no encontrada' });
    }

    res.json({ ok: true, model });
  } catch (err) {
    console.error('❌ Error al obtener modelo:', err);
    res.status(500).json({ ok: false, error: 'Internal server error' });
  }
});

export default router;
