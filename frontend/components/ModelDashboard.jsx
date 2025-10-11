import React from 'react';
import UploadAvatar from '../components/UploadAvatar.jsx';

export default function ModelDashboard() {
  return (
    <div>
      <h1>Bienvenida modelo 🎥</h1>
      <UploadAvatar
        modelName="Valeria Perez"
        onUploaded={(urls) => console.log('✅ URLs guardadas en MongoDB:', urls)}
      />
    </div>
  );
}
