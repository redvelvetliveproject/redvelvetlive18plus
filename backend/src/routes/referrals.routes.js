// backend/src/routes/referrals.routes.js
import { Router } from 'express';
import { auth } from '../middlewares/auth.js';

const router = Router();

// Mock temporal en memoria
const refCodes = new Map();   // { userId -> { code } }
const earnings = new Map();   // { referredUserId -> { referrerId, totalUSD } }
const events = [];            // tracking QA

// Config
const REF_PERCENT = 0.05;         // 5%
const CAP_PER_REFERRED_USD = 1000; // tope por referido

// Helper: crea/lee código de referido del usuario
function getOrCreateCode(userId) {
  if (!refCodes.has(userId)) {
    const code = 'rv-' + userId.slice(-6);
    refCodes.set(userId, { code });
  }
  return refCodes.get(userId);
}

// GET /api/referrals/code → devuelve tu código
router.get('/code', auth, (req, res) => {
  const { code } = getOrCreateCode(req.user.id);
  return res.json({ ok: true, code });
});

// POST /api/referrals/track
router.post('/track', auth, (req, res) => {
  const { referrerCode, referredUserId, grossUSD } = req.body || {};
  if (!referrerCode || !referredUserId || !grossUSD || grossUSD <= 0) {
    return res.status(400).json({ ok: false, error: 'Parámetros inválidos' });
  }

  // Buscar referrerId por code
  let referrerId = null;
  for (const [uid, obj] of refCodes.entries()) {
    if (obj.code === referrerCode) {
      referrerId = uid;
      break;
    }
  }
  if (!referrerId) return res.status(404).json({ ok: false, error: 'Código inexistente' });

  // Estado inicial
  if (!earnings.has(referredUserId)) {
    earnings.set(referredUserId, { referrerId, totalUSD: 0 });
  }
  const state = earnings.get(referredUserId);

  // Si ya está asociado a otro, rechazar
  if (state.referrerId !== referrerId) {
    return res.status(409).json({ ok: false, error: 'Referido ya asociado a otro referrer' });
  }

  // Calcular comisión con tope
  const remainingCap = Math.max(0, CAP_PER_REFERRED_USD - state.totalUSD);
  const eligibleUSD = Math.min(remainingCap, grossUSD);
  const commissionUSD = +(eligibleUSD * REF_PERCENT).toFixed(2);

  state.totalUSD += eligibleUSD;

  // Log de QA
  events.push({
    ts: new Date().toISOString(),
    referrerId,
    referrerCode,
    referredUserId,
    grossUSD,
    eligibleUSD,
    commissionUSD,
  });

  return res.json({
    ok: true,
    commissionUSD,
    capRemainingForThisReferred: +(CAP_PER_REFERRED_USD - state.totalUSD).toFixed(2),
    note: 'Comisión sale del % de la plataforma, no de la modelo.',
  });
});

// GET /api/referrals/earnings
router.get('/earnings', auth, (req, res) => {
  const items = [];
  for (const [referredUserId, state] of earnings.entries()) {
    if (state.referrerId === req.user.id) {
      items.push({
        referredUserId,
        totalReferredGrossUSD: state.totalUSD,
        capUSD: CAP_PER_REFERRED_USD,
        capRemainingUSD: +(CAP_PER_REFERRED_USD - state.totalUSD).toFixed(2),
      });
    }
  }
  return res.json({ ok: true, items });
});

// GET /api/referrals/events (solo QA local)
router.get('/events', auth, (req, res) => {
  return res.json({ ok: true, items: events.filter(e => e.referrerId === req.user.id) });
});

export default router;
