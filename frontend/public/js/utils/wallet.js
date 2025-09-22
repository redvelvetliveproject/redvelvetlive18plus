// utils/wallet.js
// Helpers de firma y verificación con MetaMask para wallets EVM.
// - EIP-191 (personal_sign)
// - EIP-712 (eth_signTypedData_v4)
// Requiere que el backend exponga:
//   GET  /users/me/wallets/challenge?address=0x... -> { challenge, typedData? }
//   POST /users/me/wallets/:address/verify        -> { ok, ... } (acepta {signature, challenge?} y/o typed)

// BASE API
const API_BASE =
  (typeof window !== 'undefined' && window.API_BASE) ? window.API_BASE : '/api';

// --- HTTP helper (incluye CSRF si está disponible) ---
async function http(path, { method = 'GET', body } = {}) {
  const headers = { Accept: 'application/json' };
  if (body) headers['Content-Type'] = 'application/json';
  if (window.CSRF_TOKEN) headers['X-CSRF-Token'] = window.CSRF_TOKEN;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    credentials: 'include',
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try { data = await res.json(); } catch { /* ignore */ }

  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || `HTTP ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data ?? {};
}

// --- MetaMask helpers ---
function getProvider() {
  if (typeof window === 'undefined') throw new Error('Entorno no navegador.');
  const { ethereum } = window;
  if (!ethereum) throw new Error('No se encontró un proveedor Ethereum (MetaMask).');
  return ethereum;
}

async function requestAccounts() {
  const eth = getProvider();
  const accounts = await eth.request({ method: 'eth_requestAccounts' });
  if (!accounts || !accounts.length) throw new Error('No se obtuvieron cuentas.');
  return accounts;
}

// --- Firmas ---
/**
 * Firma texto plano con personal_sign (EIP-191)
 * @param {string} message - Texto/nonce a firmar
 * @param {string} fromAddress - Dirección EVM (0x..)
 */
async function signPersonal(message, fromAddress) {
  const eth = getProvider();
  // personal_sign usa [data, from]
  return eth.request({
    method: 'personal_sign',
    params: [message, fromAddress],
  });
}

/**
 * Firma typed data (EIP-712) con eth_signTypedData_v4
 * @param {string} fromAddress
 * @param {object} typedData - Estructura EIP-712 completa (domain, types, message)
 */
async function signTypedData(fromAddress, typedData) {
  const eth = getProvider();
  return eth.request({
    method: 'eth_signTypedData_v4',
    params: [fromAddress, JSON.stringify(typedData)],
  });
}

// --- Flujo de verificación (alto nivel) ---
/**
 * 1) Pide challenge al backend (y typedData si existe)
 * 2) Firma con MetaMask (EIP-712 preferido; fallback EIP-191)
 * 3) Envía firma a verify
 * @param {string} address 0x...
 * @returns {Promise<{ ok: boolean, address: string, signature: string }>}
 */
export async function signWalletChallenge(address) {
  const addr = String(address || '').toLowerCase();
  if (!/^0x[a-fA-F0-9]{40}$/.test(addr)) throw new Error('Dirección inválida');

  const [from] = await requestAccounts();
  if (from.toLowerCase() !== addr) {
    throw new Error('La cuenta activa en MetaMask no coincide con la dirección a verificar.');
  }

  // 1) challenge
  const ch = await http(`/users/me/wallets/challenge?address=${encodeURIComponent(addr)}`, { method: 'GET' });

  // 2) firmar
  let signature;
  if (ch?.typedData) {
    signature = await signTypedData(from, ch.typedData);
  } else {
    const toSign = ch?.challenge || `Verificar wallet para RedVelvetLive\nAddress: ${addr}\nNonce: ${Date.now()}`;
    signature = await signPersonal(toSign, from);
  }

  // 3) verify
  const vr = await http(`/users/me/wallets/${encodeURIComponent(addr)}/verify`, {
    method: 'POST',
    body: {
      signature,
      challenge: ch?.challenge,  // para EIP-191
      typedData: ch?.typedData,  // para EIP-712 (opcional, por si el backend lo necesita)
    },
  });

  return { ok: !!vr?.ok, address: addr, signature };
}

/**
 * Variante explícita para EIP-712 (si quieres forzar typed)
 */
export async function signWalletChallengeTyped(address) {
  const addr = String(address || '').toLowerCase();
  if (!/^0x[a-fA-F0-9]{40}$/.test(addr)) throw new Error('Dirección inválida');

  const [from] = await requestAccounts();
  if (from.toLowerCase() !== addr) {
    throw new Error('La cuenta activa en MetaMask no coincide con la dirección a verificar.');
  }

  // Exigir typedData desde el backend
  const ch = await http(`/users/me/wallets/challenge?address=${encodeURIComponent(addr)}`, { method: 'GET' });
  if (!ch?.typedData) throw new Error('El backend no envió typedData para EIP-712.');

  const signature = await signTypedData(from, ch.typedData);

  const vr = await http(`/users/me/wallets/${encodeURIComponent(addr)}/verify`, {
    method: 'POST',
    body: { signature, typedData: ch.typedData },
  });

  return { ok: !!vr?.ok, address: addr, signature };
}

// Utilidad opcional para cargar CSRF una vez al inicio de la SPA
export async function ensureCsrfToken() {
  try {
    const data = await http('/csrf', { method: 'GET' });
    if (data?.csrfToken) window.CSRF_TOKEN = data.csrfToken;
    return window.CSRF_TOKEN;
  } catch {
    // en dev puedes omitir CSRF
    return null;
  }
}

