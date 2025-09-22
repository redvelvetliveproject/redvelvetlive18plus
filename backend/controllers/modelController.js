// Demo con datos falsos
export const getStats = async (req, res) => {
  try {
    res.json({
      rangeLabel: "Últimos 7 días",
      kpis: { incomeUSDT: 128.75, tipsCount: 36, sessions: 4 },
      incomeByDay: [
        { day: "Lun", amount: 10 },
        { day: "Mar", amount: 18 },
        { day: "Mié", amount: 24 },
        { day: "Jue", amount: 12 },
        { day: "Vie", amount: 36 },
        { day: "Sáb", amount: 15 },
        { day: "Dom", amount: 14 }
      ],
      topTippers: [
        { user: "@Neo", onecop: 650 },
        { user: "@Maya", onecop: 420 },
        { user: "@Alex", onecop: 280 }
      ]
    });
  } catch (err) {
    res.status(500).json({ error: "No se pudo obtener estadísticas" });
  }
};

export const getTips = async (req, res) => {
  try {
    res.json({
      items: [
        { date: "2025-07-10", user: "CryptoFan99", onecop: 1500, usdt: 15.0 },
        { date: "2025-07-09", user: "LatamLover", onecop: 800, usdt: 8.0 },
        { date: "2025-07-08", user: "AnonSupporter", onecop: 1200, usdt: 12.0 }
      ]
    });
  } catch (err) {
    res.status(500).json({ error: "No se pudo obtener historial de tips" });
  }
};

