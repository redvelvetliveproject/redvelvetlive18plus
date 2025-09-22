// public/js/home.js
// Portada: reveal on scroll, Top Models y últimos artículos

(function () {
  const API_BASE = (typeof window !== "undefined" && window.API_BASE) || "/api";

  // ---- Animación "reveal" al hacer scroll ----
  try {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      }
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.1 });

    document.querySelectorAll(".fade-in").forEach(el => io.observe(el));
  } catch (_) { /* Safari muy viejo */ }

  // ---- Top Models ----
  async function loadTopModels() {
    const wrap = document.getElementById("topModelsChips");
    if (!wrap) return;

    try {
      const u = new URL(`${API_BASE}/models/live`, location.origin);
      u.searchParams.set("status", "live");
      u.searchParams.set("pageSize", "8");

      const res = await fetch(u.toString(), { credentials: "include" });
      if (!res.ok) throw 0;
      const json = await res.json();
      if (!json?.ok || !Array.isArray(json.items)) throw 0;

      renderChips(wrap, json.items);
    } catch {
      // Fallback
      renderChips(wrap, [
        { handle:"@Nadia",   title:"Q&A nocturno",   avatarUrl:"/assets/avatars/laura.jpg"   },
        { handle:"@Carmen",  title:"Sesión acústica",avatarUrl:"/assets/avatars/carmen.jpg"  },
        { handle:"@Valeria", title:"Charlamos",      avatarUrl:"/assets/avatars/valeria.jpg" },
        { handle:"@Aitana",  title:"Fitness live",   avatarUrl:"/assets/avatars/valeria.jpg" },
      ]);
    }
  }

  function renderChips(wrap, items) {
    wrap.innerHTML = "";
    for (const it of items.slice(0, 7)) {
      const a = document.createElement("a");
      a.className = "chip";
      a.href = `/live.html?handle=${encodeURIComponent(it.handle || "")}`;
      a.title = `${it.handle || ""} — ${it.title || ""}`;
      a.innerHTML = `
        <img src="${it.avatarUrl || "/assets/avatars/placeholder.jpg"}"
             alt="${(it.handle||"").replace("@","")}" loading="lazy" decoding="async">
        <span>${(it.handle||"").replace("@","")}</span>`;
      wrap.appendChild(a);
    }
    const more = document.createElement("a");
    more.className = "chip";
    more.href = "/live.html";
    more.textContent = "Ver más";
    wrap.appendChild(more);
  }

  // ---- Últimos artículos ----
  async function loadBlogCards() {
    const grid = document.getElementById("homeBlogList");
    if (!grid) return;

    try {
      const res = await fetch("/sitemap-posts.xml", { headers: { "Accept": "application/xml" } });
      if (!res.ok) throw 0;
      const xml = new DOMParser().parseFromString(await res.text(), "application/xml");
      const urls = [...xml.querySelectorAll("urlset url")].slice(0, 6).map(u => ({
        loc: u.querySelector("loc")?.textContent?.trim(),
        lastmod: u.querySelector("lastmod")?.textContent?.trim()
      }));
      if (!urls.length) throw 0;

      grid.innerHTML = "";
      for (const u of urls.slice(0, 3)) {
        const title = decodeURIComponent((u.loc || "").split("/").pop() || "")
          .replace(/[-_]/g, " ")
          .replace(/\.html$/,"")
          .replace(/\b\w/g, m => m.toUpperCase());

        const card = document.createElement("article");
        card.className = "card";
        card.innerHTML = `
          <a class="card-media" href="${u.loc}">
            <img src="/assets/blog/placeholder.webp" alt="${title}" loading="lazy">
          </a>
          <div class="card-body">
            <h3 class="card-title"><a href="${u.loc}">${title}</a></h3>
            <p class="muted">Leer más</p>
          </div>`;
        grid.appendChild(card);
      }
    } catch {
      // Fallback local
      grid.innerHTML = `
        <article class="card">
          <a class="card-media" href="/client/blog/hola-mundo.html">
            <img src="/assets/blog/hello.webp" alt="Hola Mundo" loading="lazy">
          </a>
          <div class="card-body"><h3 class="card-title"><a href="/client/blog/hola-mundo.html">Hola Mundo</a></h3><p class="muted">Leer más</p></div>
        </article>
        <article class="card">
          <a class="card-media" href="/client/blog/guias-de-seguridad.html">
            <img src="/assets/blog/security.webp" alt="Guía de seguridad" loading="lazy">
          </a>
          <div class="card-body"><h3 class="card-title"><a href="/client/blog/guias-de-seguridad.html">Guía de seguridad para streamers</a></h3><p class="muted">Leer más</p></div>
        </article>
        <article class="card">
          <a class="card-media" href="/client/blog/como-empezar-modelo.html">
            <img src="/assets/blog/get-started.webp" alt="Cómo empezar" loading="lazy">
          </a>
          <div class="card-body"><h3 class="card-title"><a href="/client/blog/como-empezar-modelo.html">Cómo empezar como modelo</a></h3><p class="muted">Leer más</p></div>
        </article>`;
    }
  }

  // ---- Init ----
  document.addEventListener("DOMContentLoaded", () => {
    loadTopModels();
    loadBlogCards();
  });
})();
