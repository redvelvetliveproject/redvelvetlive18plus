// /public/js/settings.js
// Carga/guarda idioma, wallets, notificaciones y privacidad.
// Con fallbacks si endpoints no existen.

const API_BASE = window.API_BASE || '/api';
const $ = (s, r=document) => r.querySelector(s);

async function jget(p){
  const r = await fetch(`${API_BASE}${p}`, { credentials:'include' });
  const j = await r.json().catch(()=>null);
  if (!r.ok) throw new Error(j?.error || 'Error');
  return j;
}
async function jput(p, body){
  const r = await fetch(`${API_BASE}${p}`, {
    method:'PUT',
    headers:{ 'Content-Type':'application/json' },
    credentials:'include',
    body: JSON.stringify(body)
  });
  const j = await r.json().catch(()=>null);
  if (!r.ok) throw new Error(j?.error || 'Error');
  return j;
}
async function jpost(p, body){
  const r = await fetch(`${API_BASE}${p}`, {
    method:'POST',
    headers:{ 'Content-Type':'application/json' },
    credentials:'include',
    body: JSON.stringify(body)
  });
  const j = await r.json().catch(()=>null);
  if (!r.ok) throw new Error(j?.error || 'Error');
  return j;
}
async function jdel(p){
  const r = await fetch(`${API_BASE}${p}`, { method:'DELETE', credentials:'include' });
  const j = await r.json().catch(()=>null);
  if (!r.ok) throw new Error(j?.error || 'Error');
  return j;
}

// ---- Idioma ----
const localeSel = $('#locale');
const msgLocale = $('#msgLocale');
$('#saveLocale')?.addEventListener('click', async ()=>{
  msgLocale.textContent = '';
  try {
    await jput('/users/me/preferences', { locale: localeSel.value });
    msgLocale.textContent = 'Idioma actualizado.';
  } catch {
    msgLocale.textContent = 'No se pudo guardar. (Demo: cambiado localmente)';
    localStorage.setItem('rv_locale', localeSel.value);
  }
});

// ---- Wallets ----
const list = $('#walletsList');
const newWallet = $('#newWallet');
const msgWallet = $('#msgWallet');

function renderWalletItem(addr){
  const item = document.createElement('div');
  item.className = 'wallet-item';
  item.innerHTML = `
    <code>${addr}</code>
    <div class="actions">
      <button class="btn btn-sm" data-action="primary">Primaria</button>
      <button class="btn btn-sm danger" data-action="remove">Eliminar</button>
    </div>`;
  item.querySelector('[data-action="remove"]').addEventListener('click', async ()=>{
    try {
      await jdel(`/users/me/wallets/${addr}`);
      item.remove();
      msgWallet.textContent = 'Wallet eliminada.';
    } catch {
      item.remove();
      msgWallet.textContent = 'Eliminada (demo).';
      const demo = JSON.parse(localStorage.getItem('rv_wallets')||'[]').filter(w=>w!==addr);
      localStorage.setItem('rv_wallets', JSON.stringify(demo));
    }
  });
  item.querySelector('[data-action="primary"]').addEventListener('click', async ()=>{
    try {
      await jput('/users/me/wallets/primary', { address: addr });
      msgWallet.textContent = 'Marcada como primaria.';
    } catch {
      msgWallet.textContent = 'Marcada como primaria (demo).';
    }
  });
  return item;
}

async function loadWallets(){
  list.innerHTML = '';
  try {
    const w = await jget('/users/me/wallets');
    (w?.items || []).forEach(o=>{
      const el = renderWalletItem(o.address);
      if (o.primary) el.querySelector('code').style.fontWeight = '700';
      list.appendChild(el);
    });
  } catch {
    const demo = JSON.parse(localStorage.getItem('rv_wallets')||'["0x1111111111111111111111111111111111111111"]');
    demo.forEach(addr => list.appendChild(renderWalletItem(addr)));
  }
}
$('#addWalletBtn')?.addEventListener('click', async ()=>{
  msgWallet.textContent = '';
  const v = newWallet.value.trim();
  if (!/^0x[a-fA-F0-9]{40}$/.test(v)) { msgWallet.textContent = 'Wallet inválida.'; return; }
  try {
    await jpost('/users/me/wallets', { address: v });
    list.appendChild(renderWalletItem(v));
    newWallet.value = '';
    msgWallet.textContent = 'Wallet añadida.';
  } catch {
    const demo = new Set(JSON.parse(localStorage.getItem('rv_wallets')||'[]'));
    demo.add(v);
    localStorage.setItem('rv_wallets', JSON.stringify([...demo]));
    list.appendChild(renderWalletItem(v));
    newWallet.value = '';
    msgWallet.textContent = 'Wallet añadida (demo).';
  }
});

// ---- Notificaciones ----
const notifEmail = $('#notifEmail');
const notifPush  = $('#notifPush');
const msgNotif   = $('#msgNotif');

$('#saveNotif')?.addEventListener('click', async ()=>{
  msgNotif.textContent = '';
  try {
    await jput('/users/me/preferences', { notifications: { email: !!notifEmail.checked, push: !!notifPush.checked } });
    msgNotif.textContent = 'Notificaciones guardadas.';
  } catch {
    msgNotif.textContent = 'Guardadas (demo).';
  }
});

$('#btnEnablePush')?.addEventListener('click', async ()=>{
  try {
    const perm = await Notification.requestPermission();
    msgNotif.textContent = (perm === 'granted') ? 'Permiso concedido.' : 'Permiso denegado.';
  } catch {
    msgNotif.textContent = 'No se pudo solicitar permiso.';
  }
});

// ---- Privacidad ----
const prefPublic = $('#prefPublicProfile');
const prefHideW  = $('#prefHideWallet');
const msgPrivacy = $('#msgPrivacy');

$('#savePrivacy')?.addEventListener('click', async ()=>{
  msgPrivacy.textContent = '';
  try {
    await jput('/users/me/preferences', { privacy: { publicProfile: !!prefPublic.checked, hideWallet: !!prefHideW.checked } });
    msgPrivacy.textContent = 'Privacidad guardada.';
  } catch {
    msgPrivacy.textContent = 'Guardada (demo).';
  }
});

// ---- Carga inicial ----
async function loadPrefs(){
  try {
    const p = await jget('/users/me/preferences');
    if (p?.locale) localeSel.value = p.locale;
    if (p?.notifications){ notifEmail.checked = !!p.notifications.email; notifPush.checked = !!p.notifications.push; }
    if (p?.privacy){ prefPublic.checked = !!p.privacy.publicProfile; prefHideW.checked = !!p.privacy.hideWallet; }
  } catch {
    localeSel.value = localStorage.getItem('rv_locale') || 'es';
    notifEmail.checked = true;
    notifPush.checked = false;
    prefPublic.checked = true;
    prefHideW.checked = true;
  }
}

(async function init(){
  await loadPrefs();
  await loadWallets();
})();
