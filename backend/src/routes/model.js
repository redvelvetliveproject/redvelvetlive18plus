// backend/src/controllers/modelController.js
export const getStats = (req, res) => {
  // Return mock statistics for the model dashboard
  res.json({
    ok: true,
    rangeLabel: 'Últimos 7 días',
    kpis: {
      incomeUSDT: 128.75,
      tipsCount: 36,
      sessions: 4,
    },
    incomeByDay: [
      { day: 'Lun', amount: 10 },
      { day: 'Mar', amount: 18 },
      { day: 'Mié', amount: 24 },
      { day: 'Jue', amount: 12 },
      { day: 'Vie', amount: 36 },
      { day: 'Sáb', amount: 15 },
      { day: 'Dom', amount: 14 },
    ],
    topTippers: [
      { user: '@Neo', onecop: 650 },
      { user: '@Maya', onecop: 420 },
      { user: '@Alex', onecop: 280 },
    ],
  });
};

export const getTips = (req, res) => {
  // Return mock tips history
  res.json({
    ok: true,
    items: [
      { date: '10/07/2025', user: 'CryptoFan99', onecop: 1500, usdt: '$15.00' },
      { date: '09/07/2025', user: 'LatamLover', onecop:  800, usdt: '$8.00' },
      { date: '08/07/2025', user: 'AnonSupporter', onecop: 1200, usdt: '$12.00' },
    ],
  });
};
