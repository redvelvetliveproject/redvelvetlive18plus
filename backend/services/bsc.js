<<<<<<< HEAD
// Demo con datos falsos
export const getStats = async (req, res) => {
  try {
    res.json({
      rangeLabel: "Últimos 7 días",
      kpis: { incomeUSDT: 128.75, tipsCount: 36, sessions: 4 },
      incomeByDay: [
        { day: "Lun", amount: 10 },
        { day: "Mar", amount: 18 },
        { day: "Mié", amount: 24 },
        { day: "Jue", amount: 12 },
        { day: "Vie", amount: 36 },
        { day: "Sáb", amount: 15 },
        { day: "Dom", amount: 14 }
      ],
      topTippers: [
        { user: "@Neo", onecop: 650 },
        { user: "@Maya", onecop: 420 },
        { user: "@Alex", onecop: 280 }
      ]
    });
  } catch (err) {
    res.status(500).json({ error: "No se pudo obtener estadísticas" });
  }
};

export const getTips = async (req, res) => {
  try {
    res.json({
      items: [
        { date: "2025-07-10", user: "CryptoFan99", onecop: 1500, usdt: 15.0 },
        { date: "2025-07-09", user: "LatamLover", onecop: 800, usdt: 8.0 },
        { date: "2025-07-08", user: "AnonSupporter", onecop: 1200, usdt: 12.0 }
      ]
    });
  } catch (err) {
    res.status(500).json({ error: "No se pudo obtener historial de tips" });
  }
};
=======
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
>>>>>>> 685d169 (Primer commit limpio)
