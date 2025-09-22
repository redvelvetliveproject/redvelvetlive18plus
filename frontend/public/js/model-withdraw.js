// /public/models/model-withdraw.js
// Script para retirar ONECOP desde la página de modelo.
// Requiere ethers.js cargado en el HTML (<script src="https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.umd.min.js"></script>)

const TOKEN_ADDRESS = '0x61028e69fe97c7a4ddc4753bc6188d8cdbd6befe'; // ONECOP en BSC Testnet
const ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function symbol() view returns (string)',
  'function transfer(address to, uint256 amount) returns (bool)'
];

let provider, signer, contract;

/**
 * Cargar y mostrar el saldo disponible del modelo en ONECOP.
 */
async function cargarSaldo() {
  const balanceEl = document.getElementById('balance-modelo');
  if (!window.ethereum) {
    balanceEl.textContent = '❌ MetaMask no detectado';
    return;
  }

  try {
    provider = new ethers.providers.Web3Provider(window.ethereum);
    // Solicitar cuentas al usuario
    await provider.send('eth_requestAccounts', []);
    signer = provider.getSigner();
    contract = new ethers.Contract(TOKEN_ADDRESS, ABI, signer);

    const addr = await signer.getAddress();
    const balanceWei = await contract.balanceOf(addr);
    const symbol = await contract.symbol();
    const balance = ethers.utils.formatUnits(balanceWei, 18);
    balanceEl.textContent = `${Number(balance).toLocaleString()} ${symbol}`;
  } catch (err) {
    console.error(err);
    balanceEl.textContent = '⚠️ Error al cargar saldo';
  }
}

/**
 * Validar dirección EVM básica (0x + 40 hex).
 * @param {string} addr
 */
function isValidAddress(addr) {
  return /^0x[a-fA-F0-9]{40}$/.test(addr);
}

/**
 * Ejecutar retiro: valida, convierte a wei y llama a transfer.
 * Si no hay MetaMask o la transacción falla, muestra un mensaje.
 */
async function retirarTokens() {
  const dest = document.getElementById('walletDestino').value.trim();
  const cant = document.getElementById('cantidadRetiro').value.trim();
  const nota = document.querySelector('.nota') || document.createElement('p');

  // Validaciones
  if (!isValidAddress(dest)) {
    nota.textContent = '⚠️ Dirección de destino inválida (debe ser una dirección EVM 0x...).';
    return;
  }
  if (!cant || isNaN(cant) || Number(cant) <= 0) {
    nota.textContent = '⚠️ La cantidad debe ser un número mayor a 0.';
    return;
  }
  if (!window.ethereum) {
    nota.textContent = '⚠️ MetaMask no detectado.';
    return;
  }

  try {
    // Asegurarse de que el proveedor/contrato esté inicializado
    if (!provider || !signer || !contract) {
      provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      signer = provider.getSigner();
      contract = new ethers.Contract(TOKEN_ADDRESS, ABI, signer);
    }

    // Convertir a wei (18 decimales)
    const amountWei = ethers.utils.parseUnits(cant, 18);

    nota.textContent = '⏳ Enviando transacción...';
    // Transferencia de tokens (onecop -> destino)
    const tx = await contract.transfer(dest, amountWei);

    // Esperar confirmación (opcional)
    await tx.wait();
    nota.textContent = `✅ Retiro exitoso. Tx: ${tx.hash.slice(0, 10)}...`;

    // Actualizar saldo
    await cargarSaldo();
  } catch (err) {
    console.error(err);
    nota.textContent = `⚠️ Error en el retiro: ${err.message || 'Transacción rechazada'}`;
  }
}

// Cargar saldo automáticamente al abrir la página
document.addEventListener('DOMContentLoaded', cargarSaldo);
