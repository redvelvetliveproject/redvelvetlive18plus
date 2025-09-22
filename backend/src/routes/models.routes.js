// backend/src/routes/models.routes.js
import { Router } from 'express';
import { auth } from '../middlewares/auth.js';

const router = Router();

// --- utils mock ---
const COUNTRIES = ['CO', 'MX', 'AR', 'US', 'ES'];
const NAMES = [
  'Valentina','Camila','Sofía','Isabella','Mariana',
  'Antonella','Emilia','Victoria','Renata','Salomé',
  'Emma','Martina','Catalina','Gabriela','Paula','Sara'
];

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[randInt(0, arr.length - 1)];

function generateMockModels(count = 40) {
  return Array.from({ length: count }).map((_, i) => {
    const name = `${pick(NAMES)} ${i + 1}`;
    const country = pick(COUNTRIES);
    const tips = randInt(250, 5250);
    const popularity = randInt(50, 1050);
    const online = Math.random() > 0.5;
    const avatar = `https://i.pravatar.cc/300?img=${(i % 70) + 1}`;
    return { id: `m-${i + 1}`, name, country, tips, popularity, online, avatar };
  });
}

// GET /api/models/ranking
router.get('/ranking', async (req, res) => {
  try {
    const { limit = '40', country = '', sort = 'tips', order = 'desc', online } = req.query;
    let items = generateMockModels(60);

    if (country) items = items.filter((m) => m.country === String(country).toUpperCase());
    if (online === 'true') items = items.filter((m) => m.online);
    if (online === 'false') items = items.filter((m) => !m.online);

    const key = sort === 'popularity' ? 'popularity' : 'tips';
    items.sort((a, b) => (order === 'asc' ? a[key] - b[key] : b[key] - a[key]));

    const lim = Math.max(1, Math.min(parseInt(limit, 10) || 40, 200));
    return res.json({ ok: true, items: items.slice(0, lim) });
  } catch (err) {
    req.log?.error({ err }, 'models ranking');
    return res.status(500).json({ ok: false, error: 'internal_error' });
  }
});

// GET /api/models/me/stats
router.get('/me/stats', auth, async (req, res) => {
  try {
    const stats = {
      tipsToday: randInt(100, 1200),
      tipsWeek: randInt(500, 8000),
      earningsUSD: Number((Math.random() * 900 + 50).toFixed(2)),
      rank: randInt(1, 200),
      viewersNow: randInt(0, 500),
    };
    return res.json({ ok: true, stats });
  } catch (err) {
    req.log?.error({ err }, 'models stats');
    return res.status(500).json({ ok: false, error: 'internal_error' });
  }
});

// GET /api/models/me/summary
router.get('/me/summary', auth, async (req, res) => {
  try {
    const payload = {
      tips24h: randInt(50, 800),
      subscribers: randInt(10, 2000),
      balanceONECOP: randInt(0, 30000),
    };
    return res.json({ ok: true, summary: payload });
  } catch (err) {
    req.log?.error({ err }, 'models summary');
    return res.status(500).json({ ok: false, error: 'internal_error' });
  }
});

export default router;
