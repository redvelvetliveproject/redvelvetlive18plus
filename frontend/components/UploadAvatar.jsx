// frontend/components/UploadAvatar.jsx
import React, { useState, useRef } from 'react';

export default function UploadAvatar({ modelName, onUploaded }) {
  const [preview, setPreview] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  async function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Validación rápida en frontend
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('❌ Solo se permiten imágenes JPG, PNG o WEBP');
      return;
    }

    // Previsualización inmediata
    const url = URL.createObjectURL(file);
    setPreview(url);

    // Subir automáticamente después de seleccionar
    await uploadFile(file);
  }

  async function uploadFile(file) {
    if (!modelName) {
      alert('❌ modelName es requerido para subir el avatar.');
      return;
    }

    setUploading(true);
    setProgress(0);
    setResult(null);

    const formData = new FormData();
    formData.append('avatar', file);
    formData.append('modelName', modelName);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
        onUploadProgress: (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            setProgress(percent);
          }
        }
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error subiendo imagen');

      setResult(data.urls);
      onUploaded?.(data.urls);
    } catch (err) {
      console.error('❌ Error al subir avatar:', err);
      alert(`❌ Error: ${err.message}`);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>📸 Subir foto de perfil</h3>

      <div style={styles.previewContainer}>
        {preview ? (
          <img src={preview} alt="Vista previa" style={styles.preview} />
        ) : (
          <div style={styles.placeholder}>No hay imagen seleccionada</div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      <button
        type="button"
        onClick={() => fileInputRef.current.click()}
        disabled={uploading}
        style={styles.button}
      >
        {uploading ? '⏳ Subiendo...' : '📤 Elegir imagen'}
      </button>

      {uploading && (
        <div style={styles.progressContainer}>
          <div style={{ ...styles.progressBar, width: `${progress}%` }}></div>
        </div>
      )}

      {result && (
        <div style={styles.result}>
          ✅ Imagen subida correctamente:
          <ul>
            <li><a href={result.small} target="_blank" rel="noreferrer">🔗 128×128</a></li>
            <li><a href={result.large} target="_blank" rel="noreferrer">🔗 720×720</a></li>
          </ul>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    border: '1px solid #ddd',
    padding: '1.5rem',
    borderRadius: '8px',
    background: '#fff',
    maxWidth: '400px',
    margin: '1rem auto',
    textAlign: 'center',
    fontFamily: 'Arial, sans-serif'
  },
  title: {
    fontSize: '1.4rem',
    marginBottom: '1rem'
  },
  previewContainer: {
    width: '128px',
    height: '128px',
    margin: '0 auto 1rem',
    borderRadius: '50%',
    overflow: 'hidden',
    border: '2px solid #ccc'
  },
  preview: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  placeholder: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#aaa',
    fontSize: '0.9rem'
  },
  button: {
    padding: '0.8rem 1.6rem',
    background: '#ff003c',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600'
  },
  progressContainer: {
    width: '100%',
    height: '6px',
    background: '#eee',
    borderRadius: '4px',
    marginTop: '1rem',
    overflow: 'hidden'
  },
  progressBar: {
    height: '100%',
    background: '#ff003c',
    transition: 'width 0.3s ease'
  },
  result: {
    marginTop: '1.5rem',
    fontSize: '0.95rem',
    color: '#333'
  }
};
