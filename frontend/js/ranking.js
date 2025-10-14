// 🌹 RedVelvetLive — Ranking (JS)
// Carga dinámica de: /api/models/top | /featured | /ambassadors | /live
// Filtrado por búsqueda, límite y paginación básica.

(function(){
  const API = location.origin.includes("localhost")
    ? "http://localhost:4000/api"
    : (location.origin + "/api");

  const $ = (s) => document.querySelector(s);

  const grid = $("#grid");
  const pageInfo = $("#pageInfo");
  const btnPrev = $("#btnPrev");
  const btnNext = $("#btnNext");
  const qInput = $("#q");
  const limitSel = $("#limit");
  const btnSearch = $("#btnSearch");

  const stateLoading = $("#stateLoading");
  const stateEmpty = $("#stateEmpty");
  const stateError = $("#stateError");
  const toastEl = $("#toast");

  let state = {
    cat: "top",
    page: 1,
    limit: parseInt(limitSel.value, 10) || 24,
    q: "",
    total: 0
  };

  function toast(msg, type="info"){
    toastEl.textContent = msg;
    toastEl.style.background = type === "ok" ? "#16a34a" : type === "err" ? "#ef4444" : "#2563eb";
    toastEl.classList.add("show");
    setTimeout(()=>toastEl.classList.remove("show"), 2400);
  }

  // ===== Tabs =====
  document.querySelectorAll(".tab").forEach(tab=>{
    tab.onclick = () => {
      document.querySelectorAll(".tab").forEach(t=>t.classList.remove("active"));
      tab.classList.add("active");
      state.cat = tab.getAttribute("data-cat");
      state.page = 1;
      load();
    }
  });

  // ===== Toolbar events =====
  btnPrev.onclick = () => {
    if (state.page > 1) {
      state.page--;
      load();
    }
  };

  btnNext.onclick = () => {
    // paginación simple: avanzamos si el último batch trae "limit" elementos
    // (si el backend devuelve total, podríamos calcular páginas exactas)
    state.page++;
    load();
  };

  btnSearch.onclick = () => {
    state.q = qInput.value.trim();
    state.limit = parseInt(limitSel.value, 10) || 24;
    state.page = 1;
    load();
  };

  limitSel.onchange = () => {
    state.limit = parseInt(limitSel.value, 10) || 24;
    state.page = 1;
    load();
  };

  qInput.addEventListener("keyup", (e)=>{
    if (e.key === "Enter") btnSearch.click();
  });

  // ===== Build endpoint =====
  function endpoint(){
    const { cat, page, limit, q } = state;
    let path = "/models/top";
    if (cat === "featured") path = "/models/featured";
    if (cat === "ambassadors") path = "/models/ambassadors";
    if (cat === "live") path = "/models/live";

    const qs = new URLSearchParams();
    qs.set("limit", String(limit));
    if (page > 1) qs.set("page", String(page));
    if (q) qs.set("search", q);

    return API + path + "?" + qs.toString();
  }

  // ===== Load data =====
  async function load(){
    showState("loading");
    try{
      const res = await fetch(endpoint());
      const data = await res.json();

      if (!res.ok || !data || data.success === false) {
        throw new Error(data?.message || "Error de API");
      }

      const items = data.data || data.items || [];
      state.total = data.total || items.length;

      render(items);
      if (items.length === 0) showState("empty"); else hideStates();

      // pager info (aprox: mostramos rango estimado)
      const start = (state.page - 1) * state.limit + (items.length ? 1 : 0);
      const end = (state.page - 1) * state.limit + items.length;
      pageInfo.textContent = `${start}–${end}`;

      // habilitar/deshabilitar prev según página
      btnPrev.disabled = state.page <= 1;
      // next sin total exacto: permitimos seguir; si viene vacío, al presionar Next volveremos a ver vacío → el usuario vuelve
      btnNext.disabled = items.length < state.limit;
    }catch(e){
      console.error(e);
      showState("error");
      toast("No se pudo cargar el ranking", "err");
    }
  }

  // ===== Render cards =====
  function render(items){
    grid.innerHTML = "";
    const fallback = "/assets/img/default-avatar.webp";
    items.forEach(m=>{
      const {
        name = "Sin nombre",
        country = "—",
        avatarUrl,
        avatar, // compat: {large}
        featured,
        ambassador,
        liveStatus, // "ONLINE" | "OFFLINE" | "VOICE_ONLY"
        slug,
        wallet
      } = m || {};

      const img = avatarUrl || avatar?.large || fallback;

      const badges = [];
      if (liveStatus === "ONLINE") badges.push(`<span class="badge b-live">EN VIVO</span>`);
      if (liveStatus === "VOICE_ONLY") badges.push(`<span class="badge b-voice">🎧 Solo voz</span>`);
      if (ambassador) badges.push(`<span class="badge b-amb">EMBAJADORA</span>`);
      if (featured) badges.push(`<span class="badge b-feat">DESTACADA</span>`);

      // links opcionales si existe slug
      const viewHref = slug ? `/models/${slug}` : "javascript:void(0)";
      const liveHref = slug ? `/live/${slug}` : "javascript:void(0)";

      const card = document.createElement("div");
      card.className = "mcard";
      card.innerHTML = `
        <div class="thumb">
          <img src="${img}" alt="${escapeHtml(name)}" loading="lazy" />
          <div class="badges">${badges.join("")}</div>
        </div>
        <div class="body">
          <p class="name">${escapeHtml(name)}</p>
          <p class="meta">${escapeHtml(country)} ${wallet ? ` · <code>${wallet.slice(0,8)}…</code>` : ""}</p>
        </div>
        <div class="actions">
          <a class="primary" href="${liveHref}">Ver en vivo</a>
          <a href="${viewHref}">Perfil</a>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  function showState(which){
    stateLoading.style.display = which === "loading" ? "flex" : "none";
    stateEmpty.style.display   = which === "empty"   ? "flex" : "none";
    stateError.style.display   = which === "error"   ? "flex" : "none";
  }
  function hideStates(){ showState(""); }

  function escapeHtml(str){
    return String(str).replace(/[&<>"']/g, (m)=>({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
    }[m]));
  }

  // Init
  load();
})();
