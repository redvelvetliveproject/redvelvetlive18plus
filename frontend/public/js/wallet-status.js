// Detecta estado de wallet y red en tiempo real
const div = document.getElementById('walletStatus');

async function checkWallet() {
  if (!window.ethereum) {
    div.textContent = '🟥 MetaMask no detectado';
    return;
  }

  try {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });

    if (!accounts.length) {
      div.textContent = '🟠 Wallet no conectada';
      return;
    }

    const netName = chainId === '0x61' ? 'BSC Testnet' : chainId;
    div.textContent = `🟢 ${accounts[0].slice(0, 6)}... – Red: ${netName}`;
  } catch (err) {
    console.error(err);
    div.textContent = '⚠️ Error al detectar wallet';
  }
}

checkWallet();
window.ethereum?.on('accountsChanged', checkWallet);
window.ethereum?.on('chainChanged', () => location.reload());
