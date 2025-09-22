import { keccak256 } from 'ethereum-cryptography/keccak';
import { bytesToHex, hexToBytes, utf8ToBytes } from 'ethereum-cryptography/utils';
import { recoverAddress, hashMessage, toHex } from 'viem'; // o 'ethers' si prefieres

export function normalizeAddress(addr) {
  if (!addr || typeof addr !== 'string') throw new Error('Dirección inválida');
  const m = addr.match(/^0x[a-fA-F0-9]{40}$/);
  if (!m) throw new Error('Dirección inválida');
  return addr.toLowerCase();
}

export function addressesEqual(a, b) {
  try {
    return normalizeAddress(a) === normalizeAddress(b);
  } catch {
    return false;
  }
}

// Recupera el firmante de un personal_sign (EIP-191)
export function recoverSignerFromPersonalSign(message, signature) {
  // Con viem es directo:
  // hashMessage aplica prefijo "\x19Ethereum Signed Message:\n"
  const digest = hashMessage(message);
  // signature debe venir 0x...
  const signer = recoverAddress({ hash: digest, signature });
  return normalizeAddress(signer);
}
