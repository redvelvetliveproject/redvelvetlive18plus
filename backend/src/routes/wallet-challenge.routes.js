// backend/src/routes/wallet-challenge.routes.js
import { Router } from 'express';
import { auth } from '../middlewares/auth.js';
import Wallet from '../models/Wallet.js';
import WalletChallenge from '../models/WalletChallenge.js';
import crypto from 'crypto';
import { recoverPersonalSignature } from '@metamask/eth-sig-util';

const router = Router();

/**
 * GET /api/users/me/wallets/:id/challenge
 * Genera un nuevo challenge para verificar una wallet
 */
router.get('/users/me/wallets/:id/challenge', auth, async (req, res) => {
  try {
    const w = await Wallet.findOne({ _id: req.params.id, userId: req.user.id });
    if (!w) return res.status(404).json({ ok: false, error: 'Wallet no encontrada' });

    // Invalida challenges anteriores
    await WalletChallenge.updateMany(
      { userId: req.user.id, walletId: w._id, used: false, expiresAt: { $gt: new Date() } },
      { $set: { used: true } }
    );

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutos
    const nonce = crypto.randomBytes(12).toString('hex');

    const challenge =
      `RedVelvetLive: verifica tu wallet\n` +
      `User:${req.user.id}\n` +
      `Wallet:${w._id}\n` +
      `Address:${w.address}\n` +
      `Nonce:${nonce}\n` +
      `Expires:${expiresAt.toISOString()}`;

    await WalletChallenge.create({
      userId: req.user.id,
      walletId: w._id,
      address: w.address,
      challenge,
      expiresAt,
    });

    return res.json({ ok: true, challenge, expiresAt });
  } catch (err) {
    console.error('Error en /wallets/:id/challenge', err);
    return res.status(500).json({ ok: false, error: 'internal_error' });
  }
});

/**
 * POST /api/wallet-challenge/verify
 * Body: { walletId, signature }
 */
router.post('/wallet-challenge/verify', auth, async (req, res) => {
  const { walletId, signature } = req.body || {};
  if (!walletId || !signature) {
    return res.status(400).json({ ok: false, error: 'Parámetros faltantes' });
  }

  try {
    const w = await Wallet.findOne({ _id: walletId, userId: req.user.id });
    if (!w) return res.status(404).json({ ok: false, error: 'Wallet no encontrada' });

    const chal = await WalletChallenge.findOne({
      userId: req.user.id,
      walletId: w._id,
      used: false,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!chal) return res.status(410).json({ ok: false, error: 'Challenge expirado o inexistente' });

    const signer = recoverPersonalSignature({
      data: `0x${Buffer.from(chal.challenge, 'utf8').toString('hex')}`,
      signature,
    });

    if (signer.toLowerCase() !== w.address.toLowerCase()) {
      return res.status(400).json({ ok: false, error: 'Firma no corresponde a la wallet' });
    }

    chal.used = true;
    await chal.save();

    w.isVerified = true;
    await w.save();

    return res.json({ ok: true, verified: true });
  } catch (err) {
    console.error('Error en /wallet-challenge/verify', err);
    return res.status(400).json({ ok: false, error: 'Firma inválida' });
  }
});

// ✅ ESTA LÍNEA ES LA CLAVE
export default router;



