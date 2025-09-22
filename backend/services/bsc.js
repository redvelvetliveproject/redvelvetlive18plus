// backend/src/services/bsc.js
import logger from '../config/logger.js';
import { ethers } from 'ethers';

const RPC_URL = process.env.BSC_RPC_URL;
if (!RPC_URL) throw new Error('Falta BSC_RPC_URL en variables de entorno');

const provider = new ethers.JsonRpcProvider(RPC_URL);

// Keccak256("Transfer(address,address,uint256)")
const TRANSFER_SIG = ethers.id("Transfer(address,address,uint256)");

export async function getCurrentBlockNumber() {
  try {
    return await provider.getBlockNumber();
  } catch (err) {
    logger.error({ err }, "Error al obtener número de bloque");
    throw err;
  }
}

export async function getTxReceipt(txHash) {
  try {
    return await provider.getTransactionReceipt(txHash);
  } catch (err) {
    logger.error({ txHash, err }, "Error al obtener recibo de transacción");
    throw err;
  }
}

export function normalize(addr) {
  return (addr || "").toLowerCase();
}

export function hexToBigIntStr(hex) {
  try {
    return BigInt(hex).toString();
  } catch {
    return "0";
  }
}

export function findTransferToTreasury(receipt, tokenContract, treasury) {
  if (!receipt || !receipt.logs) return null;
  const wantAddr = normalize(tokenContract);
  const wantTo = normalize(treasury);

  for (const log of receipt.logs) {
    if (normalize(log.address) !== wantAddr) continue;
    if (!log.topics || log.topics.length < 3) continue;
    if (normalize(log.topics[0]) !== normalize(TRANSFER_SIG)) continue;

    const toTopic = normalize(log.topics[2]);
    const toAddr = "0x" + toTopic.slice(26);

    if (normalize(toAddr) !== wantTo) continue;

    const valueStr = hexToBigIntStr(log.data);
    return { valueStr };
  }
  return null;
}

export async function getLogs({ fromBlock, toBlock, address, topics }) {
  try {
    return await provider.send("eth_getLogs", [{
      fromBlock: toHex(fromBlock),
      toBlock: toHex(toBlock),
      address,
      topics,
    }]);
  } catch (err) {
    logger.error({ err }, "Error al obtener logs");
    throw err;
  }
}

export function toHex(n) {
  return "0x" + BigInt(n).toString(16);
}

export function addrToTopic(addr) {
  const clean = normalize(addr).replace(/^0x/, "");
  return "0x" + "0".repeat(64 - clean.length) + clean;
}
