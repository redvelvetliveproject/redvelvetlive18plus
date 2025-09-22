// api.js — wrapper global para RedVelvetLive
// Unifica lo que tenías en index.js + api.js

const API_BASE  =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE) ||
  (typeof window !== "undefined" && window.API_BASE) ||
  "/api";

const AUTH_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_AUTH_BASE) ||
  (typeof window !== "undefined" && window.AUTH_BASE) ||
  "/auth";

const DEFAULT_TIMEOUT_MS = 12000;
const RETRIES = 1;
const USE_LOCAL_TOKEN = false;
const LS_KEYS = { token: "jwt_token" };

// ---------- Utils ----------
const jsonHeaders = (extra = {}) => ({ "Content-Type": "application/json", ...extra });
const getLocalToken = () => { try { return localStorage.getItem(LS_KEYS.token); } catch { return null; } };
const setLocalToken = (t) => { try { localStorage.setItem(LS_KEYS.token, t); } catch {} };
const clearLocalToken = () => { try { localStorage.removeItem(LS_KEYS.token); } catch {} };

async function coreFetch(url, init, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(new DOMException("timeout", "AbortError")), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } finally { clearTimeout(timer); }
}

function buildInit({ method = "GET", body, headers = {}, withAuth = false } = {}) {
  const init = { method, headers: jsonHeaders(headers), credentials: "include" };
  if (body !== undefined) init.body = typeof body === "string" ? body : JSON.stringify(body);
  if (withAuth || USE_LOCAL_TOKEN) {
    const tok = getLocalToken();
    if (tok) init.headers.Authorization = `Bearer ${tok}`;
  }
  return init;
}

async function request(url, opts = {}) {
  const init = buildInit(opts);
  let lastErr;
  for (let attempt = 0; attempt <= RETRIES; attempt++) {
    try {
      const res = await coreFetch(url, init, opts.timeoutMs);
      const data = await res.json().catch(()=>null);
      if (!res.ok) {
        const msg = data?.error || `HTTP ${res.status}`;
        const err = new Error(msg); err.status = res.status; err.data = data;
        throw err;
      }
      return data;
    } catch (e) {
      lastErr = e;
      const networkish = e?.name === "AbortError" || e?.message === "Failed to fetch";
      if (!networkish || attempt === RETRIES) break;
    }
  }
  throw lastErr;
}

// ---------- Helpers ----------
export async function getCsrf(){
  try {
    const r = await request(`${API_BASE}/csrf`, { method:"GET" });
    return r?.csrfToken || null;
  } catch { return null; }
}

// ---------- Auth ----------
export async function register(payload) { return request(`${AUTH_BASE}/register`, { method:"POST", body:payload }); }
export async function loginEmail(payload) { return request(`${AUTH_BASE}/login`, { method:"POST", body:payload }); }
export async function loginWallet(payload) { return request(`${AUTH_BASE}/login`, { method:"POST", body:payload }); }
export async function logout() { return request(`${AUTH_BASE}/logout`, { method:"POST" }); }
export async function refresh() { return request(`${AUTH_BASE}/refresh`, { method:"POST" }); }

// ---------- Usuarios ----------
export const profile = () => request(`${API_BASE}/users/profile`, { withAuth:true });

// ---------- HTTP atajos ----------
export const http = {
  get:  (path, opts) => request(`${API_BASE}${path}`, { ...opts, method:"GET" }),
  post: (path, body, opts) => request(`${API_BASE}${path}`, { ...opts, method:"POST", body }),
  put:  (path, body, opts) => request(`${API_BASE}${path}`, { ...opts, method:"PUT", body }),
  del:  (path, opts) => request(`${API_BASE}${path}`, { ...opts, method:"DELETE" }),
};

export default { http, register, loginEmail, loginWallet, logout, refresh, profile, getCsrf };
