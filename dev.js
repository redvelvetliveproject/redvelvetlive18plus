import app from './backend/src/app.js';

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor local en http://localhost:${PORT}`);
});
