// /public/js/ranking.js
// Grid de ranking con búsqueda, filtros, orden y paginación.

(() => {
  const API_BASE = (typeof window !== "undefined" && window.API_BASE) ? window.API_BASE : "/api";

  const PAGE_SIZE = 8;
  let currentPage = 1;
  let currentData = [];
  let filtered = [];

  // ---- helpers DOM ----
  const $ = (sel, root = document) => root.querySelector(sel);
  const grid = $('#rankGrid');
  const pager = $('#rankPager');
  const inpSearch = $('#rankSearch');
  const selCountry = $('#rankCountry');
  const selSort = $('#rankSort');
  const chkOnline = $('#rankOnlyOnline');

  // ---- API real ----
  async function fetchFromAPI() {
    const url = `${API_BASE}/models/ranking?limit=100`;
    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json(); // array de { id, name, country, tips, popularity, online, avatar }
  }

  // ---- Fallback mock ----
  function fetchMock() {
    const countries = ['CO', 'MX', 'AR', 'US', 'ES'];
    const names = ['Valentina','Camila','Sofía','Isabella','Mariana','Antonella','Emilia','Victoria',
                   'Renata','Salomé','Emma','Martina','Catalina','Gabriela','Paula','Sara'];
    return Array.from({ length: 40 }).map((_, i) => {
      const name = names[i % names.length];
      const country = countries[i % countries.length];
      const tips = Math.floor(Math.random() * 5000) + 250;
      const popularity = Math.floor(Math.random() * 1000) + 50;
      const online = Math.random() > 0.5;
      return {
        id: `m-${i + 1}`,
        name: `${name} ${i + 1}`,
        country,
        tips,
        popularity,
        online,
        avatar: `https://i.pravatar.cc/300?img=${(i % 70) + 1}`,
      };
    });
  }

  // ---- UI helpers ----
  function fmt(n) { return typeof n === "number" ? n.toLocaleString("es-CO") : (n ?? "—"); }

  function renderSkeleton(count = PAGE_SIZE) {
    if (!grid) return;
    grid.innerHTML = `
      <div class="cards-grid ranking">
        ${Array.from({ length: count }).map(() => `
          <article class="card sk">
            <div class="thumb sk-box"></div>
            <div class="card-body">
              <div class="card-title sk-line" style="width:60%"></div>
              <div class="meta sk-line" style="width:40%"></div>
              <div class="meta sk-line" style="width:50%"></div>
            </div>
          </article>
        `).join('')}
      </div>
    `;
  }

  function renderEmpty(msg = 'No hay resultados.') {
    if (!grid) return;
    grid.innerHTML = `<p class="muted" role="status">${msg}</p>`;
    if (pager) pager.innerHTML = '';
  }

  function renderPage(page = 1) {
    if (!grid) return;
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    currentPage = Math.min(Math.max(1, page), totalPages);
    const start = (currentPage - 1) * PAGE_SIZE;
    const slice = filtered.slice(start, start + PAGE_SIZE);

    if (!slice.length) {
      renderEmpty('No hay resultados con los filtros actuales.');
      return;
    }

    grid.innerHTML = `
      <div class="cards-grid ranking" aria-live="polite">
        ${slice.map(it => `
          <article class="card">
            <div class="thumb" style="background-image:url('${it.avatar || ''}')" aria-label="${it.name}"></div>
            <div class="card-body">
              <div class="card-title">${escapeHtml(it.name)}</div>
              <div class="meta">País: ${escapeHtml(it.country || '—')} ${it.online ? '• <span class="badge online">Online</span>' : ''}</div>
              <div class="meta">Tips: ${fmt(it.tips)} • Popularidad: ${fmt(it.popularity)}</div>
              <div class="actions">
                <a class="btn" href="./model.html?id=${encodeURIComponent(it.id)}">Ver perfil</a>
              </div>
            </div>
          </article>
        `).join('')}
      </div>
    `;

    if (pager) {
      pager.innerHTML = `
        <nav class="pager" aria-label="Paginación">
          <button class="btn" data-page="prev" ${currentPage===1?'disabled':''}>&laquo;</button>
          <span> Página ${currentPage} / ${totalPages} </span>
          <button class="btn" data-page="next" ${currentPage===totalPages?'disabled':''}>&raquo;</button>
        </nav>
      `;
      pager.querySelector('[data-page="prev"]')?.addEventListener('click', () => renderPage(currentPage - 1));
      pager.querySelector('[data-page="next"]')?.addEventListener('click', () => renderPage(currentPage + 1));
    }
  }

  // ---- filtros / orden ----
  function applyFilters() {
    const q = (inpSearch?.value || '').trim().toLowerCase();
    const ctry = (selCountry?.value || '').trim().toUpperCase();
    const onlyOn = !!chkOnline?.checked;

    filtered = currentData.filter(m => {
      if (q && !(`${m.name}`.toLowerCase().includes(q))) return false;
      if (ctry && (String(m.country || '').toUpperCase() !== ctry)) return false;
      if (onlyOn && !m.online) return false;
      return true;
    });

    const sort = (selSort?.value || 'tips').toLowerCase();
    filtered.sort((a, b) => {
      if (sort === 'tips') return (b.tips || 0) - (a.tips || 0);
      if (sort === 'popularity') return (b.popularity || 0) - (a.popularity || 0);
      if (sort === 'name') return String(a.name || '').localeCompare(String(b.name || ''));
      return 0;
    });

    renderPage(1);
  }

  function debounce(fn, ms = 250) {
    let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
  }

  function escapeHtml(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => (
      { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]
    ));
  }

  // ---- init ----
  document.addEventListener('DOMContentLoaded', async () => {
    renderSkeleton();
    try {
      const data = await fetchFromAPI();
      currentData = Array.isArray(data) ? data : [];
    } catch {
      currentData = fetchMock();
    }

    if (!currentData.length) {
      renderEmpty('No hay datos para mostrar.');
      return;
    }

    inpSearch?.addEventListener('input', debounce(applyFilters, 250));
    selCountry?.addEventListener('change', applyFilters);
    selSort?.addEventListener('change', applyFilters);
    chkOnline?.addEventListener('change', applyFilters);

    applyFilters();
  });
})();
