import app from './app.js';

const PORT = process.env.PORT || 3001;
const PUBLIC_URL =
  process.env.PUBLIC_URL || `http://localhost:${PORT}`;

app.listen(PORT, () => {
  console.log(
    `[server] Servidor escuchando en ${PUBLIC_URL} (env ${process.env.NODE_ENV})`
  );
});
