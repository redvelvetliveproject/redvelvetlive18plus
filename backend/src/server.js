// backend/src/server.js
import dotenv from 'dotenv';
import http from 'http';
import app from './app.js';

dotenv.config({ path: new URL('../.env', import.meta.url).pathname });

const PORT = process.env.PORT || 3001;

const server = http.createServer(app);
server.listen(PORT, () => {
  console.log(`✅ API escuchando en puerto ${PORT} (NODE_ENV=${process.env.NODE_ENV || 'dev'})`);
});

