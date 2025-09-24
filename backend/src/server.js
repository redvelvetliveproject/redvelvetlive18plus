// backend/src/server.js
import app from './app.js';

const PORT = Number(process.env.PORT) || 3001;

const server = app.listen(PORT, () => {
  console.log(`✅ API escuchando en puerto ${PORT} (NODE_ENV=${process.env.NODE_ENV || 'dev'})`);
});

// Cierre elegante
const shutdown = (signal) => {
  console.log(`[${signal}] Recibida señal, cerrando HTTP...`);
  server.close(() => {
    console.log('HTTP cerrado. Bye 👋');
    process.exit(0);
  });
};
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Por si algo se escapa:
process.on('unhandledRejection', (err) => console.error('🛑 UnhandledRejection:', err));
process.on('uncaughtException', (err) => console.error('🛑 UncaughtException:', err));
