// Muestra el balance actual de ONECOP al conectar wallet
import { Onchain } from "./onchain.js";
import { showToast } from "./index.js";

const TOKEN = "0x61028e69fe97c7a4ddc4753bc6188d8cdbd6befe"; // ONECOP BSC Testnet
const btn = document.getElementById("btnBalance");
const output = document.getElementById("balanceOutput");

btn?.addEventListener("click", async () => {
  output.textContent = "⏳ Consultando...";
  if (!window.ethereum) {
    showToast("MetaMask no detectado ❌", "error");
    output.textContent = "❌ MetaMask no detectado";
    return;
  }

  try {
    const [account] = await window.ethereum.request({ method: "eth_requestAccounts" });
    const raw = await Onchain.balanceOf(TOKEN, account);
    const balance = await Onchain.fromWei(TOKEN, raw);
    output.textContent = `${balance} ONECOP`;

    showToast(`Balance cargado: ${balance} ONECOP ✅`, "success");
  } catch (err) {
    console.error(err);
    output.textContent = "⚠️ Error al obtener balance";
    showToast("Error al obtener balance ❌", "error");
  }
});
