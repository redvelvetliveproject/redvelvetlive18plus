// /public/js/support.js
import { showToast } from "./index.js";

const API_BASE = window.API_BASE || "/api";
const $ = (s, r=document) => r.querySelector(s);
const form = $("#ticketForm");
const msg  = $("#formMsg");

async function getCsrf(){
  try {
    const r = await fetch(`${API_BASE}/csrf`, { credentials:"include" });
    const j = await r.json().catch(()=>null);
    return j?.csrfToken || null;
  } catch { return null; }
}

function validate(){
  const hp = $("#hp_url")?.value;
  if (hp) return "Error."; // honeypot

  const name = $("#name").value.trim();
  const email = $("#email").value.trim();
  const category = $("#category").value;
  const subject = $("#subject")?.value.trim();
  const message = $("#message").value.trim();

  if (!name || !email || !category || !subject || !message)
    return "Completa todos los campos obligatorios.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return "Correo inválido.";
  return null;
}

async function apiCreateTicket(payload){
  const csrf = await getCsrf();
  const r = await fetch(`${API_BASE}/support/tickets`, {
    method:"POST",
    headers:{ "Content-Type":"application/json", ...(csrf?{"x-csrf-token":csrf}:{}) },
    credentials:"include",
    body: JSON.stringify(payload)
  });
  if (!r.ok) throw new Error((await r.json().catch(()=>null))?.error || "Error");
  return r.json();
}

function mailtoFallback({name,email,category,subject,message}){
  const to = "soporte@redvelvetlive.com"; // cámbialo si es necesario
  const subj = encodeURIComponent(`[Soporte] ${category.toUpperCase()} – ${subject}`);
  const body = encodeURIComponent(
`Nombre: ${name}
Email: ${email}
Categoría: ${category}

Mensaje:
${message}

-- Enviado desde RedVelvetLive (fallback mailto)`
  );
  location.href = `mailto:${to}?subject=${subj}&body=${body}`;
}

form?.addEventListener("submit", async (e)=>{
  e.preventDefault();
  msg.textContent = "";
  msg.style.display = "none";

  const error = validate();
  if (error){
    msg.textContent = error;
    msg.style.display = "block";
    showToast(error, "warn");
    return;
  }

  const payload = {
    name: $("#name").value.trim(),
    email: $("#email").value.trim(),
    category: $("#category").value,
    subject: $("#subject")?.value.trim(),
    message: $("#message").value.trim()
  };

  try {
    const res = await apiCreateTicket(payload);
    if (res?.ok){
      msg.textContent = "✅ Tu ticket ha sido enviado. Te contactaremos por email.";
      msg.style.display = "block";
      msg.setAttribute("aria-live", "polite");
      showToast("Ticket enviado correctamente 🎉", "success");
      form.reset();
      return;
    }
    throw new Error("Respuesta no válida");
  } catch (err){
    console.warn("support ticket error, usando fallback mailto", err);
    msg.textContent = "Servidor no disponible. Abriendo tu cliente de correo…";
    msg.style.display = "block";
    msg.setAttribute("aria-live", "assertive");
    showToast("Servidor no disponible, abriendo correo 📧", "info");
    setTimeout(()=> mailtoFallback(payload), 500);
  }
});

document.querySelector('[data-cancel="support"]')?.addEventListener("click", ()=>{
  form.reset();
  msg.textContent = "";
  msg.style.display = "none";
  showToast("Formulario de soporte limpiado 🧹", "info");
});
