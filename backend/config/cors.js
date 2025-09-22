import cors from 'cors';

function parseOrigins(input) {
  if (!input) return ['https://redvelvetlive.com', 'https://onecop.io'];
  return String(input)
    .split(/[\s,]+/)
    .map(s => s.trim())
    .filter(Boolean);
}

const origins = parseOrigins(process.env.CORS_ORIGIN);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || origins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  maxAge: 86400,
};

export default () => cors(corsOptions);
