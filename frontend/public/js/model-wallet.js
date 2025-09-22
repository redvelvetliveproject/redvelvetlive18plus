// /public/js/model-wallet.js
// Muestra el saldo actual del modelo (ONECOP) con API → Onchain → Mock
import { Onchain } from './onchain.js';
import { showToast } from './toast.js';

const TOKEN_ADDRESS = '0x61028e69fe97c7a4ddc4753bc6188d8cdbd6befe'; // ONECOP testnet

async function cargarSaldo() {
  const elem = document.querySelector('.balance-card p strong');
  if (!elem) return;

  try {
    // 1️⃣ Intentar API
    const res = await fetch(`${window.API_BASE || '/api'}/wallet/me/balance`, {
      credentials: 'include',
    });
    if (res.ok) {
      const data = await res.json();
      elem.textContent = `${data.balance.toLocaleString()} ${data.currency}`;
      return;
    }

    // 2️⃣ Fallback: lectura on-chain
    if (!window.ethereum) throw new Error('MetaMask no detectado');
    const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const raw = await Onchain.balanceOf(TOKEN_ADDRESS, account);
    const balance = await Onchain.fromWei(TOKEN_ADDRESS, raw);
    elem.textContent = `${balance} ONECOP`;
  } catch (err) {
    console.warn('⚠️ Fallback saldo:', err.message);
    // 3️⃣ Mock de demo
    elem.textContent = '500 ONECOP (≈ 6 USDT)';
  }
}

// 🔹 Botones de acción
window.retirarUSDT = () => {
  showToast('Redirigiendo a retiro…', 'info');
  location.href = 'model-withdraw.html';
};

window.verHistorial = () => {
  location.href = 'model-tips-history.html';
};

// Inicializar
document.addEventListener('DOMContentLoaded', cargarSaldo);
