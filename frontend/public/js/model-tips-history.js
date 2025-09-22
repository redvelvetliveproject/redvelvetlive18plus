// /public/js/model-tips-history.js
// Muestra historial de tips con fallback y permite exportar a PDF mediante jsPDF.

document.getElementById("exportarTipsPDF")?.addEventListener("click", exportarTipsPDF);

// Al cargar, intentar traer la lista de tips del API; si no hay API, generar datos demo.
window.addEventListener("DOMContentLoaded", loadTips);

/**
 * Intenta cargar el historial de tips desde el endpoint /api/model/tips.
 * Si no existe, genera un historial simulado.
 */
async function loadTips() {
  try {
    const res = await fetch("/api/model/tips", { credentials: "include" });
    if (!res.ok) throw new Error("API no disponible");
    const data = await res.json();
    fillTable(data?.items || []);
  } catch (err) {
    console.warn("[model-tips-history] usando datos mock:", err);
    const demo = generateMockTips(10);
    fillTable(demo);
  }
}

/**
 * Rellena la tabla de historial con las filas dadas.
 * @param {Array<{date:string,user:string,onecop:number,usdt:number}>} items
 */
function fillTable(items) {
  const tbody = document.querySelector("#tablaTips tbody");
  tbody.innerHTML = "";
  items.forEach((tip) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${tip.date}</td>
      <td>${tip.user}</td>
      <td>${tip.onecop}</td>
      <td>$${tip.usdt.toFixed(2)}</td>
    `;
    tbody.appendChild(tr);
  });
}

/**
 * Genera una lista de tips demo con valores aleatorios.
 * @param {number} count Número de registros a generar.
 */
function generateMockTips(count) {
  const users = ["CryptoFan99", "LatamLover", "AnonSupporter", "OceanGirl", "DevUser"];
  const items = [];
  for (let i = 0; i < count; i++) {
    const date = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    const user = users[Math.floor(Math.random() * users.length)];
    const onecop = Math.floor(Math.random() * 1000) + 100;
    const usdt = onecop * 0.01; // conversión demo: 1 ONECOP = 0.01 USDT
    items.push({ date, user, onecop, usdt });
  }
  return items;
}

/**
 * Exporta la tabla actual de tips a PDF usando jsPDF.
 */
async function exportarTipsPDF() {
  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Historial de Tips – RedVelvetLive", 20, 20);

    const headers = ["Fecha", "Usuario", "Tip (ONECOP)", "Equivalente (USDT)"];
    const rows = Array.from(document.querySelectorAll("#tablaTips tbody tr")).map((row) =>
      Array.from(row.children).map((cell) => cell.innerText)
    );

    if (doc.autoTable) {
      doc.autoTable({
        head: [headers],
        body: rows,
        startY: 30,
      });
    } else {
      // Fallback simple si autoTable no está disponible
      let y = 40;
      rows.forEach((r) => {
        doc.text(r.join(" | "), 20, y);
        y += 10;
      });
    }

    doc.save("historial-tips.pdf");
  } catch (err) {
    console.error("Error exportando PDF:", err);
    alert("No se pudo exportar el PDF");
  }
}
// Exporta la tabla de tips a PDF y carga historial desde la API (con fallback)

document.getElementById("exportarTipsPDF")?.addEventListener("click", exportarTipsPDF);

async function exportarTipsPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text("Historial de Tips – RedVelvetLive", 20, 20);

  const headers = ["Fecha", "Usuario", "Tip (ONECOP)", "Equivalente (USDT)"];
  const rows = Array.from(document.querySelectorAll("#tablaTips tbody tr"))
    .map(row => Array.from(row.children).map(cell => cell.innerText));

  doc.autoTable({ head: [headers], body: rows, startY: 30 });
  doc.save("historial-tips.pdf");
}

// Cargar tips desde la API
async function cargarTips() {
  const tbody = document.querySelector("#tablaTips tbody");
  try {
    const res = await fetch(`${window.API_BASE || "/api"}/model/tips`, { credentials: "include" });
    if (!res.ok) throw new Error();
    const data = await res.json();
    const tips = data.items || [];
    if (!tips.length) throw new Error();

    tbody.innerHTML = "";
    tips.forEach(tip => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${tip.date}</td>
        <td>${tip.user}</td>
        <td>${tip.onecop}</td>
        <td>$${tip.usdt.toFixed(2)}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch {
    // Fallback estático
    tbody.innerHTML = `
      <tr><td>10/07/2025</td><td>CryptoFan99</td><td>1500</td><td>$15.00</td></tr>
      <tr><td>09/07/2025</td><td>LatamLover</td><td>800</td><td>$8.00</td></tr>
      <tr><td>08/07/2025</td><td>AnonSupporter</td><td>1200</td><td>$12.00</td></tr>
    `;
  }
}

document.addEventListener("DOMContentLoaded", cargarTips);

// Genera tabla y exporta a PDF con fallback
import { showToast } from './toast.js';

const tabla = document.getElementById('tablaTips').querySelector('tbody');

async function cargarTips() {
  try {
    const res = await fetch(`${window.API_BASE || '/api'}/model/tips`, {
      credentials: 'include',
    });
    const json = res.ok ? await res.json() : null;
    const data = Array.isArray(json?.items) ? json.items : [];
    if (data.length) {
      tabla.innerHTML = '';
      data.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${row.date}</td>
          <td>${row.user}</td>
          <td>${row.onecop}</td>
          <td>${row.usdt}</td>`;
        tabla.appendChild(tr);
      });
      return;
    }
    throw new Error('Vacío');
  } catch {
    // fallback demo
    tabla.innerHTML = `
      <tr><td>10/07/2025</td><td>CryptoFan99</td><td>1500</td><td>$15.00</td></tr>
      <tr><td>09/07/2025</td><td>LatamLover</td><td>800</td><td>$8.00</td></tr>
      <tr><td>08/07/2025</td><td>AnonSupporter</td><td>1200</td><td>$12.00</td></tr>
    `;
  }
}

document.getElementById('exportarTipsPDF').addEventListener('click', async () => {
  showToast('Exportando PDF…', 'info');
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text('Historial de Tips – RedVelvetLive', 20, 20);
  const rows = Array.from(tabla.querySelectorAll('tr')).map(row => Array.from(row.children).map(td => td.textContent));
  const headers = ['Fecha', 'Usuario', 'Tip (ONECOP)', 'Equivalente (USDT)'];
  if (doc.autoTable) {
    doc.autoTable({ head: [headers], body: rows, startY: 30 });
  } else {
    let y = 40;
    rows.forEach(r => {
      doc.text(r.join(' | '), 20, y);
      y += 10;
    });
  }
  doc.save('historial-tips.pdf');
  showToast('PDF guardado 📄', 'success');
});

document.addEventListener('DOMContentLoaded', cargarTips);
