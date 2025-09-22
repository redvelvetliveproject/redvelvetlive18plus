// Controlador de balance de la wallet de la modelo
export async function getBalance(req, res) {
  try {
    // TODO: implementar lógica para obtener saldo real (por ejemplo, consultar a un nodo BSC)
    // Respuesta simulada:
    res.json({ ok: true, balance: 500.00, currency: "ONECOP" });
  } catch (err) {
    res.status(500).json({ error: "No se pudo obtener el saldo" });
  }
}
export async function getBalance(req, res) {
  // Datos simulados; ajusta a tu lectura real de blockchain.
  const balance = 500;    // 500 ONECOP de ejemplo
  const currency = 'ONECOP';
  res.json({ balance, currency });
}
// backend/src/controllers/walletController.js
export const getBalance = (req, res) => {
  // Return mock balance for current user
  res.json({
    ok: true,
    balance: 500,         // 500 ONECOP
    currency: 'ONECOP',
    approxUSDT: 6.0,      // approximate USDT value
  });
};
