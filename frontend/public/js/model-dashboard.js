// /public/js/model-dashboard.js
import "./i18n.js";

const API_BASE = window.API_BASE || "/api";
const $ = (s, r = document) => r.querySelector(s);

const els = {
  name: $("#userName"),
  role: $("#dashUserRole"),
  tips: $("#kpiTips"),
  tipsTrend: $("#kpiTipsTrend"),
  subs: $("#kpiSubs"),
  subsTrend: $("#kpiSubsTrend"),
  bal: $("#kpiBalance"),
  msg: $("#dashMsg"),
  chipStatus: $("#chipStatus"),
  chipKey: $("#chipKey"),
  nextTime: $("#nextStreamTime"),
  lastVodCard: $("#lastVodCard"),
  lastVodMeta: $("#lastVodMeta"),
  btnViewVod: $("#btnViewVod"),
  btnGoLive: $("#btnGoLive"),
  btnConfigure: $("#btnConfigure"),
  btnShare: $("#btnShare"),
  btnWithdraw: $("#btnWithdraw"),
  btnRecharge: $("#btnRecharge"),
  canvasTips: $("#sparkTips"),
};

function setText(el, v) {
  if (el) {
    el.textContent = v;
    el.setAttribute("aria-label", v);
    el.classList.add("fade-in");
  }
}

async function jget(path) {
  const r = await fetch(`${API_BASE}${path}`, { credentials: "include" });
  const j = await r.json().catch(() => null);
  if (!r.ok) throw new Error(j?.error || "Error");
  return j;
}

function setStatus(isLive) {
  if (!els.chipStatus) return;
  els.chipStatus.textContent = isLive ? "• Live" : "• Offline";
  els.chipStatus.style.color = isLive ? "#0f0" : "inherit";
  els.chipStatus.setAttribute("aria-label", isLive ? "En vivo" : "Desconectada");
}

async function loadProfile() {
  try {
    const me = await jget("/users/profile");
    setText(els.name, me?.name || "—");
    setText(els.role, (me?.role || "model"));
  } catch {
    setText(els.name, "—");
  }
}

async function loadKPIs() {
  const cached = sessionStorage.getItem("kpis");
  if (cached) {
    try {
      renderKPIs(JSON.parse(cached));
      return;
    } catch {}
  }

  try {
    const data = await jget("/models/me/kpis");
    sessionStorage.setItem("kpis", JSON.stringify(data));
    renderKPIs(data);
  } catch {
    setText(els.tips, "0");
    setText(els.subs, "0");
    setText(els.bal, "0 ONECOP");
  }
}

function renderKPIs(data) {
  setText(els.tips, data?.tips24h?.toLocaleString?.() ?? "0");
  setText(els.tipsTrend, data?.tipsTrend ? `${data.tipsTrend > 0 ? "+" : ""}${data.tipsTrend}% vs ayer` : "—");
  setText(els.subs, data?.subs?.toLocaleString?.() ?? "0");
  setText(els.subsTrend, data?.subsTrend ? `${data.subsTrend > 0 ? "+" : ""}${data.subsTrend}% vs ayer` : "—");
  setText(els.bal, data?.balance != null ? `${data.balance} ONECOP` : "0 ONECOP");

  if (els.canvasTips && data?.sparkline) {
    drawSparkline(els.canvasTips, data.sparkline);
  }
}

function drawSparkline(canvas, values = []) {
  const ctx = canvas.getContext("2d");
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  const max = Math.max(...values, 1);
  ctx.beginPath();
  values.forEach((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - (v / max) * h;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = "#e91e63";
  ctx.lineWidth = 2;
  ctx.stroke();
}

async function loadStreaming() {
  try {
    const s = await jget("/models/me/stream");
    setStatus(!!s?.live);
    setText(els.nextTime, s?.nextAt ? new Date(s.nextAt).toLocaleString() : "—");
    setText(els.chipKey, s?.rtmpKey ? `RTMP: ${s.rtmpKey.slice(0, 6)}…` : "RTMP: —");

    if (s?.lastVod) {
      els.lastVodCard?.removeAttribute("hidden");
      setText(els.lastVodMeta, `${s.lastVod.title || "VOD"} • ${new Date(s.lastVod.date).toLocaleString()}`);
      els.btnViewVod?.setAttribute("href", `/client/vod.html?id=${encodeURIComponent(s.lastVod.id)}`);
    }
  } catch {
    setStatus(false);
  }
}

// Eventos botones
els.btnGoLive?.addEventListener("click", (e) => {
  e.preventDefault();
  alert("Pronto: asistente Go Live (RTMP/WebRTC).");
});
els.btnConfigure?.addEventListener("click", (e) => {
  e.preventDefault();
  location.href = "/settings.html#streaming";
});
els.btnShare?.addEventListener("click", (e) => {
  e.preventDefault();
  const url = `${location.origin}/live.html?handle=@miPerfil`;
  if (navigator.share) {
    navigator.share({ title: "Estoy en vivo en RedVelvetLive", text: "¡Ven a mi transmisión!", url });
  } else {
    navigator.clipboard.writeText(url);
    alert("Enlace copiado.");
  }
});
els.btnWithdraw?.addEventListener("click", (e) => {
  e.preventDefault();
  location.href = "/wallet.html#withdraw";
});
els.btnRecharge?.addEventListener("click", (e) => {
  e.preventDefault();
  location.href = "/wallet.html#recharge";
});

// Init
(async function init() {
  try {
    await loadProfile();
    await Promise.all([loadKPIs(), loadStreaming()]);
  } catch (err) {
    setText(els.msg, err.message || "No se pudo cargar el dashboard.");
  }
})();
