// frontend/components/DashboardHeader.jsx
import React, { useEffect, useState } from 'react';
import { getSessionProfile } from '../hooks/use-session.js';

export default function DashboardHeader() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    (async () => {
      const profile = await getSessionProfile();
      setUser(profile);
    })();
  }, []);

  return (
    <header className="dashboard-header">
      <h1>📊 Dashboard</h1>
      {user ? <p>Bienvenido, {user.name}</p> : <p>Cargando...</p>}
    </header>
  );
}
