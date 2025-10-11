// frontend/components/ProfileEditor.jsx
import React, { useEffect, useState } from 'react';
import { createApi } from '../hooks/use-api.js';
import { createAuth } from '../hooks/use-auth.js';
import { validate, validators } from '../hooks/use-validation.js';

const api = createApi('/api');
const auth = createAuth();

export default function ProfileEditor() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    name: '',
    locale: 'es',
    bio: '',
    instagram: '',
    twitter: '',
    onlyfans: '',
    website: '',
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  // 📡 Cargar perfil al montar el componente
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/users/profile');
        setProfile(res.user || res);
        setForm({
          name: res.user?.name || '',
          locale: res.user?.locale || 'es',
          bio: res.user?.bio || '',
          instagram: res.user?.socialLinks?.instagram || '',
          twitter: res.user?.socialLinks?.twitter || '',
          onlyfans: res.user?.socialLinks?.onlyfans || '',
          website: res.user?.socialLinks?.website || '',
        });
        setAvatarPreview(res.user?.avatar?.large || null);
      } catch (e) {
        console.error('❌ Error cargando perfil:', e);
      }
    })();
  }, []);

  // 📤 Manejar cambios en inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  // 🖼️ Manejar subida de imagen local
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  // 📤 Subir avatar optimizado
  const uploadAvatar = async () => {
    if (!avatarFile || !form.name) return null;
    const fd = new FormData();
    fd.append('avatar', avatarFile);
    fd.append('modelName', form.name);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: fd,
      credentials: 'include',
    });

    if (!res.ok) throw new Error('Error al subir avatar');
    const data = await res.json();
    return data.urls;
  };

  // ✅ Guardar perfil
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    // 🧠 Validaciones
    const { ok, errors } = validate(
      form,
      {
        name: [validators.required()],
        bio: [validators.minLength(10, 'form.bioMin')],
      },
      (k) => k // 🔁 podrías conectar aquí tu función de traducción
    );

    if (!ok) {
      setLoading(false);
      setMsg(Object.values(errors)[0]);
      return;
    }

    try {
      // 📤 Subir imagen si hay nueva
      let avatarUrls = profile?.avatar;
      if (avatarFile) {
        avatarUrls = await uploadAvatar();
      }

      // 📤 Actualizar perfil
      await api.patch('/users/profile', {
        name: form.name,
        locale: form.locale,
        bio: form.bio,
        socialLinks: {
          instagram: form.instagram,
          twitter: form.twitter,
          onlyfans: form.onlyfans,
          website: form.website,
        },
        avatar: avatarUrls || {},
      });

      setMsg('✅ Perfil actualizado con éxito.');
    } catch (err) {
      console.error('❌ Error actualizando perfil:', err);
      setMsg(err.message || 'Error actualizando perfil.');
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return <p>⏳ Cargando perfil...</p>;

  return (
    <div
      style={{
        maxWidth: '600px',
        margin: '2rem auto',
        padding: '2rem',
        background: '#fff',
        borderRadius: '12px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
      }}
    >
      <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
        ✏️ Editar Perfil
      </h2>

      <form onSubmit={handleSubmit}>
        {/* 📸 Avatar */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          {avatarPreview ? (
            <img
              src={avatarPreview}
              alt="Avatar preview"
              style={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <div
              style={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: '#eee',
                display: 'inline-block',
              }}
            />
          )}
          <div style={{ marginTop: '0.5rem' }}>
            <input type="file" accept="image/*" onChange={handleAvatarChange} />
          </div>
        </div>

        {/* 📝 Campos básicos */}
        <label>Nombre</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          className="input"
          style={{ width: '100%', marginBottom: '1rem' }}
        />

        <label>Idioma</label>
        <select
          name="locale"
          value={form.locale}
          onChange={handleChange}
          style={{ width: '100%', marginBottom: '1rem' }}
        >
          <option value="es">Español</option>
          <option value="en">English</option>
        </select>

        <label>Biografía</label>
        <textarea
          name="bio"
          value={form.bio}
          onChange={handleChange}
          rows={4}
          style={{ width: '100%', marginBottom: '1rem' }}
        />

        {/* 🔗 Redes sociales */}
        <label>Instagram</label>
        <input
          name="instagram"
          value={form.instagram}
          onChange={handleChange}
          style={{ width: '100%', marginBottom: '1rem' }}
        />
        <label>Twitter</label>
        <input
          name="twitter"
          value={form.twitter}
          onChange={handleChange}
          style={{ width: '100%', marginBottom: '1rem' }}
        />
        <label>OnlyFans</label>
        <input
          name="onlyfans"
          value={form.onlyfans}
          onChange={handleChange}
          style={{ width: '100%', marginBottom: '1rem' }}
        />
        <label>Sitio web</label>
        <input
          name="website"
          value={form.website}
          onChange={handleChange}
          style={{ width: '100%', marginBottom: '1rem' }}
        />

        {/* 📤 Botón guardar */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.8rem',
            background: '#ff003c',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          {loading ? 'Guardando...' : '💾 Guardar cambios'}
        </button>
      </form>

      {msg && (
        <p style={{ marginTop: '1rem', textAlign: 'center', color: '#333' }}>
          {msg}
        </p>
      )}
    </div>
  );
}
