// /public/js/live.js
import "./i18n.js"; // solo inicializa traducciones, no exporta nada

const API_BASE = (typeof window !== 'undefined' && window.API_BASE) ? window.API_BASE : '/api';

const els = {
  search:  document.getElementById('searchInput'),
  country: document.getElementById('filterCountry'),
  status:  document.getElementById('filterStatus'),
  sort:    document.getElementById('sortBy'),
  grid:    document.getElementById('cardsGrid'),
  msg:     document.getElementById('liveMsg'),
  prev:    document.getElementById('prevPage'),
  next:    document.getElementById('nextPage'),
  pageInfo:document.getElementById('pageInfo'),
  apply:   document.getElementById('btnApply'),
  reset:   document.getElementById('btnReset'),
};

const state = {
  q: '', country: '', status: 'online', sort: 'viewersDesc',
  page: 1, pageSize: 12, total: 0
};

function getQS() {
  const u = new URL(location.href);
  return Object.fromEntries(u.searchParams.entries());
}
function setQS() {
  const u = new URL(location.href);
  u.searchParams.set('page', String(state.page));
  u.searchParams.set('pageSize', String(state.pageSize));
  for (const k of ['q','country','status','sort']) {
    if (state[k]) u.searchParams.set(k, state[k]);
    else u.searchParams.delete(k);
  }
  history.replaceState(null, '', u);
  sessionStorage.setItem('liveFilters', JSON.stringify(state)); // 🧠 Memoria
}

function readFiltersFromUI() {
  state.q       = (els.search?.value || '').trim();
  state.country = els.country?.value || '';
  state.status  = els.status?.value || 'online';
  state.sort    = els.sort?.value || 'viewersDesc';
  state.page = 1;
}
function applyQSIntoUI() {
  const saved = sessionStorage.getItem('liveFilters');
  const qs = getQS();
  const source = saved ? JSON.parse(saved) : qs;

  if (els.search)  els.search.value  = source.q || '';
  if (els.country) els.country.value = source.country || '';
  if (els.status)  els.status.value  = source.status ?? 'online';
  if (els.sort)    els.sort.value    = source.sort || 'viewersDesc';

  state.q       = (els.search?.value || '').trim();
  state.country = els.country?.value || '';
  state.status  = els.status?.value || 'online';
  state.sort    = els.sort?.value || 'viewersDesc';
  state.page    = Number(qs.page || 1)  || 1;
  state.pageSize= Number(qs.pageSize||12) || 12;
}

function resetFilters() {
  if (els.search)  els.search.value  = '';
  if (els.country) els.country.value = '';
  if (els.status)  els.status.value  = 'online';
  if (els.sort)    els.sort.value    = 'viewersDesc';
  readFiltersFromUI();
  sessionStorage.removeItem('liveFilters'); // limpiar memoria
  setQS();
  load();
}

function cardHtml(m) {
  const handleTxt = m.handle?.replace('@','') || 'modelo';
  const viewers   = Number.isFinite(+m.viewers) ? +m.viewers : 0;
  return `
  <article class="card">
    <a class="thumb overlay-edges" href="./client/live-stream.html?u=${encodeURIComponent(m.handle || '')}" aria-label="Abrir stream de ${handleTxt}">
      <span class="live-dot" aria-hidden="true">LIVE</span>
      <span class="viewers"  aria-label="Espectadores">${viewers}</span>
      ${m.country ? `<span class="tag-country" aria-label="País">${m.country}</span>` : ''}
      ${m.thumbUrl ? `<img src="${m.thumbUrl}" alt="Preview de ${handleTxt}" loading="lazy" decoding="async" style="width:100%;height:100%;object-fit:cover">` : ''}
    </a>
    <div class="card-body">
      <div class="model-row">
        <img src="${m.avatarUrl || './assets/avatars/avatar-1.jpg'}" alt="Avatar de ${handleTxt}" loading="lazy" decoding="async">
        <div>
          <div class="name">@${handleTxt}</div>
          <div class="handle muted">${m.title || ''}</div>
        </div>
      </div>
    </div>
  </article>`;
}

async function safeJson(r){ try { return await r.json(); } catch { return null; } }
async function api(path){
  const r = await fetch(`${API_BASE}${path}`, { credentials:'include' });
  if (!r.ok) throw 0;
  return safeJson(r);
}

async function load() {
  if (!els.grid) return;
  if (els.msg) els.msg.textContent = '';
  els.grid.setAttribute('aria-busy','true');
  els.grid.classList.add('loading'); // 🎨 opcional para mostrar spinner con CSS

  try {
    const qs = new URLSearchParams({
      q: state.q, country: state.country, status: state.status,
      sort: state.sort, page: String(state.page), pageSize: String(state.pageSize)
    }).toString();

    let data;
    try {
      data = await api(`/models/live?${qs}`);
    } catch {
      // Fallback demo
      data = {
        ok: true,
        total: 48,
        page: state.page,
        pageSize: state.pageSize,
        items: Array.from({length: state.pageSize}).map((_, i) => ({
          handle: ['@Nadia','@Valeria','@Luna','@Mia'][i%4],
          title:  ['Q&A nocturno','Charlando','Sesión chill','DJ set'][i%4],
          country:['CO','MX','AR','ES'][i%4],
          viewers:[2130,1420,970,850][i%4] - (state.page-1)*20 + i,
          thumbUrl: '',
          avatarUrl: `./assets/avatars/avatar-${(i%3)+1}.jpg`
        }))
      };
    }

    state.total = Number(data?.total || 0);
    const items = data?.items || [];

    els.grid.innerHTML = items.length
      ? items.map(cardHtml).join('')
      : `<p class="muted" style="grid-column:1/-1">Sin resultados</p>`;

    const totalPages = Math.max(1, Math.ceil(state.total / state.pageSize));
    if (els.pageInfo) els.pageInfo.textContent = `Página ${state.page} / ${totalPages}`;
    if (els.prev) els.prev.disabled = state.page <= 1;
    if (els.next) els.next.disabled = state.page >= totalPages;

  } catch {
    if (els.msg) els.msg.textContent = 'No se pudo cargar la lista.';
  } finally {
    els.grid.removeAttribute('aria-busy');
    els.grid.classList.remove('loading');
  }
}

// Eventos
els.apply?.addEventListener('click', () => { readFiltersFromUI(); setQS(); load(); });
els.reset?.addEventListener('click', resetFilters);
els.prev?.addEventListener('click', () => { if (state.page > 1) { state.page--; setQS(); load(); }});
els.next?.addEventListener('click', () => { state.page++; setQS(); load(); });

// Inicial
applyQSIntoUI();
setQS();
load();
