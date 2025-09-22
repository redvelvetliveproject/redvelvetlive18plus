import React from 'react';
import { useApi, createAnalytics } from '../hooks';

const api = useApi('/api');
const analytics = createAnalytics({ debug: true });

export default function Example() {
  async function handleClick() {
    try {
      const data = await api.get('/users/profile');
      analytics.track('profile_viewed', { userId: data.id });
      console.log(data);
    } catch (err) {
      console.error('Error cargando perfil', err);
      analytics.track('error', { error: err.message });
    }
  }

  return <button onClick={handleClick}>Ver perfil</button>;
}
