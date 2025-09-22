// backend/src/routes/payments.routes.js
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { auth } from '../middlewares/auth.js';

const router = Router();

// ---- Rate limits anti abuso ----
const rlIntent = rateLimit({
  windowMs: 60_000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});
const rlWebhook = rateLimit({
  windowMs: 60_000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});

// ---- tipos de cambio (mock) ----
function getRates() {
  const ONECOP_USD = 0.01; // mock
  const USDT_USD = 1.0;
  return {
    ONECOP_USD,
    USDT_USD,
    toUSD: ({ amount, symbol }) =>
      symbol === 'ONECOP' ? amount * ONECOP_USD : amount * USDT_USD,
  };
}

// GET /api/payments/rates
router.get('/rates', (_req, res) => {
  const r = getRates();
  res.json({ ok: true, ONECOP_USD: r.ONECOP_USD, USDT_USD: r.USDT_USD });
});

// POST /api/payments/intent
// Body: { amount, currency: 'ONECOP'|'USDT', toWallet }
router.post('/intent', auth, rlIntent, async (req, res) => {
  try {
    const { amount, currency, toWallet } = req.body || {};
    const idem = req.headers['idempotency-key'];

    const amt = Number(amount);
    const sym = String(currency || '').toUpperCase();
    const isAddr =
      typeof toWallet === 'string' && /^0x[a-fA-F0-9]{40}$/.test(toWallet);

    if (
      !Number.isFinite(amt) ||
      amt <= 0 ||
      !['ONECOP', 'USDT'].includes(sym) ||
      !isAddr
    ) {
      return res.status(400).json({ ok: false, error: 'Parámetros inválidos' });
    }

    // TODO real: persistir intent con Idempotency-Key
    const intentId = 'pi_' + Math.random().toString(36).slice(2, 12);
    const { toUSD } = getRates();
    const usd = toUSD({ amount: amt, symbol: sym });

    req.log?.info(
      { intentId, amt, sym, toWallet, user: req.user?.id, idem },
      'Payment intent (mock)'
    );

    return res.status(201).json({
      ok: true,
      intentId,
      usdEstimated: +usd.toFixed(2),
      currency: sym,
      note: 'Mock intent creado. Integra gateway real en producción.',
    });
  } catch (err) {
    req.log?.error({ err }, 'payments intent error');
    return res.status(500).json({ ok: false, error: 'internal_error' });
  }
});

// POST /api/payments/webhook
router.post('/webhook', rlWebhook, async (req, res) => {
  try {
    // TODO real: validar firma en headers (ej. x-signature)
    req.log?.info({ event: req.body }, '[payments webhook] evento mock');
    return res.json({ ok: true });
  } catch (err) {
    req.log?.error({ err }, 'payments webhook error');
    return res.status(500).json({ ok: false, error: 'internal_error' });
  }
});

export default router;
