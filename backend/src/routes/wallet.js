// backend/src/routes/wallet.js
import express from "express";
const router = express.Router();

// GET /api/wallet/me/balance
router.get("/me/balance", (req, res) => {
  try {
    // 🔹 Mock de saldo mientras se conecta a la blockchain real
    const balance = Math.floor(Math.random() * 5000) + 100; // entre 100 y 5100
    return res.json({ ok: true, balance, currency: "ONECOP" });
  } catch (err) {
    console.error("Error en /wallet/me/balance:", err);
    return res.status(500).json({ ok: false, error: "internal_error" });
  }
});

export default router;
