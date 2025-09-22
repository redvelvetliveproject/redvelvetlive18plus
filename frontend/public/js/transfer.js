// /public/js/transfer.js
// Permite enviar tokens ONECOP a otra dirección

import { Onchain } from './onchain.js';
import { showToast } from './toast.js';

const TOKEN = '0x61028e69fe97c7a4ddc4753bc6188d8cdbd6befe';
const form = document.getElementById('formTransfer');
const inputTo = document.getElementById('toAddress');
const inputAmount = document.getElementById('amount');
const msg = document.getElementById('transferMsg');

form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  msg.textContent = '⏳ Procesando...';

  try {
    const to = inputTo.value.trim();
    if (!/^0x[a-fA-F0-9]{40}$/.test(to)) throw new Error('Dirección inválida');
    const wei = await Onchain.toWei(TOKEN, inputAmount.value);
    const tx = await Onchain.transfer(TOKEN, to, wei);

    msg.textContent = `✅ Enviado – Tx: ${tx.hash.slice(0, 10)}...`;
    showToast("Transferencia realizada ✅", "success");
  } catch (err) {
    console.error(err);
    msg.textContent = `⚠️ ${err.message || 'Error al transferir'}`;
    showToast("Error en transferencia ❌", "error");
  }
});
