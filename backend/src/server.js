// backend/src/server.js
require('dotenv').config({
  path: require('path').join(__dirname, '..', '.env')
});

const http = require('http');
const app = require('./app.js'); // ya dentro de src
const PORT = process.env.PORT || 3001;

const server = http.createServer(app);
server.listen(PORT, () => {
  console.log(`🚀 API escuchando en puerto ${PORT} (NODE_ENV=${process.env.NODE_ENV || 'dev'})`);
});

