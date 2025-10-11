// frontend/components/DashboardStats.jsx
import React, { useEffect, useState } from 'react';
import { useApi } from '../hooks/use-api.js';

export default function DashboardStats() {
  const api = useApi();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    (async () => {
      const data = await api.get('/users/stats');
      setStats(data);
    })();
  }, []);

  if (!stats) return <p>Cargando estadísticas...</p>;

  return (
    <div className="dashboard-stats">
      <div>💰 Tips: {stats.tips}</div>
      <div>👥 Seguidores: {stats.following}</div>
      <div>💳 Saldo: {stats.balance} USDT</div>
    </div>
  );
}
