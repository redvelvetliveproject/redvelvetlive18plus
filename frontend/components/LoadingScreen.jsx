// frontend/components/LoadingScreen.jsx
import React from 'react';

export default function LoadingScreen({ message = 'Cargando...', fullscreen = true }) {
  return (
    <div
      className={`loading-screen ${fullscreen ? 'fullscreen' : ''}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: fullscreen ? '100vh' : 'auto',
        width: '100%',
        background: fullscreen ? 'rgba(0,0,0,0.7)' : 'transparent',
        color: '#fff',
        flexDirection: 'column',
        textAlign: 'center',
      }}
    >
      <div
        className="spinner"
        style={{
          width: '60px',
          height: '60px',
          border: '6px solid rgba(255, 255, 255, 0.2)',
          borderTopColor: '#ff003c',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '1rem',
        }}
      ></div>
      <p style={{ fontSize: '1.2rem', fontWeight: '500' }}>{message}</p>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
