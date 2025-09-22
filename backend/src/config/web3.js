// backend/src/services/web3.js
/**
 * Utilidades Web3 con ethers v6.
 * Envs:
 *   RPC_URL=https://bsc-dataseed.binance.org (o el de tu red)
 *   CHAIN_ID=56 (BSC mainnet) | 97 (testnet)
 *   PRIVATE_KEY= (opcional si el backend debe firmar/emitir)
 */

import { ethers } from 'ethers';
import logger from '../config/logger.js';

const RPC_URL = process.env.RPC_URL || '';
const CHAIN_ID = Number(process.env.CHAIN_ID || 0) || undefined;

/**
 * Retorna un provider conectado a la red configurada
 */
export function getProvider() {
  if (!RPC_URL) {
    logger.error('RPC_URL no está definido en .env');
    throw new Error('RPC_URL requerido');
  }
  return new ethers.JsonRpcProvider(RPC_URL, CHAIN_ID);
}

/**
 * Retorna un signer si existe PRIVATE_KEY en .env
 */
export function getSigner() {
  const pk = process.env.PRIVATE_KEY;
  if (!pk) {
    logger.error('Intento de usar signer sin PRIVATE_KEY');
    throw new Error('PRIVATE_KEY no definido');
  }
  return new ethers.Wallet(pk, getProvider());
}

/**
 * Verifica una firma de mensaje simple (personal_sign)
 * @returns {string|null} dirección (0x...) si válida, null si no.
 */
export function verifySignature({ message, signature }) {
  try {
    const addr = ethers.verifyMessage(message, signature);
    return ethers.getAddress(addr); // normaliza a checksum
  } catch (err) {
    logger.warn({ err }, 'Firma inválida en verifySignature');
    return null;
  }
}

/**
 * Obtiene el balance nativo (BNB en BSC, ETH en Ethereum)
 * @returns {Promise<string>} balance como string decimal
 */
export async function getNativeBalance(address) {
  try {
    const provider = getProvider();
    const wei = await provider.getBalance(address);
    return ethers.formatEther(wei);
  } catch (err) {
    logger.error({ err, address }, 'Error obteniendo balance nativo');
    throw err;
  }
}

/**
 * Llama balanceOf de un ERC20 (ej: USDT/ONECOP).
 * @param {string} token token address
 * @param {string} owner dirección a consultar
 * @returns {Promise<string>} balance formateado con decimales correctos
 */
export async function getErc20Balance(token, owner) {
  try {
    const provider = getProvider();
    const abi = [
      'function balanceOf(address) view returns (uint256)',
      'function decimals() view returns (uint8)',
    ];
    const c = new ethers.Contract(token, abi, provider);
    const [raw, decimals] = await Promise.all([c.balanceOf(owner), c.decimals()]);
    return ethers.formatUnits(raw, decimals);
  } catch (err) {
    logger.error({ err, token, owner }, 'Error obteniendo balance de ERC20');
    throw err;
  }
}
