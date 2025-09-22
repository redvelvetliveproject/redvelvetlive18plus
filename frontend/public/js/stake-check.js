// /public/js/stake-check.js
// Verifica allowance hacia contrato staking, aprueba si es 0

import { Onchain } from './onchain.js';

const TOKEN = '0x61028e69fe97c7a4ddc4753bc6188d8cdbd6befe';
const STAKING = '0x0000000000000000000000000000000000000000'; // reemplaza por tu contrato staking
const btn = document.getElementById('checkStake');
const msg = document.getElementById('stakeMsg');

btn?.addEventListener('click', async () => {
  msg.textContent = '⏳ Verificando...';

  try {
    if (!window.ethereum) throw new Error('MetaMask no detectado');
    const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' });

    const allowed = await Onchain.allowance(TOKEN, account, STAKING);
    const readable = await Onchain.fromWei(TOKEN, allowed);

    if (Number(readable) === 0) {
      msg.textContent = '⚠️ No autorizado. Enviando aprobación...';
      const max = await Onchain.toWei(TOKEN, '1000000000');
      const tx = await Onchain.approve(TOKEN, STAKING, max);
      msg.textContent = `✅ Aprobado – Tx: ${tx.hash.slice(0, 10)}...`;
    } else {
      msg.textContent = `✅ Ya aprobado: ${readable} ONECOP`;
    }
  } catch (err) {
    console.error(err);
    msg.textContent = `⚠️ ${err.message || 'Error al verificar'}`;
  }
});
