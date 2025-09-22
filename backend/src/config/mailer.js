// backend/src/config/mailer.js
import nodemailer from 'nodemailer';
import env from './env.js';
import logger from './logger.js';

/**
 * Fabrica un transporter:
 *  - Si defines SMTP_HOST -> SMTP tradicional
 *  - Si defines SMTP_HOST='ses' -> usa AWS SES vía SMTP
 *  - Si no hay SMTP -> modo 'console' que imprime emails en logs
 */
export function createTransport() {
  if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
    const isNumericPort = Number.isFinite(+env.SMTP_PORT);
    const transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: isNumericPort ? +env.SMTP_PORT : 587,
      secure: isNumericPort ? +env.SMTP_PORT === 465 : false, // true si puerto 465
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    });
    logger.info(`[mailer] Usando SMTP en ${env.SMTP_HOST}:${env.SMTP_PORT}`);
    return transporter;
  }

  // Fallback: imprime en consola (útil en dev/test)
  logger.warn('[mailer] No SMTP configurado, usando modo consola');
  return {
    async sendMail(opts) {
      console.log('[mailer console]', {
        from: opts.from || env.MAIL_FROM || 'no-reply@example.com',
        to: opts.to,
        subject: opts.subject,
        text: opts.text,
        html: opts.html,
      });
      return { messageId: 'console-' + Date.now() };
    },
  };
}

/**
 * Envío sencillo (text | html).
 * `to` puede ser string o array.
 */
export async function sendMail({ to, subject, text, html, from }) {
  const transporter = createTransport();
  const info = await transporter.sendMail({
    from: from || env.MAIL_FROM || 'no-reply@example.com',
    to,
    subject,
    text,
    html,
  });
  logger.info(`[mailer] Email enviado a ${to} (${info.messageId})`);
  return info;
}
