// frontend/src/lib/api.js
import axios from 'axios';

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // cookies o auth
  timeout: 15000,
});

// (Opcional) Manejo global de errores
api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error('Error en la API:', err.message);
    return Promise.reject(err);
  }
);