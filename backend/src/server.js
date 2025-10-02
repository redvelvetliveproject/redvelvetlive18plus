import 'dotenv/config';
import http from 'http';
import app from './app.js';

// Puerto desde variables de entorno o por defecto
const PORT = process.env.PORT || 3001;

// Crear servidor HTTP
const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`✅ API escuchando en puerto ${PORT} (NODE_ENV=${process.env.NODE_ENV || 'development'})`);
});

// Manejo de errores no capturados
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});
