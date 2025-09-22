// frontend/hooks/use-form.js
// Validación mínima y helpers para formularios.

export function createForm(el, { onSubmit, validators = {}, onValidChange } = {}) {
  if (!el) throw new Error('Form element required');
  const state = { valid: false };

  function validateField(input) {
    const id = input.id || input.name;
    const v = (validators[id] || defaultValidator)(input);
    toggleError(input, !v);
    return v;
  }

  function defaultValidator(input) {
    if (input.required && !String(input.value || '').trim()) return false;
    if (input.type === 'email' && input.value) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
    }
    return true;
  }

  function toggleError(input, on) {
    if (on) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
    const small = input.closest('label, .field')?.querySelector('.field-error');
    if (small) small.style.display = on ? 'block' : 'none';
  }

  function validateForm() {
    const inputs = el.querySelectorAll('input, textarea, select');
    let ok = true;
    inputs.forEach((i) => { if (!validateField(i)) ok = false; });
    state.valid = ok;
    if (onValidChange) onValidChange(ok);
    return ok;
  }

  el.addEventListener('input', (e) => {
    const target = e.target;
    if (target && (target.matches('input,textarea,select'))) {
      validateField(target);
      if (onValidChange) onValidChange(state.valid);
    }
  });

  el.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (onSubmit) await onSubmit(new FormData(el), e);
  });

  return { validate: validateForm };
}
