import { Router } from 'express';
import { auth } from '../middlewares/auth.js';

const router = Router();

// Mock en memoria (reemplazar por persistencia real en Mongoose)
const store = new Map();
const DEFAULT_PREFS = {
  locale: 'es',
  wallets: [],
  notifications: { email: false, push: false },
};

// GET /api/users/me/preferences  (montado en index como '/users/me/preferences')
router.get('/', auth, (req, res) => {
  const uid = req.user.id;
  const prefs = store.get(uid) || DEFAULT_PREFS;
  res.json(prefs);
});

// PUT /api/users/me/preferences  (montado en index como '/users/me/preferences')
router.put('/', auth, (req, res) => {
  const uid = req.user.id;
  const body = req.body || {};

  const locale = (body.locale === 'en') ? 'en' : 'es';

  const wallets = Array.isArray(body.wallets)
    ? body.wallets
        .filter(w => typeof w === 'string' && /^0x[a-fA-F0-9]{40}$/.test(w))
        .map(w => w.toLowerCase())
    : [];

  const notifications = {
    email: !!body?.notifications?.email,
    push:  !!body?.notifications?.push,
  };

  const next = { locale, wallets, notifications };
  store.set(uid, next);
  res.json(next);
});

export default router;

/*
  TODO (Mongoose):
  - En models/User.js:
    preferences: {
      locale: { type: String, enum: ['es','en'], default: 'es' },
      wallets: [{ type: String, lowercase: true }],
      notifications: { email: Boolean, push: Boolean }
    }
  - GET: leer user.preferences
  - PUT: User.findByIdAndUpdate(uid, { preferences: next }, { new: true })
*/
