// backend/src/routes/models.live.routes.js
import { Router } from 'express';
import { auth } from '../middlewares/auth.js';
import Stream from '../models/Stream.js';

const router = Router();

/**
 * GET /api/models/live
 * Lista streams activos
 */
router.get('/live', async (_req, res) => {
  try {
    const streams = await Stream.find({ status: 'live' })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return res.json({
      ok: true,
      streams: streams.map((s) => ({
        id: s._id,
        userId: s.userId,
        name: s.name,
        playbackId: s.playbackId,
        viewersPeak: s.viewersPeak,
        createdAt: s.createdAt,
      })),
    });
  } catch (err) {
    _req.log?.error({ err }, 'models.live list');
    return res.status(500).json({ ok: false, error: 'internal_error' });
  }
});

/**
 * POST /api/models/live/start
 * Inicia un nuevo stream para el modelo autenticado
 */
router.post('/live/start', auth, async (req, res) => {
  try {
    const { name, playbackId, streamId, assetId } = req.body || {};
    if (!name || !playbackId) {
      return res.status(400).json({ ok: false, error: 'name y playbackId requeridos' });
    }

    const stream = await Stream.create({
      userId: req.user.id,
      name,
      provider: 'livepeer',
      playbackId,
      streamId,
      assetId,
      status: 'live',
    });

    return res.json({ ok: true, stream });
  } catch (err) {
    req.log?.error({ err }, 'models.live start');
    return res.status(500).json({ ok: false, error: 'internal_error' });
  }
});

/**
 * POST /api/models/live/stop
 * Marca stream como finalizado
 */
router.post('/live/stop', auth, async (req, res) => {
  try {
    const { streamId } = req.body || {};
    if (!streamId) return res.status(400).json({ ok: false, error: 'streamId requerido' });

    const stream = await Stream.findOneAndUpdate(
      { streamId, userId: req.user.id, status: 'live' },
      { status: 'ended', updatedAt: new Date() },
      { new: true }
    );

    if (!stream) return res.status(404).json({ ok: false, error: 'stream_not_found' });

    return res.json({ ok: true, stream });
  } catch (err) {
    req.log?.error({ err }, 'models.live stop');
    return res.status(500).json({ ok: false, error: 'internal_error' });
  }
});

export default router;
