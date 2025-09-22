// backend/src/routes/clients.routes.js
import { Router } from 'express';
import { auth } from '../middlewares/auth.js';
import Tip from '../models/Tip.js';
import Subscription from '../models/Subscription.js';

const router = Router();

// GET /api/clients/me/activity
router.get('/me/activity', auth, async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit ?? '20', 10), 1), 200);
    const items = await Tip.find({ fromUserId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('toUserId', 'name')
      .lean();

    return res.json(
      items.map((t) => ({
        modelName: t.toUserId?.name || 'Unknown',
        tipped: t.amount,
        currency: t.currency,
        date: t.createdAt,
      }))
    );
  } catch (err) {
    return res.status(500).json({ ok: false, error: 'No se pudo obtener la actividad' });
  }
});

// GET /api/clients/me/summary
router.get('/me/summary', auth, async (req, res) => {
  try {
    const tipsTotal = await Tip.aggregate([
      { $match: { fromUserId: req.user.id } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const subsCount = await Subscription.countDocuments({ clientId: req.user.id });

    return res.json({
      tipsSentTotal: tipsTotal[0]?.total || 0,
      subscriptions: subsCount,
      balanceONECOP: 0, // integrar con Wallet/Payment cuando esté listo
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: 'No se pudo obtener el resumen' });
  }
});

export default router;
