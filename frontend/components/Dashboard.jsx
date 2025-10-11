// frontend/components/Dashboard.jsx
import React from 'react';
import { createAuth, createAnalytics } from '../hooks';

const auth = createAuth();
const analytics = createAnalytics({ debug: true });

export default function Dashboard() {
  async function loadProfile() {
    try {
      const user = await auth.getProfile();
      analytics.track('profile_loaded', { id: user?.id });
      console.log('Perfil cargado:', user);
    } catch (err) {
      console.error('Error al cargar el perfil', err);
      analytics.track('error', { error: err.message });
    }
  }

  return <button onClick={loadProfile}>Cargar perfil</button>;
}

