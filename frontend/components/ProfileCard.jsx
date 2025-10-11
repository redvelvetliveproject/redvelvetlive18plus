// frontend/components/ProfileCard.jsx
import React from 'react';

/**
 * 📸 ProfileCard – Tarjeta pública de modelo
 * Muestra avatar, nombre, biografía corta, redes y estadísticas
 * Lista para SEO y para usar en grids, sliders o secciones destacadas.
 */
export default function ProfileCard({
  name,
  bio,
  avatar,
  stats = {},
  socialLinks = {},
  locale = 'es',
  onClick,
}) {
  const fallbackAvatar = '/assets/avatars/default-avatar.webp';
  const smallAvatar = avatar?.large || avatar?.small || fallbackAvatar;

  return (
    <div
      className="profile-card"
      onClick={onClick}
      style={{
        background: '#fff',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        overflow: 'hidden',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        cursor: onClick ? 'pointer' : 'default',
      }}
      role="article"
      aria-label={`Perfil de modelo ${name}`}
    >
      {/* Avatar */}
      <div
        style={{
          width: '100%',
          height: '260px',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <img
          src={smallAvatar}
          alt={`Foto de perfil de ${name} en RedVelvetLive`}
          loading="lazy"
          width="100%"
          height="260"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.3s ease',
          }}
          className="profile-avatar"
        />
      </div>

      {/* Info */}
      <div style={{ padding: '1.2rem' }}>
        <h2
          style={{
            fontSize: '1.6rem',
            fontWeight: '600',
            marginBottom: '0.4rem',
            color: '#ff003c',
            textTransform: 'capitalize',
          }}
        >
          {name}
        </h2>

        <p
          style={{
            fontSize: '1rem',
            color: '#555',
            minHeight: '48px',
            marginBottom: '1rem',
          }}
        >
          {bio?.slice(0, 100) || 'Modelo en RedVelvetLive 💋'}
        </p>

        {/* Stats */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '1rem',
            fontSize: '0.95rem',
          }}
        >
          <div>
            👥 <strong>{stats.followers || 0}</strong> Seguidores
          </div>
          <div>
            💸 <strong>{stats.tips || 0}</strong> Tips
          </div>
          <div>
            💰 <strong>{stats.totalEarnings || 0}</strong> USD
          </div>
        </div>

        {/* Redes */}
        <div
          style={{
            display: 'flex',
            gap: '0.8rem',
            marginBottom: '0.8rem',
          }}
        >
          {socialLinks.instagram && (
            <a
              href={socialLinks.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Instagram de ${name}`}
              style={{ fontSize: '1.4rem', color: '#E1306C' }}
            >
              📸
            </a>
          )}
          {socialLinks.twitter && (
            <a
              href={socialLinks.twitter}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Twitter de ${name}`}
              style={{ fontSize: '1.4rem', color: '#1DA1F2' }}
            >
              🐦
            </a>
          )}
          {socialLinks.onlyfans && (
            <a
              href={socialLinks.onlyfans}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`OnlyFans de ${name}`}
              style={{ fontSize: '1.4rem', color: '#006AFF' }}
            >
              🔥
            </a>
          )}
          {socialLinks.website && (
            <a
              href={socialLinks.website}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Sitio web de ${name}`}
              style={{ fontSize: '1.4rem', color: '#333' }}
            >
              🌐
            </a>
          )}
        </div>

        {/* CTA */}
        <a
          href={`/models/${name?.toLowerCase().replace(/\s+/g, '-')}`}
          style={{
            display: 'block',
            textAlign: 'center',
            padding: '0.8rem',
            background: '#ff003c',
            color: '#fff',
            borderRadius: '8px',
            fontWeight: '600',
            textDecoration: 'none',
            transition: 'background 0.2s ease',
          }}
        >
          Ver perfil completo →
        </a>
      </div>
    </div>
  );
}
