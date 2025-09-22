// public/js/dashboard.js
// Versión final con api.js integrado: métricas de modelo/admin, caché y accesibilidad.

import api, { profile } from "./api.js";
import { showToast } from "./toast.js";

const $  = (s, r=document)=>r.querySelector(s);
const nf = new Intl.NumberFormat("es-CO",{maximumFractionDigits:0});
const cf = new Intl.NumberFormat("es-CO",{style:"currency",currency:"USD",maximumFractionDigits:2});
const safeInt = (v,d=0)=>Number.isFinite(+v)?+v:d;

// ---------- Helpers de caché ----------
function saveCache(key, data) {
  try { sessionStorage.setItem(key, JSON.stringify(data)); } catch {}
}
function loadCache(key) {
  try {
    const val = sessionStorage.getItem(key);
    return val ? JSON.parse(val) : null;
  } catch { return null; }
}

// ---------- Fetch ----------
async function fetchModelStats(){
  const cached = loadCache("modelStats");
  if (cached) return cached;
  try {
    const d = await api.http.get("/models/me/stats");
    const stats = {
      tipsToday:   safeInt(d?.tipsToday,0),
      tipsWeek:    safeInt(d?.tipsWeek,0),
      earningsUSD: Number.isFinite(+d?.earningsUSD)?+d.earningsUSD:0,
      rank:        safeInt(d?.rank,0),
      viewersNow:  safeInt(d?.viewersNow,0),
      tipsTrend:   d?.tipsTrend || [2,4,6,5,7,9]
    };
    saveCache("modelStats", stats);
    return stats;
  } catch (err) {
    console.warn("[dashboard.js] usando fallback en fetchModelStats", err);
    showToast("No se pudo cargar stats en vivo, mostrando demo 📊", "warn");
    return { tipsToday:320, tipsWeek:1820, earningsUSD:540.75, rank:12, viewersNow:84, tipsTrend:[2,4,6,5,7,9] };
  }
}

// ---------- Gráficos ----------
function drawSpark(data) {
  const c = $("#modelSpark");
  if (!c || !data.length) return;
  const dpr = window.devicePixelRatio || 1;
  const cssW = c.clientWidth || 240;
  const cssH = c.clientHeight || 40;
  c.width  = Math.max(120, Math.round(cssW * dpr));
  c.height = Math.max(24,  Math.round(cssH * dpr));
  const ctx = c.getContext("2d");
  ctx.scale(dpr, dpr);
  ctx.clearRect(0,0,cssW,cssH);
  const max = Math.max(...data, 1);
  const step = cssW / Math.max(1, (data.length - 1));
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#ff4081";
  ctx.beginPath();
  data.forEach((v,i)=>{
    const x = i*step;
    const y = cssH - (v/max)*cssH;
    i ? ctx.lineTo(x,y) : ctx.moveTo(x,y);
  });
  ctx.stroke();
}

function drawPie(percent) {
  const pie = $("#adminPie");
  if (!pie) return;
  const ctx = pie.getContext("2d");
  pie.width = 100; pie.height = 100;
  ctx.clearRect(0, 0, 100, 100);
  const angle = (percent / 100) * 2 * Math.PI;
  ctx.fillStyle = "#2196f3";
  ctx.beginPath();
  ctx.moveTo(50, 50);
  ctx.arc(50, 50, 45, -0.5 * Math.PI, angle - 0.5 * Math.PI);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#ccc";
  ctx.beginPath();
  ctx.moveTo(50, 50);
  ctx.arc(50, 50, 45, angle - 0.5 * Math.PI, 1.5 * Math.PI);
  ctx.closePath();
  ctx.fill();
}

// ---------- Render ----------
function skeletonCards(count = 3) {
  return "<div class='cards-grid summary'>" +
    Array.from({length:count}).map(() => `
    <article class="card kpi" aria-busy="true">
      <div class="card-body">
        <div class="kpi-title shimmer">&nbsp;</div>
        <div class="kpi-value shimmer">&nbsp;</div>
      </div>
    </article>`).join("") + "</div>";
}

function renderModelDashboard(stats) {
  const wrap = $("#summaryCards");
  wrap.innerHTML = `
    <div class="cards-grid summary" role="region" aria-label="Métricas de modelo">
      <article class="card kpi"><div class="card-body"><div class="kpi-title">Propinas hoy</div><div class="kpi-value">${nf.format(stats.tipsToday)} ONECOP</div></div></article>
      <article class="card kpi"><div class="card-body"><div class="kpi-title">Propinas semana</div><div class="kpi-value">${nf.format(stats.tipsWeek)} ONECOP</div></div></article>
      <article class="card kpi"><div class="card-body"><div class="kpi-title">USD estimado</div><div class="kpi-value">${cf.format(stats.earningsUSD)}</div></div></article>
      <article class="card kpi"><div class="card-body"><div class="kpi-title">Ranking</div><div class="kpi-value">#${stats.rank}</div></div></article>
    </div>
    <canvas id="modelSpark" aria-label="Gráfico de propinas" role="img"></canvas>
  `;
  drawSpark(stats.tipsTrend);
}

function renderAdminPie() {
  const pieWrap = $("#roleContent");
  pieWrap.innerHTML = `
    <section class="panel">
      <h2>Modelos online</h2>
      <canvas id="adminPie" aria-label="Porcentaje modelos online" role="img"></canvas>
    </section>
  `;
  const randomOnline = Math.floor(Math.random()*100)+10;
  const total = 200;
  drawPie((randomOnline/total)*100);
}

// ---------- Init ----------
(async function start(){
  const user = await profile().catch(()=>null);
  const role = (user?.role || "client").toLowerCase();
  $("#dashUserName")?.textContent = user?.name || "Usuario";
  $("#dashUserRole")?.textContent = role;

  $("#summaryCards").innerHTML = skeletonCards();

  if(role==="model"){
    const stats = await fetchModelStats();
    renderModelDashboard(stats);
  } else if(role==="admin"){
    renderAdminPie();
  }
})();
