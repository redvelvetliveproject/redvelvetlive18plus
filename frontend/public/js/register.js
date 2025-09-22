// /public/js/register.js
import { showToast } from "./index.js"; // usamos el helper de index.js

const API_BASE = window.API_BASE || '/api';
const AUTH_BASE = window.AUTH_BASE || '/auth';

const $ = (s, r=document) => r.querySelector(s);
const form = $('#registerForm');
const msg  = $('#registerMsg');

const elPwd = $('#password');
const meter = $('#pwdMeter');
const toggle = $('#togglePwd');

function strength(pwd){
  let score = 0;
  if (!pwd) return 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/\d/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score;
}
function updateMeter(val){
  meter.classList.remove('weak','mid','strong');
  const s = strength(val);
  if (s >= 3) meter.classList.add('strong');
  else if (s === 2) meter.classList.add('mid');
  else if (s > 0) meter.classList.add('weak');
}

elPwd?.addEventListener('input', e => updateMeter(e.target.value));
toggle?.addEventListener('click', () => {
  const t = elPwd.type === 'password' ? 'text' : 'password';
  elPwd.type = t;
  toggle.textContent = t === 'password' ? '👁️' : '🙈';
});

// Preajustar valores desde query
(function presetFromQuery(){
  const qp = new URLSearchParams(location.search);
  const role = qp.get('role');
  if (role && (role === 'model' || role === 'client')) {
    $('#role').value = role;
  }
  const ref = qp.get('ref');
  if (ref) sessionStorage.setItem('referralCode', ref);
})();

async function getCsrf(){
  try {
    const r = await fetch(`${API_BASE}/csrf`, { credentials:'include' });
    const j = await r.json();
    return j?.csrfToken;
  } catch { return null; }
}

async function register(payload){
  const csrf = await getCsrf();
  const r = await fetch(`${AUTH_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type':'application/json', ...(csrf?{'x-csrf-token':csrf}:{}) },
    credentials: 'include',
    body: JSON.stringify(payload)
  });
  if (!r.ok) throw new Error((await r.json().catch(()=>null))?.error || 'Error');
  return r.json();
}

form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  msg.textContent = '';

  if ($('#hp_url')?.value) { 
    msg.textContent = 'Error.'; 
    showToast("Error de validación (honeypot)", "error");
    return; 
  }

  const name = $('#name').value.trim();
  const email = $('#email').value.trim();
  const password = elPwd.value;
  const wallet = $('#wallet').value.trim();
  const role = $('#role').value;
  const isAdult = $('#isAdult').checked;
  const referralCode = sessionStorage.getItem('referralCode') || null;

  if (!name || !email || !password || !role || !isAdult) {
    msg.textContent = 'Completa los campos obligatorios.';
    showToast("Debes completar los campos obligatorios ⚠️", "warn");
    return;
  }
  if (wallet && !/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
    msg.textContent = 'Wallet inválida (EVM 0x + 40 hex).';
    showToast("Wallet inválida ❌", "error");
    return;
  }

  const payload = { name, email, password, wallet: wallet || undefined, role, referralCode };

  try {
    const data = await register(payload);
    msg.textContent = 'Registro exitoso. Redirigiendo…';
    showToast("Registro exitoso 🎉 Bienvenido/a", "success");

    const go = role === 'model' ? '/model-dashboard.html' : '/client-dashboard.html';
    setTimeout(()=> location.href = go, 600);
  } catch (err) {
    console.warn('register error, demo fallback', err);
    msg.textContent = 'Servidor no disponible. Simulando registro…';
    showToast("Servidor no disponible, usando modo demo ⚠️", "warn");

    setTimeout(()=>{
      window.__SESSION = { name, email, role };
      const go = role === 'model' ? '/model-dashboard.html' : '/client-dashboard.html';
      location.href = go;
    }, 700);
  }
});
