// wallet-tools.js – Estado Web3 + balance ONECOP + conversión simple a USDT

import { Onchain } from './onchain.js';

const TOKEN_ADDRESS = '0x61028e69fe97c7a4ddc4753bc6188d8cdbd6befe'; // ONECOP testnet
const USDT_RATE = 0.0012; // Ejemplo: 1 ONECOP = 0.0012 USDT (puedes actualizar con API u oráculo)

const elStatus   = document.getElementById('walletStatus');
const elBalance  = document.getElementById('walletBalance');
const elUSDT     = document.getElementById('walletUSDT');
const elNetwork  = document.getElementById('walletNetwork');
const elRefresh  = document.getElementById('walletRefresh');
const elAddress  = document.getElementById('walletAddress');

async function initWalletTools() {
  if (!window.ethereum) {
    elStatus.textContent = '❌ MetaMask no detectado';
    return;
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const network  = await provider.getNetwork();
  const correct  = (network.chainId === 97); // BSC Testnet

  elNetwork.textContent = correct ? '✅ BSC Testnet' : `⚠️ Red: ${network.name}`;

  const accounts = await provider.send("eth_requestAccounts", []);
  const address = accounts[0];

  elStatus.textContent = '🟢 Wallet conectada';
  elAddress.textContent = shorten(address);

  try {
    const rawBalance = await Onchain.balanceOf(TOKEN_ADDRESS, address);
    const strBalance = await Onchain.fromWei(TOKEN_ADDRESS, rawBalance);
    const usdtValue = (parseFloat(strBalance) * USDT_RATE).toFixed(2);

    elBalance.textContent = `${Number(strBalance).toLocaleString()} ONECOP`;
    elUSDT.textContent = `≈ ${usdtValue} USDT`;

  } catch (err) {
    elBalance.textContent = '—';
    elUSDT.textContent = '—';
    console.error('Balance error:', err);
  }
}

function shorten(addr) {
  return addr.slice(0, 6) + '…' + addr.slice(-4);
}

elRefresh?.addEventListener('click', initWalletTools);

// Init automático
window.addEventListener('DOMContentLoaded', initWalletTools);
