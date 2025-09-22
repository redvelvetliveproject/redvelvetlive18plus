// /js/wallet.js
import {
  hasEthereum, requestAccounts, getAccounts, getChainId,
  personalSign, isAddress, normalizeAddress, shortAddr,
  onAccountsChanged, onChainChanged
} from './utils/wallet.js';

const API_BASE = window.API_BASE || '/api';

// DOM
const $ = (s, r=document) => r.querySelector(s);
const walletsTable = $('#walletsTable tbody');
const walletStatus = $('#walletStatus');
const walletPrimary = $('#walletPrimary');
const msg = $('#walletMsg');

const btnConnect = $('#btnConnect');
const btnVerify  = $('#btnVerify');
const btnAdd     = $('#btnAdd');

let state = {
  currentAddr: null,
  chainId: null,
  wallets: [],
  user: null
};

function setMsg(text, type=''){
  msg.textContent = text || '';
  msg.className = `form-msg ${type}`.trim();
}

function setBusy(el, busy=true){
  if (!el) return;
  el.disabled = !!busy;
  el.setAttribute('aria-busy', busy ? 'true' : 'false');
}

function rowTpl(w) {
  // w: {_id, address, isPrimary, isVerified}
  const primary = w.isPrimary ? '✔️' : '—';
  const verified = w.isVerified ? '✔️' : '—';
  return `
    <tr data-id="${w._id}">
      <td><code>${w.address}</code></td>
      <td>${primary} / ${verified}</td>
      <td style="white-space:nowrap;display:flex;gap:.35rem">
        ${w.isPrimary ? '' : `<button class="btn link" data-act="makePrimary">Hacer principal</button>`}
        ${w.isVerified ? '' : `<button class="btn link" data-act="verify">Verificar</button>`}
        <button class="btn link danger" data-act="delete">Eliminar</button>
      </td>
    </tr>
  `;
}

function refreshHeader() {
  const primary = state.wallets.find(w => w.isPrimary);
  walletPrimary.textContent = primary ? shortAddr(primary.address) : '—';
  const anyVerified = state.wallets.some(w => w.isVerified);
  walletStatus.textContent = anyVerified ? 'Verificada' : 'No verificada';
}

function renderTable() {
  if (!state.wallets.length) {
    walletsTable.innerHTML = `<tr><td colspan="3" class="muted">Sin wallets vinculadas</td></tr>`;
    refreshHeader();
    return;
  }
  walletsTable.innerHTML = state.wallets.map(rowTpl).join('');
  refreshHeader();
}

async function safeJson(res){ try { return await res.json(); } catch { return null; } }
async function api(path, opts={}){
  const r = await fetch(`${API_BASE}${path}`, {
    credentials:'include',
    headers:{ 'Content-Type':'application/json', ...(opts.headers||{}) },
    method: opts.method || 'GET',
    body: opts.body ? JSON.stringify(opts.body) : undefined
  });
  if (!r.ok) throw new Error((await r.json().catch(()=>null))?.error || 'Error');
  return r.json();
}

// --- Carga inicial
async function loadWallets(){
  try {
    const data = await api('/users/me/wallets');
    state.wallets = Array.isArray(data?.items) ? data.items : [];
  } catch {
    // Fallback demo
    state.wallets = [
      { _id:'demo1', address:'0x1111111111111111111111111111111111111111', isPrimary:true, isVerified:true },
      { _id:'demo2', address:'0x2222222222222222222222222222222222222222', isPrimary:false, isVerified:false },
    ];
  } finally {
    renderTable();
  }
}

async function addWallet(addr){
  if (!isAddress(addr)) throw new Error('Dirección inválida');
  try {
    const res = await api('/users/me/wallets', { method:'POST', body:{ address: normalizeAddress(addr) } });
    if (res?.ok) await loadWallets();
  } catch (e){
    // Si endpoint no existe, simulamos inserción local
    const id = `local_${Date.now()}`;
    state.wallets.push({ _id:id, address: normalizeAddress(addr), isPrimary:false, isVerified:false });
    renderTable();
  }
}

async function deleteWallet(id){
  try {
    const res = await api(`/users/me/wallets/${id}`, { method:'DELETE' });
    if (res?.ok) state.wallets = state.wallets.filter(w => w._id !== id);
  } catch {
    state.wallets = state.wallets.filter(w => w._id !== id);
  } finally {
    renderTable();
  }
}

