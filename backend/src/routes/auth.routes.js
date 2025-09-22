// backend/src/routes/auth.routes.js
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import User from '../models/User.js';
import { auth } from '../middlewares/auth.js';
import { verifyCaptcha } from '../middlewares/verifyCaptcha.js';

const router = Router();
const { JWT_SECRET, NODE_ENV } = env;

function cookieFlags() {
  const mode = (process.env.DOMAIN_MODE || '').toLowerCase();
  let sameSite =
    process.env.COOKIE_SAMESITE ||
    (mode === 'subdomains' ? 'none' : NODE_ENV === 'production' ? 'lax' : 'strict');
  sameSite = ['lax', 'none', 'strict'].includes(sameSite) ? sameSite : 'lax';

  let secure;
  if (process.env.COOKIE_SECURE != null) {
    secure = String(process.env.COOKIE_SECURE).toLowerCase() === 'true';
  } else {
    secure = NODE_ENV === 'production' || sameSite === 'none';
  }

  const domain = process.env.COOKIE_DOMAIN || undefined;
  return { sameSite, secure, domain };
}

function signToken(user) {
  return jwt.sign(
    { uid: user._id.toString(), role: user.role, email: user.email },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
}

function setAuthCookie(res, token) {
  const { sameSite, secure, domain } = cookieFlags();
  res.cookie('token', token, {
    httpOnly: true,
    secure,
    sameSite,
    maxAge: 15 * 60 * 1000,
    path: '/',
    ...(domain ? { domain } : {}),
  });
}

const INCLUDE_TOKEN_IN_BODY = String(process.env.INCLUDE_TOKEN_IN_BODY || 'false') === 'true';

// POST /auth/register
router.post('/register', verifyCaptcha, async (req, res) => {
  try {
    const { name, email, password, wallet, role } = req.body || {};
    if (!email && !wallet) {
      return res.status(400).json({ ok: false, error: 'Email or wallet required' });
    }
    if (email && !password) {
      return res.status(400).json({ ok: false, error: 'Password required for email' });
    }

    const exists = await User.findOne({
      $or: [
        ...(email ? [{ email: email.toLowerCase() }] : []),
        ...(wallet ? [{ wallet: wallet.toLowerCase() }] : []),
      ],
    }).lean();

    if (exists) {
      return res.status(409).json({ ok: false, error: 'User already exists' });
    }

    const user = new User({
      name: name?.trim(),
      email: email?.toLowerCase(),
      password: password || undefined,
      wallet: wallet?.toLowerCase(),
      role: role || 'client',
    });
    await user.save();

    const token = signToken(user);
    setAuthCookie(res, token);

    return res.status(201).json({
      ok: true,
      user: user.toSafeJSON(),
      ...(INCLUDE_TOKEN_IN_BODY ? { token } : {}),
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: 'Server error' });
  }
});

// POST /auth/login
router.post('/login', verifyCaptcha, async (req, res) => {
  try {
    const { email, password, wallet } = req.body || {};
    let user = null;

    if (email) {
      user = await User.findOne({ email: email.toLowerCase() }).select('+password');
      if (!user) return res.status(401).json({ ok: false, error: 'Invalid credentials' });
      const ok = await user.comparePassword(password || '');
      if (!ok) return res.status(401).json({ ok: false, error: 'Invalid credentials' });
    } else if (wallet) {
      user = await User.findOne({ wallet: wallet.toLowerCase() });
      if (!user) return res.status(401).json({ ok: false, error: 'Invalid credentials' });
    } else {
      return res.status(400).json({ ok: false, error: 'Email+password or wallet required' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ ok: false, error: 'Inactive or banned user' });
    }

    const token = signToken(user);
    setAuthCookie(res, token);

    return res.json({
      ok: true,
      user: user.toSafeJSON(),
      ...(INCLUDE_TOKEN_IN_BODY ? { token } : {}),
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: 'Server error' });
  }
});

// POST /auth/logout
router.post('/logout', (_req, res) => {
  const { domain } = cookieFlags();
  res.clearCookie('token', { path: '/', ...(domain ? { domain } : {}) });
  return res.json({ ok: true, message: 'Logged out' });
});

// POST /auth/refresh
router.post('/refresh', auth, (req, res) => {
  const token = signToken(req.user);
  setAuthCookie(res, token);
  return res.json({ ok: true, ...(INCLUDE_TOKEN_IN_BODY ? { token } : {}) });
});

// GET /auth/me
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ ok: false, error: 'Not found' });
    return res.json({ ok: true, user: user.toSafeJSON() });
  } catch (err) {
    return res.status(500).json({ ok: false, error: 'Server error' });
  }
});

export default router;
