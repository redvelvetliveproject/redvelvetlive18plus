// /public/js/wallet-box.js
// Conexión y gestión de wallet (MetaMask u otra inyectada)

import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@6.11.1/dist/ethers.min.js";
import { showToast } from "./toast.js";

let provider;
let signer;
let currentAccount;

const statusEl = document.getElementById("walletStatus");
const balanceEl = document.getElementById("walletBalance");
const chainEl = document.getElementById("walletChain");
const connectBtn = document.getElementById("btnConnect");
const disconnectBtn = document.getElementById("btnDisconnect");

// ✅ Detectar MetaMask u otra wallet inyectada
function isWalletAvailable() {
  return typeof window.ethereum !== "undefined";
}

// ✅ Conectar wallet
async function connectWallet() {
  if (!isWalletAvailable()) {
    statusEl.textContent = "❌ No se detectó ninguna wallet. Instala MetaMask.";
    showToast("No se detectó wallet instalada.", "error");
    connectBtn.style.display = "inline-block";
    disconnectBtn.style.display = "none";
    return;
  }

  try {
    provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    signer = await provider.getSigner();
    currentAccount = accounts[0];

    statusEl.textContent = `✅ Conectado: ${currentAccount.substring(0, 6)}...${currentAccount.slice(-4)}`;
    connectBtn.style.display = "none";
    disconnectBtn.style.display = "inline-block";

    await updateBalance();
    await updateChain();

    showToast("Wallet conectada correctamente ✅", "success");
  } catch (err) {
    console.error("❌ Error al conectar wallet:", err);
    statusEl.textContent = "⚠️ Error al conectar la wallet.";
    showToast("Error al conectar la wallet ❌", "error");
  }
}

// ✅ Desconectar wallet
function disconnectWallet() {
  currentAccount = null;
  provider = null;
  signer = null;

  statusEl.textContent = "🔄 Wallet desconectada.";
  balanceEl.textContent = "Balance: —";
  chainEl.textContent = "Red: —";

  connectBtn.style.display = "inline-block";
  disconnectBtn.style.display = "none";

  showToast("Wallet desconectada 👋", "info");
}

// ✅ Actualizar balance
async function updateBalance() {
  if (!currentAccount || !provider) return;
  try {
    const balanceWei = await provider.getBalance(currentAccount);
    const balanceEth = ethers.formatEther(balanceWei);
    balanceEl.textContent = `Balance: ${Number(balanceEth).toFixed(4)} ETH`;
  } catch (err) {
    console.error("❌ Error al obtener balance:", err);
    balanceEl.textContent = "Balance: Error";
  }
}

// ✅ Mostrar red
async function updateChain() {
  if (!provider) return;
  try {
    const network = await provider.getNetwork();
    chainEl.textContent = `Red: ${network.name} (Chain ID: ${network.chainId})`;
  } catch (err) {
    console.error("❌ Error al detectar red:", err);
    chainEl.textContent = "Red: Error";
  }
}

// ✅ Detectar cambios de cuenta o red
if (isWalletAvailable()) {
  window.ethereum.on("accountsChanged", () => {
    statusEl.textContent = "🔄 Cuenta cambiada, vuelve a conectar.";
    showToast("Cuenta cambiada en la wallet", "warn");
    disconnectWallet();
  });

  window.ethereum.on("chainChanged", () => {
    updateChain();
    showToast("Red cambiada en la wallet 🌐", "info");
  });
}

// ✅ Botones
connectBtn?.addEventListener("click", connectWallet);
disconnectBtn?.addEventListener("click", disconnectWallet);

// ✅ Estado inicial
statusEl.textContent = isWalletAvailable()
  ? "🔎 Wallet detectada. Haz clic en conectar."
  : "❌ No se detectó ninguna wallet.";