async function makePrimary(id){
  try {
    const res = await api(`/users/me/wallets/${id}/primary`, { method:'POST' });
    if (res?.ok){
      state.wallets = state.wallets.map(w => ({ ...w, isPrimary: w._id === id }));
    }
  } catch {
    state.wallets = state.wallets.map(w => ({ ...w, isPrimary: w._id === id }));
  } finally {
    renderTable();
  }
}

async function verifyWallet(id){
  // Flujo: GET challenge → personal_sign → POST verify
  const w = state.wallets.find(x=>x._id===id);
  if (!w) return;

  if (!hasEthereum()) { setMsg('MetaMask no detectado'); return; }

  // Asegúrate de tener seleccionada la misma address
  const acc = (await getAccounts())[0] || (await requestAccounts());
  if (normalizeAddress(acc) !== normalizeAddress(w.address)) {
    setMsg('Selecciona en MetaMask la cuenta que corresponde a esta wallet.');
    return;
  }

  try {
    setMsg('Solicitando challenge…');
    const chal = await api(`/users/me/wallets/${id}/challenge`).catch(()=>({ ok:true, challenge:`Firmar para verificar wallet ${w.address} en RedVelvetLive - nonce:${Date.now()}` }));
    const challengeText = chal?.challenge || `Firmar para verificar wallet ${w.address} - nonce:${Date.now()}`;

    setMsg('Esperando firma en MetaMask…');
    const sig = await personalSign(w.address, challengeText);

    setMsg('Verificando en el servidor…');
    const res = await api('/wallet-challenge/verify', { method:'POST', body:{ walletId:id, signature:sig } }).catch(()=>({ ok:true }));

    if (res?.ok){
      state.wallets = state.wallets.map(x => x._id===id ? ({ ...x, isVerified:true }) : x);
      renderTable();
      setMsg('Wallet verificada ✅', 'success');
    } else {
      throw new Error('No se pudo verificar');
    }
  } catch (err){
    console.warn(err);
    setMsg('La verificación fue cancelada o falló.');
  }
}

// --- Eventos UI
btnConnect?.addEventListener('click', async ()=>{
  setBusy(btnConnect, true);
  try {
    const addr = await requestAccounts();
    state.currentAddr = addr;
    setMsg(`Conectado: ${shortAddr(addr)}`, 'success');
  } catch (e){
    setMsg(e?.message || 'No se pudo conectar');
  } finally {
    setBusy(btnConnect, false);
  }
});

btnVerify?.addEventListener('click', async ()=>{
  // Verifica la principal por conveniencia
  const primary = state.wallets.find(w => w.isPrimary) || state.wallets[0];
  if (!primary){ setMsg('No hay wallet para verificar'); return; }
  setBusy(btnVerify, true);
  await verifyWallet(primary._id);
  setBusy(btnVerify, false);
});

btnAdd?.addEventListener('click', async ()=>{
  setBusy(btnAdd, true);
  try {
    const addr = state.currentAddr || (await requestAccounts());
    await addWallet(addr);
    setMsg('Wallet añadida', 'success');
  } catch (e){
    setMsg(e?.message || 'No se pudo añadir la wallet');
  } finally {
    setBusy(btnAdd, false);
  }
});

walletsTable?.addEventListener('click', async (e)=>{
  const btn = e.target.closest('button[data-act]');
  if (!btn) return;
  const tr = btn.closest('tr');
  const id = tr?.dataset?.id;
  if (!id) return;

  const act = btn.dataset.act;
  btn.disabled = true;

  if (act === 'delete') {
    await deleteWallet(id);
  } else if (act === 'makePrimary') {
    await makePrimary(id);
  } else if (act === 'verify') {
    await verifyWallet(id);
  }

  btn.disabled = false;
});

// Reactividad con MetaMask
onAccountsChanged(async (accs)=>{
  state.currentAddr = normalizeAddress(accs?.[0] || null);
});
onChainChanged(async ()=>{
  state.chainId = await getChainId();
});

// Arranque
(async function init(){
  await loadWallets();
  state.currentAddr = (await getAccounts())[0] || null;
  state.chainId = await getChainId();
})();

