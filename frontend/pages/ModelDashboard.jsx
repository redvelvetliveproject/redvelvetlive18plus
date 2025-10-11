// frontend/pages/ModelDashboard.jsx
import React from 'react';
import Layout from '../components/Layout.jsx';
import ProtectedRoute from '../components/ProtectedRoute.jsx';
import LoadingScreen from '../components/LoadingScreen.jsx';

export default function ModelDashboard() {
  return (
    <ProtectedRoute requiredRole="model">
      <Layout role="model">
        <React.Suspense fallback={<LoadingScreen message="Cargando tu panel de modelo..." />}>
          <div style={{ padding: '2rem' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>🎥 Bienvenida modelo</h1>
            <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
              Aquí verás tus estadísticas, transmisiones en curso, recompensas y herramientas de crecimiento.
            </p>
            <ul>
              <li>📊 Estadísticas detalladas</li>
              <li>💰 Pagos recientes y balance</li>
              <li>📈 Actividad y rendimiento</li>
            </ul>
          </div>
        </React.Suspense>
      </Layout>
    </ProtectedRoute>
  );
}
