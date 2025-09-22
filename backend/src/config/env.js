// backend/src/config/env.js
import 'dotenv/config';

const bool = (v, def = false) => {
  if (v === undefined) return def;
  const s = String(v).trim().toLowerCase();
  return ['1', 'true', 'yes', 'y', 'on'].includes(s);
};
const num = (v, def) => (v === undefined || v === '' ? def : Number(v));
const list = (v, def = []) =>
  (v ? String(v).split(',').map(s => s.trim()).filter(Boolean) : def);

const required = (name) => {
  const val = process.env[name];
  if (!val) console.warn(`[env] Falta ${name}`);
  return val || '';
};

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: num(process.env.PORT, 5000),

  // DB / Auth
  MONGO_URI: process.env.MONGO_URI || '',   // 🔄 unificado (antes MONGODB_URI)
  JWT_SECRET: required('JWT_SECRET'),

  // CORS / Cookies
  CORS_ORIGIN: list(process.env.CORS_ORIGIN, [
    'https://redvelvetlive.com',
    'https://onecop.io',
    'http://localhost:5173',
    'http://localhost:3000',
  ]),
  COOKIE_SAMESITE: (process.env.COOKIE_SAMESITE || 'lax').toLowerCase(),
  COOKIE_SECURE: bool(process.env.COOKIE_SECURE, process.env.NODE_ENV === 'production'),
  DOMAIN_MODE: (process.env.DOMAIN_MODE || '').toLowerCase(),

  // SMTP opcional
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: num(process.env.SMTP_PORT, undefined),
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  MAIL_FROM: process.env.MAIL_FROM || '',

  // Livepeer
  LIVEPEER_API_KEY: process.env.LIVEPEER_API_KEY || '',
  LIVEPEER_BASE_URL: process.env.LIVEPEER_BASE_URL || 'https://livepeer.studio/api',
};

// Avisos útiles
if (!env.MONGO_URI) {
  console.warn('[env] MONGO_URI vacío: no se conectará a MongoDB.');
}
if (!env.JWT_SECRET || env.JWT_SECRET.length < 32) {
  console.warn('[env] JWT_SECRET débil (recomendado >= 32 chars).');
}
if (!env.LIVEPEER_API_KEY) {
  console.warn('[env] Falta LIVEPEER_API_KEY (no funcionará el streaming).');
}
if (env.DOMAIN_MODE === 'subdomains' && env.COOKIE_SAMESITE !== 'none') {
  console.warn("[env] DOMAIN_MODE='subdomains' → forzando COOKIE_SAMESITE='none'");
  env.COOKIE_SAMESITE = 'none';
  env.COOKIE_SECURE = true;
}

export default env;


