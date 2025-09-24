# 1. Ve a la carpeta del backend
cd /var/www/redvelvetlive/backend

# 2. Asegura carpetas
mkdir -p src logs

# 3. Crea el server.js (importa app.js si existe y hace listen en PORT)
cat > src/server.js <<'EOF'
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

let app;
try {
  // Tu app real (si existe)
  app = require('./app.js');
} catch (e) {
  // Fallback mínimo para no romper si aún no exportas app
  const express = require('express');
  app = express();
  app.get('/healthz', (_, res) => res.json({ ok: true, msg: 'fallback' }));
}

const http = require('http');
const PORT = process.env.PORT || 3001;

const server = http.createServer(app);
server.listen(PORT, () => {
  console.log(`API escuchando en puerto ${PORT} (NODE_ENV=${process.env.NODE_ENV || 'dev'})`);
});
EOF
