// /public/js/profile.js
// Rellena el perfil desde /api/users/profile y /users/me/preferences
// ✅ Incluye balance, privacidad, notificaciones y fallback demo

const API_BASE = window.API_BASE || "/api";
const $ = (s, r=document) => r.querySelector(s);

const els = {
  avatar: $('#userAvatar'),
  name:   $('#userName'),
  role:   $('#userRole'),
  email:  $('#userEmail'),
  locale: $('#userLocale'),
  wallet: $('#userWallet'),
  balance:$('#userBalance'),
  notifSummary: $('#notifSummary'),
  msg:    $('#profileMsg'),
  prefPublic: $('#prefPublicProfile'),
  prefHideWallet: $('#prefHideWallet'),
  btnSave: $('#btnSavePrefs'),
  btnDisconnectWallet: $('#btnDisconnectWallet')
};

async function jget(p){
  const r = await fetch(`${API_BASE}${p}`, { credentials:'include' });
  const j = await r.json().catch(()=>null);
  if (!r.ok) throw new Error(j?.error || 'Error');
  return j;
}
async function jput(p,body){
  const r = await fetch(`${API_BASE}${p}`, {
    method:'PUT', headers:{'Content-Type':'application/json'},
    credentials:'include', body: JSON.stringify(body)
  });
  const j = await r.json().catch(()=>null);
  if (!r.ok) throw new Error(j?.error || 'Error');
  return j;
}

function setText(el, v){ if (el) el.textContent = v; }

async function loadProfile(){
  try {
    const u = await jget('/users/profile');
    setText(els.name, u?.name || 'Usuario');
    setText(els.role, u?.role || 'client');
    setText(els.email, u?.email || '—');
    setText(els.locale, u?.locale || 'es');
    setText(els.wallet, u?.wallet || '—');
    if (u?.avatarUrl) els.avatar.src = u.avatarUrl;
  } catch {
    setText(els.name, 'Demo User');
    setText(els.role, 'client');
    setText(els.email, 'demo@example.com');
    setText(els.locale, 'es');
    setText(els.wallet, '—');
  }
}

async function loadBalance(){
  try {
    const b = await jget('/wallet/me/balance');
    setText(els.balance, (b?.balance != null) ? `${b.balance} ${b?.currency || 'ONECOP'}` : '0 ONECOP');
  } catch {
    setText(els.balance, '0 ONECOP');
  }
}

async function loadPrefs(){
  try {
    const p = await jget('/users/me/preferences');
    els.prefPublic.checked = !!p?.privacy?.publicProfile;
    els.prefHideWallet.checked = !!p?.privacy?.hideWallet;
    const notif = p?.notifications || {};
    const parts = [];
    if (notif.email) parts.push('Email');
    if (notif.push)  parts.push('Push');
    setText(els.notifSummary, parts.length ? `Activas: ${parts.join(', ')}` : 'Sin notificaciones activas');
  } catch {
    els.prefPublic.checked = true;
    els.prefHideWallet.checked = true;
    setText(els.notifSummary, 'Activas: Email');
  }
}

els.btnSave?.addEventListener('click', async ()=>{
  els.msg.textContent = '';
  try {
    await jput('/users/me/preferences', {
      privacy: {
        publicProfile: !!els.prefPublic.checked,
        hideWallet: !!els.prefHideWallet.checked
      }
    });
    els.msg.textContent = 'Preferencias guardadas.';
  } catch(e){
    els.msg.textContent = e.message || 'No se pudieron guardar las preferencias.';
  }
});

els.btnDisconnectWallet?.addEventListener('click', async ()=>{
  try {
    location.href = '/wallet.html#disconnect';
  } catch {}
});

(async function init(){
  await Promise.all([loadProfile(), loadBalance(), loadPrefs()]);
})();
