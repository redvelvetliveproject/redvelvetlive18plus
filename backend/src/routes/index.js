// src/routes/index.js
import { Router } from 'express';

// 🧠 Core
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';

// 👤 Usuarios
import usersRoutes from './users.routes.js';
import preferencesRoutes from './preferences.routes.js';

// 👛 Wallets + Web3
import walletsRoutes from './wallets.routes.js';
import walletChallengeRoutes from './wallet-challenge.routes.js';

// 👩 Modelos y clientes
import clientsRoutes from './clients.routes.js';
import modelsRoutes from './models.routes.js';

// 💰 Pagos + soporte
import paymentsRoutes from './payments.routes.js';
import supportRoutes from './support.routes.js';

// 📡 Streaming Livepeer (opcional, puede estar vacío al inicio)
import modelsLiveRoutes from './models.live.routes.js';

const router = Router();

/* ──────────── RUTAS API ────────────── */

// 🔄 Health + login
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

export default router;

import modelRoutes from "./model.js";
import walletRoutes from "./wallet.js";

// ... otras rutas
router.use("/model", modelRoutes);
router.use("/wallet", walletRoutes);

import modelRoutes from './model.routes.js';
import walletRoutes from './wallet.routes.js';

// …otras rutas…

router.use('/model', modelRoutes);
router.use('/wallet', walletRoutes);
