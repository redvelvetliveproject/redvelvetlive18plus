// frontend/hooks/use-validation.js
// Validaciones reutilizables + helper para formularios

export const validators = {
  required: (msg = 'form.required') => (v) =>
    (v != null && String(v).trim() !== '') || msg,

  email: (msg = 'form.emailInvalid') => (v) =>
    (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || ''))) || msg,

  minLength: (n, msg = 'form.minLength') => (v) =>
    (String(v || '').length >= n) || [msg, n],

  pattern: (re, msg = 'form.pattern') => (v) =>
    (re.test(String(v || ''))) || msg,
};

/**
 * Ejecuta reglas sobre un objeto (p.ej. { email, password })
 * rules: { campo: [validators...] }
 * t: función de traducción opcional (key, ...args)
 */
export function validate(data, rules = {}, t) {
  const errors = {};
  for (const [field, fns] of Object.entries(rules)) {
    const list = Array.isArray(fns) ? fns : [fns];
    for (const fn of list) {
      const res = fn(data[field]);
      if (res !== true) {
        // Soporta [key, arg] o 'key'
        let msg = '';
        if (Array.isArray(res)) {
          const [key, arg] = res;
          msg = t ? t(key, { n: arg }) : `${key}: ${arg}`;
        } else {
          msg = t ? t(res) : res;
        }
        errors[field] = msg;
        break;
      }
    }
  }
  return { ok: Object.keys(errors).length === 0, errors };
}

/**
 * Valida un <form> directamente leyendo sus inputs por 'name'
 * Devuelve { ok, errors } y (opcionalmente) pinta aria-invalid
 */
export function validateFormElement(form, rules = {}, t, { markInvalid = true } = {}) {
  const fd = new FormData(form);
  const obj = Object.fromEntries(fd.entries());
  const res = validate(obj, rules, t);

  if (markInvalid) {
    Object.keys(rules).forEach((name) => {
      const el = form.querySelector(`[name="${name}"]`);
      if (!el) return;
      if (res.errors[name]) el.setAttribute('aria-invalid', 'true');
      else el.removeAttribute('aria-invalid');
    });
  }

  return res;
}
