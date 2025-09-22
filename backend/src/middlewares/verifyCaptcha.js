// backend/src/middlewares/verifyCaptcha.js
import fetch from 'node-fetch';
import logger from '../config/logger.js';

/**
 * Middleware para verificar hCaptcha o reCAPTCHA en producción.
 *
 * - En desarrollo (NODE_ENV !== 'production'), deja pasar siempre.
 * - En producción, espera req.body.captchaToken o header x-captcha-token.
 *
 * ENV requeridas:
 *   CAPTCHA_PROVIDER=hcaptcha|recaptcha
 *   HC_SECRET=... (si usas hCaptcha)
 *   RC_SECRET=... (si usas reCAPTCHA)
 */
export async function verifyCaptcha(req, res, next) {
  try {
    // En desarrollo, bypass
    if (process.env.NODE_ENV !== 'production') {
      return next();
    }

    const provider = (process.env.CAPTCHA_PROVIDER || '').toLowerCase();
    const token = req.body?.captchaToken || req.headers['x-captcha-token'];

    if (!provider || !token) {
      return res.status(400).json({ ok: false, error: 'Captcha required' });
    }

    let url, secretKey;
    if (provider === 'hcaptcha') {
      url = 'https://hcaptcha.com/siteverify';
      secretKey = process.env.HC_SECRET;
    } else if (provider === 'recaptcha') {
      url = 'https://www.google.com/recaptcha/api/siteverify';
      secretKey = process.env.RC_SECRET;
    } else {
      logger.error(`Captcha provider inválido: ${provider}`);
      return res.status(500).json({ ok: false, error: 'Invalid CAPTCHA provider' });
    }

    if (!secretKey) {
      logger.error(`Falta secret para ${provider}`);
      return res.status(500).json({ ok: false, error: 'Captcha secret missing' });
    }

    const params = new URLSearchParams({ secret: secretKey, response: token });
    const resp = await fetch(url, { method: 'POST', body: params });
    const data = await resp.json().catch(() => ({}));

    if (!data.success) {
      logger.warn({ provider, token }, 'Captcha inválido');
      return res.status(400).json({ ok: false, error: 'Captcha failed' });
    }

    return next();
  } catch (e) {
    logger.error({ err: e }, 'Error en verificación de captcha');
    return res.status(500).json({ ok: false, error: 'Captcha error' });
  }
}
