// backend/src/routes/index.js
import { Router } from 'express';

// 🧠 Core
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';

// 👤 Usuarios
import usersRoutes from './users.routes.js';
import preferencesRoutes from './preferences.routes.js';

// 👛 Wallets + Web3
import walletsRoutes from './wallets.routes.js';
import walletChallengeRoutes from './wallet-challenge.routes.js'; // ✅ Solo esta importación

// 👩 Modelos y clientes
import clientsRoutes from './clients.routes.js';
import modelsRoutes from './models.routes.js';
import modelsLiveRoutes from './models.live.routes.js';

// 💰 Pagos + soporte
import paymentsRoutes from './payments.routes.js';
import supportRoutes from './support.routes.js';

const router = Router();

/* ────────────── RUTAS API ────────────── */

// 🔄 Estado y autenticación
router.use('/', healthRoutes);
router.use('/auth', authRoutes);

// 👤 Usuarios y preferencias
router.use('/users', usersRoutes);
router.use('/users/me/preferences', preferencesRoutes);

// 👛 Wallets y firma Web3
router.use('/users/me/wallets', walletsRoutes);
router.use('/wallet-challenge', walletChallengeRoutes);

// 👩 Clientes y modelos
router.use('/clients', clientsRoutes);
router.use('/models', modelsRoutes);
router.use('/models/live', modelsLiveRoutes);

// 💰 Pagos y soporte
router.use('/payments', paymentsRoutes);
router.use('/support', supportRoutes);

// ✅ Exportación principal
export default router;

