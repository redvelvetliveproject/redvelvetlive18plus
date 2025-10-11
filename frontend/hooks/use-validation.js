// frontend/hooks/use-validation.js
// Validaciones reutilizables + helper universal para formularios

export const validators = {
  required: (msg = 'form.required') => (v) =>
    (v != null && String(v).trim() !== '') || msg,

  email: (msg = 'form.emailInvalid') => (v) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || '')) || msg,

  minLength: (n, msg = 'form.minLength') => (v) =>
    String(v || '').length >= n || [msg, n],

  maxLength: (n, msg = 'form.maxLength') => (v) =>
    String(v || '').length <= n || [msg, n],

  pattern: (re, msg = 'form.pattern') => (v) =>
    re.test(String(v || '')) || msg,

  sameAs: (field, msg = 'form.mustMatch') => (v, all) =>
    v === all[field] || msg,

  // ✅ Validación asíncrona (ej: verificar email en backend)
  async: (fn) => async (v, all) => {
    const result = await fn(v, all);
    return result === true || result;
  },
};

/**
 * Ejecuta validaciones sobre un objeto plano
 * @param {object} data - { campo: valor }
 * @param {object} rules - { campo: [validators...] }
 * @param {function} t - traductor opcional
 */
export async function validate(data, rules = {}, t) {
  const errors = {};

  for (const [field, fns] of Object.entries(rules)) {
    const list = Array.isArray(fns) ? fns : [fns];
    for (const fn of list) {
      const res = await fn(data[field], data); // 👈 se pasa todo el objeto
      if (res !== true) {
        let msg = '';
        if (Array.isArray(res)) {
          const [key, arg] = res;
          msg = t ? t(key, { n: arg }) : `${key}: ${arg}`;
        } else {
          msg = t ? t(res) : res;
        }
        errors[field] = msg;
        break; // detener al primer error
      }
    }
  }

  return {
    ok: Object.keys(errors).length === 0,
    errors,
    hasError: (name) => !!errors[name],
    firstError: () => Object.values(errors)[0] || null,
  };
}

/**
 * Valida un <form> HTML leyendo sus inputs por 'name'
 * Devuelve { ok, errors } y marca aria-invalid automáticamente
 */
export async function validateFormElement(form, rules = {}, t, { markInvalid = true } = {}) {
  const fd = new FormData(form);
  const obj = Object.fromEntries(fd.entries());
  const result = await validate(obj, rules, t);

  if (markInvalid) {
    Object.keys(rules).forEach((name) => {
      const el = form.querySelector(`[name="${name}"]`);
      if (!el) return;

      if (result.errors[name]) {
        el.setAttribute('aria-invalid', 'true');
        el.setAttribute('aria-describedby', `${name}-error`);
        let errNode = form.querySelector(`#${name}-error`);
        if (!errNode) {
          errNode = document.createElement('div');
          errNode.id = `${name}-error`;
          errNode.className = 'field-error';
          el.insertAdjacentElement('afterend', errNode);
        }
        errNode.textContent = result.errors[name];
        errNode.style.display = 'block';
      } else {
        el.removeAttribute('aria-invalid');
        const errNode = form.querySelector(`#${name}-error`);
        if (errNode) errNode.style.display = 'none';
      }
    });
  }

  return result;
}

