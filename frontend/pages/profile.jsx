// frontend/pages/profile.jsx
import React from 'react';
import Layout from '../components/Layout.jsx';
import ProtectedRoute from '../components/ProtectedRoute.jsx';
import LoadingScreen from '../components/LoadingScreen.jsx';
import ProfileEditor from '../components/ProfileEditor.jsx';

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <Layout>
        <React.Suspense fallback={<LoadingScreen message="Cargando tu perfil..." />}>
          <section
            style={{
              maxWidth: '900px',
              margin: '2rem auto',
              padding: '2rem',
              background: '#fff',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            }}
          >
            <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
              <h1 style={{ fontSize: '2.4rem', color: '#ff003c', marginBottom: '0.5rem' }}>
                🧑‍🎤 Editar perfil
              </h1>
              <p style={{ fontSize: '1.1rem', color: '#555' }}>
                Personaliza tu cuenta, cambia tu avatar y conecta tus redes.
              </p>
            </header>

            {/* 🧩 Componente de edición */}
            <ProfileEditor />
          </section>
        </React.Suspense>
      </Layout>
    </ProtectedRoute>
  );
}
