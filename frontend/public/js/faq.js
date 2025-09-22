// public/js/faq.js
// Buscador de preguntas frecuentes con highlight seguro y eventos accesibles.

const q     = document.getElementById("faqSearch");
const clear = document.getElementById("clearSearch");
const nodes = Array.from(document.querySelectorAll("details"));

function highlight(scope, term){
  // quitar marcas previas
  scope.querySelectorAll("mark").forEach(m => m.replaceWith(...m.childNodes));
  if(!term) return;

  const safe = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const rx   = new RegExp(`(${safe})`, "ig");

  for(const el of scope.querySelectorAll("summary, p, li")){
    const txt = el.textContent;
    el.innerHTML = txt.replace(rx, "<mark>$1</mark>");
  }
}

function applyFilter(){
  const term = (q?.value || "").trim().toLowerCase();
  nodes.forEach(d=>{
    const show = !term || d.textContent.toLowerCase().includes(term);
    d.style.display = show ? "" : "none";
    highlight(d, term);
    if(term && show) d.open = true;
  });

  // 🔔 Evento custom para analytics o tracking
  window.dispatchEvent(new CustomEvent("faq:filtered", { detail: { term } }));
}

q?.addEventListener("input", applyFilter);
clear?.addEventListener("click", ()=>{
  if(q){
    q.value = "";
    applyFilter();
    q.focus();
  }
});

function openByHash(){
  const id = location.hash.slice(1);
  if(!id) return;
  const d = document.getElementById(id);
  if(d && d.tagName==="DETAILS"){
    d.open = true;
    d.scrollIntoView({behavior:"smooth", block:"start"});
  }
}
window.addEventListener("hashchange", openByHash);

// start
openByHash();
applyFilter();
