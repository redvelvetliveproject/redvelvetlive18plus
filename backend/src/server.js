import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Ruta de healthcheck
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Backend corriendo en producción 🚀',
    env: process.env.NODE_ENV || 'dev'
  });
});

// Ejemplo de conexión Mongo (solo si defines MONGO_URI en tu .env)
if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('✅ Conectado a MongoDB'))
    .catch(err => console.error('❌ Error MongoDB:', err));
}

// Aquí puedes montar más rutas de tu API
// app.use('/api/users', usersRoutes);

app.listen(PORT, () => {
  console.log(`API escuchando en puerto ${PORT} (NODE_ENV=${process.env.NODE_ENV || 'dev'})`);
});

