// frontend/pages/ModelDashboard.jsx
import React from 'react';
import Layout from '../components/Layout.jsx';
import ProtectedRoute from '../components/ProtectedRoute.jsx';
import LoadingScreen from '../components/LoadingScreen.jsx';

export default function ModelDashboard() {
  return (
    <ProtectedRoute requiredRole="model">
      <Layout role="model">
        <React.Suspense fallback={<LoadingScreen message="Cargando tu panel..." />}>
          <h1>Bienvenida modelo 🎥</h1>
          <p>Aquí verás tus estadísticas, transmisiones y más.</p>
        </React.Suspense>
      </Layout>
    </ProtectedRoute>
  );
}
