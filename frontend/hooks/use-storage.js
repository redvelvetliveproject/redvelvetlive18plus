// frontend/hooks/use-storage.js
// Almacenamiento seguro en localStorage con soporte JSON y fallback seguro

export const storage = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return fallback;
      try { return JSON.parse(raw); } catch { return raw; }
    } catch {
      return fallback;
    }
  },

  set(key, value) {
    try {
      const v = typeof value === 'object' ? JSON.stringify(value) : value;
      localStorage.setItem(key, v);
    } catch {}
  },

  remove(key) {
    try { localStorage.removeItem(key); } catch {}
  },

  has(key) {
    try { return localStorage.getItem(key) !== null; } catch { return false; }
  },

  clear() {
    try { localStorage.clear(); } catch {}
  },
};
