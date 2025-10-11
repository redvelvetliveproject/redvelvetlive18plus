// frontend/pages/models.jsx
import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout.jsx';
import ProfileCard from '../components/ProfileCard.jsx';
import { createApi } from '../hooks/use-api.js';

export default function ModelsExplorer() {
  const [models, setModels] = useState([]);
  const api = createApi('/api');

  useEffect(() => {
    api.get('/users?role=model').then(setModels).catch(console.error);
  }, []);

  return (
    <Layout>
      <h1 style={{ textAlign: 'center', margin: '2rem 0' }}>🔥 Modelos destacadas</h1>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '2rem',
          padding: '2rem',
        }}
      >
        {models.map((m) => (
          <ProfileCard key={m.id} {...m} />
        ))}
      </div>
    </Layout>
  );
}
