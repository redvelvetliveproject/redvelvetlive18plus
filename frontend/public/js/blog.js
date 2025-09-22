import { initI18n } from '/js/i18n.js';
initI18n();

// Permitir tanto blogGrid como blogList (compat)
const grid =
  document.getElementById('blogGrid') ||
  document.getElementById('blogList') ||
  document.querySelector('.grid');

const search   = document.getElementById('blogSearch');
const category = document.getElementById('blogCategory');
const sort     = document.getElementById('blogSort');
const prevBtn  = document.getElementById('blogPrev');
const nextBtn  = document.getElementById('blogNext');
const pageLbl  = document.getElementById('blogPage');

let allPosts = [];  // {title, url, date, tags:[], excerpt?}
let page = 1;
const pageSize = 9;

function render() {
  if (!grid) return;

  const q   = (search?.value || '').toLowerCase().trim();
  const cat = (category?.value || '').toLowerCase().trim();

  let data = allPosts.slice();

  if (q)   data = data.filter(p => (p.title + ' ' + (p.excerpt||'')).toLowerCase().includes(q));
  if (cat) data = data.filter(p => (p.tags||[]).some(t => (t || '').toLowerCase().includes(cat)));

  if (sort?.value === 'popular') {
    data = data.slice().reverse();  // demo sin métrica real
  } else {
    data.sort((a,b)=> (b.date||'').localeCompare(a.date||'')); // más recientes primero
  }

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  page = Math.min(page, totalPages);
  const slice = data.slice((page-1)*pageSize, page*pageSize);

  grid.innerHTML = '';
  for (const p of slice) {
    const card = document.createElement('article');
    card.className = 'list-card';
    card.innerHTML = `
      <a class="thumb" href="${p.url}">
        <img src="${p.thumb || '/assets/posts/post-1.jpg'}" alt="">
      </a>
      <div class="body">
        <div class="kicker">${(p.tags||[]).join(' · ') || 'Blog'}</div>
        <div class="title">${p.title}</div>
        <div class="muted">${p.date || ''}</div>
      </div>`;
    grid.appendChild(card);
  }

  if (pageLbl) pageLbl.textContent = String(page);
  if (prevBtn) prevBtn.disabled = page <= 1;
  if (nextBtn) nextBtn.disabled = page >= totalPages;
}

async function loadFromSitemap() {
  try {
    const res = await fetch('/sitemap-posts.xml', { headers: {'Accept':'application/xml'} });
    if (!res.ok) throw new Error('sitemap missing');
    const xml = new DOMParser().parseFromString(await res.text(), 'application/xml');
    const urls = [...xml.querySelectorAll('urlset > url')];

    allPosts = urls.map(u => {
      const loc = u.querySelector('loc')?.textContent?.trim() || '#';
      const lastmod = u.querySelector('lastmod')?.textContent?.slice(0,10) || '';
      const slug = decodeURIComponent((loc.split('/').pop() || '').replace(/\.html$/,''));
      const title = slug.replace(/[-_]/g,' ').replace(/\b\w/g, m=>m.toUpperCase());
      const tags = [
        /web3|wallet|usdt|crypto/i.test(slug) && 'Web3',
        /seguridad|privacy|opsec|protecci/i.test(slug) && 'Seguridad',
        /crecimiento|marketing|comunidad|tips/i.test(slug) && 'Crecimiento',
        /plataforma|redvelvetlive|novedad|actualiz/i.test(slug) && 'Plataforma'
      ].filter(Boolean);
      return { title, url: loc, date: lastmod, tags };
    });

    if (!allPosts.length) throw new Error('empty');
  } catch {
    // fallback demo
    allPosts = [
      { title:'RedVelvetLive: visión y hoja de ruta', url:'/posts/introduccion-redvelvetlive.html', date:'2025-08-16', tags:['Plataforma','Web3'] },
      { title:'Principiante tímido: monetiza con voz', url:'/posts/guia-principiante-timido.html', date:'2025-08-10', tags:['Crecimiento'] },
      { title:'Seguridad operacional para modelos', url:'/posts/seguridad-operacional-modelos.html', date:'2025-08-02', tags:['Seguridad'] }
    ];
  }

  render();
}

// Eventos
[search, category, sort].forEach(el => el?.addEventListener('input', () => { page = 1; render(); }));
prevBtn?.addEventListener('click', () => { page = Math.max(1, page-1); render(); });
nextBtn?.addEventListener('click', () => { page += 1; render(); });

// Init
loadFromSitemap();
