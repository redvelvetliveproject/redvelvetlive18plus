// /js/notifications.js
import { initI18n } from './i18n.js';
initI18n();

const API_BASE = window.API_BASE || '/api';
const $ = (s) => document.querySelector(s);

const notifForm = $('#notifForm');
const chkEmail  = $('#notifEmail');
const chkPush   = $('#notifPush');
const notifMsg  = $('#notifMsg');

const btnEnable = $('#btnEnablePush');
const btnDisable= $('#btnDisablePush');
const pushMsg   = $('#pushMsg');

// Helpers
async function jget(p){ const r = await fetch(`${API_BASE}${p}`, {credentials:'include'}); const j = await r.json().catch(()=>null); if(!r.ok) throw new Error(j?.error||'Error'); return j;}
async function jput(p,body){ const r= await fetch(`${API_BASE}${p}`,{method:'PUT', headers:{'Content-Type':'application/json'}, credentials:'include', body:JSON.stringify(body)}); const j=await r.json().catch(()=>null); if(!r.ok) throw new Error(j?.error||'Error'); return j;}

// Cargar preferencias
async function loadPrefs(){
  try {
    const me = await jget('/users/me/preferences');
    chkEmail.checked = !!me?.notifications?.email;
    chkPush.checked  = !!me?.notifications?.push;
  } catch {
    // valores por defecto
  }
}

// Guardar preferencias
notifForm?.addEventListener('submit', async (e)=>{
  e.preventDefault();
  notifMsg.textContent = '';
  try {
    await jput('/users/me/preferences', {
      notifications: { email: chkEmail.checked, push: chkPush.checked }
    });
    notifMsg.textContent = 'Preferencias guardadas.';
  } catch (err) {
    notifMsg.textContent = err.message || 'No se pudieron guardar los cambios.';
  }
});

// Web Push (basado en permisos del navegador; integra tu SW y VAPID si usas FCM/WebPush)
btnEnable?.addEventListener('click', async ()=>{
  pushMsg.textContent = '';
  try {
    if (!('Notification' in window)) throw new Error('Este navegador no soporta Notificaciones.');
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') throw new Error('Permiso denegado.');
    // Aquí registrarías service worker y suscripción (PushManager)
    // const reg = await navigator.serviceWorker.register('/sw.js');
    // const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: VAPID_PUBLIC_KEY });
    // await jput('/notifications/push/subscribe', sub);
    pushMsg.textContent = 'Permiso concedido. (Suscripción se configurará cuando integres el Service Worker).';
    chkPush.checked = true;
  } catch (err) {
    pushMsg.textContent = err.message || 'No fue posible habilitar push.';
  }
});

btnDisable?.addEventListener('click', async ()=>{
  pushMsg.textContent = '';
  try {
    // Si usas PushManager, aquí anulas suscripción y avisas al backend
    // await jput('/notifications/push/unsubscribe', {});
    pushMsg.textContent = 'Push deshabilitado en este dispositivo.';
    chkPush.checked = false;
  } catch (err) {
    pushMsg.textContent = err.message || 'No fue posible deshabilitar push.';
  }
});

// Init
loadPrefs();
