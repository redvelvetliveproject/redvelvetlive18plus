import api from "./api.js";
import { showToast } from "./toast.js";

const EMAILS = {
  support: "soporte@redvelvetlive.com",
  abuse:   "abuse@redvelvetlive.com",
  dmca:    "dmca@redvelvetlive.com",
  legal:   "legal@redvelvetlive.com",
};

// Rellenar mails visibles si existen esos IDs
(function setMailLinks() {
  ([
    ["mailSupport","support"],
    ["mailAbuse","abuse"],
    ["mailDmca","dmca"],
    ["mailLegal","legal"]
  ]).forEach(([id, key]) => {
    const a = document.getElementById(id);
    if (a) {
      a.href = `mailto:${EMAILS[key]}`;
      a.textContent = EMAILS[key];
    }
  });
})();

const form = document.getElementById("contactForm");
const msg  = document.getElementById("contactMsg");

if (msg) {
  msg.setAttribute("aria-live", "polite");
  msg.setAttribute("role", "status");
}

function t(key, fallback){
  return window?.i18n?.t?.(key) || fallback;
}

function isEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function mailtoFallback({name,email,type,message}){
  const to = EMAILS[type] || EMAILS.support;
  const subject = encodeURIComponent(`[Contacto] ${type.toUpperCase()} – ${name}`);
  const body = encodeURIComponent(
`Nombre: ${name}
Email: ${email}
Categoría: ${type}

Mensaje:
${message}

-- Enviado desde RedVelvetLive (fallback mailto)`
  );
  location.href = `mailto:${to}?subject=${subject}&body=${body}`;
}

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.textContent = "";
  msg.style.display = "none";

  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn && (submitBtn.disabled = true);

  const data = {
    name:    form.name?.value.trim()  || "",
    email:   form.email?.value.trim() || "",
    type:    form.type?.value || "support",
    message: form.message?.value.trim() || ""
  };

  if (!data.name || !isEmail(data.email) || !data.message) {
    msg.textContent = t("form_error_fields", "Completa nombre, correo válido y mensaje.");
    msg.style.display = "block";
    showToast("Completa todos los campos obligatorios ⚠️", "warn");
    submitBtn && (submitBtn.disabled = false);
    return;
  }

  // Honeypot
  if (form.hp?.value) {
    showToast("Detección anti-spam ⚠️", "warn");
    submitBtn && (submitBtn.disabled = false);
    return;
  }

  try {
    const res = await api.http.post("/support/contact", data);
    if (res?.ok) {
      msg.textContent = t("form_msg_sent", "✅ ¡Mensaje enviado! Te responderemos pronto.");
      msg.style.display = "block";
      msg.setAttribute("aria-live","polite");
      showToast("Mensaje enviado correctamente 📩", "success");
      form.reset();
      return;
    }
    throw new Error("Respuesta inválida");
  } catch (err) {
    console.warn("[contact.js] error, usando fallback", err);
    msg.textContent = t("form_msg_fallback", "Servidor no disponible. Abriendo cliente de correo…");
    msg.style.display = "block";
    msg.setAttribute("aria-live","assertive");
    showToast("Servidor no disponible, abriendo correo 📧", "info");
    setTimeout(()=> mailtoFallback(data), 600);
  } finally {
    submitBtn && (submitBtn.disabled = false);
  }
});
