// backend/src/routes/wallets.routes.js
import { Router } from 'express';
import { auth } from '../middlewares/auth.js';
import Wallet from '../models/Wallet.js';

const router = Router();

// GET /api/users/me/wallets
router.get('/', auth, async (req, res) => {
  const items = await Wallet.find({ userId: req.user.id })
    .sort({ isPrimary: -1, createdAt: 1 })
    .lean();
  res.json({ ok: true, items });
});

// POST /api/users/me/wallets
router.post('/', auth, async (req, res) => {
  try {
    const address = String(req.body?.address || '').toLowerCase().trim();
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({ ok: false, error: 'Dirección inválida' });
    }

    const existing = await Wallet.findOne({ userId: req.user.id, address });
    if (existing) return res.status(409).json({ ok: false, error: 'Wallet ya existe' });

    const hasPrimary = await Wallet.exists({ userId: req.user.id, isPrimary: true });
    const doc = await Wallet.create({
      userId: req.user.id,
      address,
      isPrimary: !hasPrimary,
      isVerified: false,
    });

    res.status(201).json({ ok: true, item: doc });
  } catch (e) {
    res.status(400).json({ ok: false, error: e.message || 'Error al crear wallet' });
  }
});

// DELETE /api/users/me/wallets/:id
router.delete('/:id', auth, async (req, res) => {
  const w = await Wallet.findOne({ _id: req.params.id, userId: req.user.id });
  if (!w) return res.status(404).json({ ok: false, error: 'No encontrada' });

  const wasPrimary = w.isPrimary;
  await w.deleteOne();

  if (wasPrimary) {
    const next = await Wallet.findOne({ userId: req.user.id }).sort({ createdAt: 1 });
    if (next) {
      next.isPrimary = true;
      await next.save();
    }
  }
  res.json({ ok: true });
});

// POST /api/users/me/wallets/:id/primary
router.post('/:id/primary', auth, async (req, res) => {
  const w = await Wallet.findOne({ _id: req.params.id, userId: req.user.id });
  if (!w) return res.status(404).json({ ok: false, error: 'No encontrada' });

  await Wallet.updateMany({ userId: req.user.id, isPrimary: true }, { $set: { isPrimary: false } });
  w.isPrimary = true;
  await w.save();

  res.json({ ok: true });
});

export default router;
