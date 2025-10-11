// frontend/pages/Unauthorized.jsx
import React from 'react';
import Layout from '../components/Layout.jsx';

export default function Unauthorized() {
  return (
    <Layout>
      <div
        style={{
          textAlign: 'center',
          padding: '5rem 2rem',
          color: '#ff003c',
        }}
      >
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚫 Acceso Denegado</h1>
        <p style={{ fontSize: '1.3rem', marginBottom: '2rem' }}>
          No tienes permisos para acceder a esta sección.
        </p>
        <a
          href="/"
          style={{
            display: 'inline-block',
            padding: '0.8rem 1.6rem',
            background: '#ff003c',
            color: '#fff',
            borderRadius: '6px',
            textDecoration: 'none',
            fontWeight: '600',
          }}
        >
          Volver al inicio
        </a>
      </div>
    </Layout>
  );
}
