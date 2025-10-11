import React, { useState } from 'react';
import { createAuth } from '../hooks/use-auth.js';
import { validate, validators } from '../hooks/use-validation.js';
import { applyI18n, t } from '../hooks/use-i18n.js';

const auth = createAuth();

export default function LoginForm() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const rules = {
    email: [validators.required(), validators.email()],
    password: [validators.required(), validators.minLength(6)],
  };

  async function handleSubmit(e) {
    e.preventDefault();
    const result = await validate(form, rules, t);
    setErrors(result.errors);

    if (!result.ok) return;

    setLoading(true);
    try {
      const res = await auth.loginWithEmail(form);
      setMessage(`✅ Bienvenido ${res?.user?.name || ''}`);
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="form-auth">
      <h2>{t('nav.login')}</h2>

      <label>
        Email
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          aria-invalid={!!errors.email}
        />
        {errors.email && <small className="field-error">{errors.email}</small>}
      </label>

      <label>
        Contraseña
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          aria-invalid={!!errors.password}
        />
        {errors.password && (
          <small className="field-error">{errors.password}</small>
        )}
      </label>

      <button type="submit" disabled={loading}>
        {loading ? 'Ingresando...' : 'Iniciar sesión'}
      </button>

      {message && <div className="form-message">{message}</div>}
    </form>
  );
}
