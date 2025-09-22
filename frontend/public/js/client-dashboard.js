import api from "./api.js";

const fmt = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 2 });

function qs(id){ return document.getElementById(id); }

function renderKPIs(sum) {
  const panel = qs('kpisPanel');
  if (panel) panel.setAttribute('role', 'region');
  qs('kpiTips')     && (qs('kpiTips').textContent     = fmt.format(sum.tipsSent30d || 0));
  qs('kpiFollowing')&& (qs('kpiFollowing').textContent= fmt.format(sum.following   || 0));
  qs('kpiBalance')  && (qs('kpiBalance').textContent  = fmt.format(sum.balanceOnecop || 0));
  drawSparkAnimated(sum.tipsTrend || []);
}

function drawSparkAnimated(data){
  const c = qs('tipsSpark');
  if (!c || !data.length) return;

  const dpr = window.devicePixelRatio || 1;
  const cssW = c.clientWidth  || 240;
  const cssH = c.clientHeight || 36;
  c.width  = Math.max(120, Math.round(cssW * dpr));
  c.height = Math.max(24,  Math.round(cssH * dpr));

  const ctx = c.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, cssW, cssH);
  ctx.lineWidth = 2;
  ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--text')?.trim() || '#000';

  const max = Math.max(...data, 1);
  const step = cssW / Math.max(1, (data.length - 1));

  let progress = 0;
  const totalFrames = 30;

  function animate() {
    ctx.clearRect(0, 0, cssW, cssH);
    ctx.beginPath();
    const n = Math.floor(progress * data.length);
    for (let i = 0; i < n; i++) {
      const x = i * step;
      const y = cssH - (data[i] / max) * cssH;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
    progress += 1 / totalFrames;
    if (progress < 1) requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}

function renderFollowing(sum) {
  const panel = qs('followingPanel');
  const grid  = qs('followingGrid');
  if (!panel || !grid) return;
  panel.setAttribute('role', 'region');
  panel.setAttribute('aria-label', 'Modelos seguidas');

  const list = sum.followingSamples || [];
  if (!list.length) { panel.hidden = true; return; }
  panel.hidden = false;

  grid.innerHTML = list.map(m =>
    `<a class="chip" href="/live.html?handle=${encodeURIComponent(m.handle)}" aria-label="Ir al perfil de ${m.handle}">
      <img src="${m.avatar}" alt="${m.handle}" loading="lazy" /> <span>${m.handle}</span>
    </a>`
  ).join('');
}

function renderActivity(res) {
  const panel = qs('activityPanel');
  const tbody = document.querySelector('#tblActivity tbody');
  if (panel) panel.setAttribute('role', 'region');
  if (!tbody) return;

  const items = res.items || [];
  if (!items.length) {
    tbody.innerHTML = `<tr><td colspan="3" class="muted">No hay actividad reciente.</td></tr>`;
    return;
  }

  const df = new Intl.DateTimeFormat('es-CO', { dateStyle:'medium', timeStyle:'short' });
  tbody.innerHTML = '';
  for (const it of items) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${df.format(new Date(it.date))}</td><td>${it.action}</td><td>${it.detail||''}</td>`;
    tbody.appendChild(tr);
  }
}

// ---------- Init ----------
(async function start(){
  try {
    const sum = await api.http.get("/client/summary");
    const act = await api.http.get("/client/activity?limit=20");

    sum && (renderKPIs(sum), renderFollowing(sum));
    act && renderActivity(act);

    // Redibujar sparkline al redimensionar
    let t;
    window.addEventListener('resize', () => {
      clearTimeout(t);
      t = setTimeout(() => drawSparkAnimated(sum?.tipsTrend || []), 100);
    });
  } catch (err) {
    console.warn("[client-dashboard] Error API, usando fallback", err);
  }
})();
