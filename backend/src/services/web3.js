// backend/src/services/web3.js
import { verifyMessage, verifyTypedData, isAddress } from 'ethers';

/**
 * Normaliza dirección a lowercase y valida formato 0x + 40 hex.
 */
export function normalizeAddress(addr) {
  const s = String(addr || '').trim();
  return /^0x[a-fA-F0-9]{40}$/.test(s) ? s.toLowerCase() : null;
}

/**
 * Verifica firma EIP-191 (personal_sign) de un mensaje plano.
 * Retorna la dirección recuperada (lowercase) o null si falla.
 */
export async function recoverFromPersonalSign(message, signature) {
  try {
    const recovered = await verifyMessage(message, signature);
    return normalizeAddress(recovered);
  } catch {
    return null;
  }
}

/**
 * Verifica firma EIP-712 (typed data).
 * domain, types, value -> objetos exactamente como se firmaron.
 * Retorna la dirección recuperada (lowercase) o null si falla.
 */
export async function recoverFromTypedData({ domain, types, value }, signature) {
  try {
    const recovered = await verifyTypedData(domain, types, value, signature);
    return normalizeAddress(recovered);
  } catch {
    return null;
  }
}

/**
 * Valida rápidamente una dirección estilo EVM.
 */
export function isEvmAddress(addr) {
  try {
    return isAddress(addr);
  } catch {
    return false;
  }
}
