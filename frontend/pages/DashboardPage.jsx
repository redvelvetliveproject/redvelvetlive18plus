// frontend/pages/DashboardPage.jsx
import React from 'react';
import Layout from '../components/Layout.jsx';
import ProtectedRoute from '../components/ProtectedRoute.jsx';
import DashboardHeader from '../components/DashboardHeader.jsx';
import DashboardStats from '../components/DashboardStats.jsx';
import LoadingScreen from '../components/LoadingScreen.jsx';

export default function DashboardPage() {
  return (
    <ProtectedRoute requiredRole="model">
      <Layout role="model">
        <React.Suspense fallback={<LoadingScreen message="Cargando panel..." />}>
          <DashboardHeader />
          <DashboardStats />
          <section style={{ marginTop: '2rem' }}>
            <p>📊 Aquí irá el resto del contenido del dashboard: actividad reciente, alertas, configuraciones, etc.</p>
          </section>
        </React.Suspense>
      </Layout>
    </ProtectedRoute>
  );
}
