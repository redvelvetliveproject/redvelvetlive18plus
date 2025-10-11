// frontend/pages/DashboardPage.jsx
import React from 'react';
import Layout from '../components/Layout.jsx';
import ProtectedRoute from '../components/ProtectedRoute.jsx';
import DashboardHeader from '../components/DashboardHeader.jsx';
import DashboardStats from '../components/DashboardStats.jsx';

export default function DashboardPage() {
  return (
    <ProtectedRoute requiredRole="model">
      <Layout>
        <DashboardHeader />
        <DashboardStats />
        <p>📊 Aquí irá el resto del contenido del dashboard...</p>
      </Layout>
    </ProtectedRoute>
  );
}
