import helmet from 'helmet';
import xss from 'xss-clean';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';

export default function security(app) {
  app.use(helmet());
  app.use(xss());
  app.use(mongoSanitize());
  app.use(hpp());

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 300,
  });
  app.use('/api', limiter);
}
