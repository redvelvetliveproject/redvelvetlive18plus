// frontend/hooks/use-form.js
// Validación avanzada y helpers accesibles para formularios.

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
    if (input.minLength && input.value.length < input.minLength) return false;
    if (input.pattern && !new RegExp(input.pattern).test(input.value)) return false;
    return true;
  }

  function toggleError(input, on) {
    const fieldError = input.closest('label, .field')?.querySelector('.field-error');
    if (on) {
      input.setAttribute('aria-invalid', 'true');
      if (fieldError) {
        fieldError.textContent = input.getAttribute('data-error') || 'Campo inválido';
        fieldError.style.display = 'block';
        input.setAttribute('aria-describedby', fieldError.id || `${input.name}-error`);
      }
    } else {
      input.removeAttribute('aria-invalid');
      if (fieldError) fieldError.style.display = 'none';
    }
  }

  function validateForm() {
    const inputs = el.querySelectorAll('input, textarea, select');
    let ok = true;
    inputs.forEach((i) => { if (!validateField(i)) ok = false; });
    state.valid = ok;
    if (onValidChange) onValidChange(ok);
    return ok;
  }

  function getValues() {
    return Object.fromEntries(new FormData(el));
  }

  el.addEventListener('input', (e) => {
    const target = e.target;
    if (target && target.matches('input,textarea,select')) {
      validateField(target);
      if (onValidChange) onValidChange(state.valid);
    }
  });

  el.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (onSubmit) await onSubmit(new FormData(el), e, getValues());
  });

  return { validate: validateForm, getValues };
}

