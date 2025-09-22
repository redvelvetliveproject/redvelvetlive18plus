// backend/src/routes/payments.js
import { Router } from 'express';
import PaymentOrder from '../models/PaymentOrder.js';
import {
  getTxReceipt,
  getCurrentBlockNumber,
  findTransferToTreasury,
} from '../services/bsc.js';

const router = Router();

// -------- Config desde ENV ----------
const TREASURY = process.env.TREASURY_WALLET;
const ONECOP_CONTRACT = process.env.ONECOP_CONTRACT;
const USDT_CONTRACT = process.env.USDT_BSC_CONTRACT;
const MIN_CONF = parseInt(process.env.MIN_CONFIRMATIONS || '3', 10);

const DECIMALS = { ONECOP: 18, USDT: 18 };

function toWeiStr(amountNum, decimals) {
  const [intPart, fracPart = ''] = String(amountNum).split('.');
  const cleanFrac = (fracPart + '0'.repeat(decimals)).slice(0, decimals);
  return BigInt(intPart + cleanFrac).toString();
}

function tokenContractOf(token) {
  if (token === 'ONECOP') return ONECOP_CONTRACT;
  if (token === 'USDT') return USDT_CONTRACT;
  return null;
}

// --------- POST /api/payments/create -----------
router.post('/create', async (req, res) => {
  try {
    const { token, amount } = req.body || {};
    if (!token || !['ONECOP', 'USDT'].includes(token)) {
      return res.status(400).json({ ok: false, error: 'token inválido' });
    }
    if (!amount) return res.status(400).json({ ok: false, error: 'amount requerido' });
    if (!TREASURY) return res.status(500).json({ ok: false, error: 'TREASURY_WALLET no configurado' });

    const contract = tokenContractOf(token);
    if (!contract) return res.status(500).json({ ok: false, error: `Falta contrato para ${token}` });

    const decimals = DECIMALS[token] ?? 18;
    const amountWei = toWeiStr(amount, decimals);

    const order = await PaymentOrder.create({
      token,
      amountWei,
      treasury: TREASURY,
      tokenContract: contract,
      status: 'pending',
      meta: { decimals, requestedAmount: String(amount) },
    });

    return res.json({
      ok: true,
      orderId: order._id.toString(),
      chainId: order.chainId,
      token,
      tokenContract: contract,
      treasury: TREASURY,
      amountWei,
      decimals,
      tips: {
        sendTo: TREASURY,
        network: 'BSC Mainnet (chainId 56)',
        note: 'Envía exactamente o más del monto solicitado en el token correcto.',
      },
    });
  } catch (err) {
    req.log?.error({ err }, 'payments/create failed');
    return res.status(500).json({ ok: false, error: 'internal_error' });
  }
});

// --------- POST /api/payments/submit-tx -----------
router.post('/submit-tx', async (req, res) => {
  try {
    const { orderId, txHash, from } = req.body || {};
    if (!orderId || !txHash) {
      return res.status(400).json({ ok: false, error: 'orderId y txHash requeridos' });
    }

    const order = await PaymentOrder.findById(orderId);
    if (!order) return res.status(404).json({ ok: false, error: 'order_not_found' });
    if (order.status === 'paid') {
      return res.json({ ok: true, status: 'paid', orderId, txHash: order.txHash });
    }

    const receipt = await getTxReceipt(txHash);
    if (!receipt) {
      return res.json({ ok: true, status: 'pending', detail: 'tx no minada aún' });
    }
    if (receipt.status !== '0x1') {
      order.status = 'failed';
      order.txHash = txHash;
      await order.save();
      return res.json({ ok: true, status: 'failed', detail: 'tx revertida' });
    }

    const current = await getCurrentBlockNumber();
    const txBlock = parseInt(receipt.blockNumber, 16);
    const confirmations = current - txBlock + 1;

    const hit = findTransferToTreasury(receipt, order.tokenContract, order.treasury);
    if (!hit) {
      return res.json({ ok: true, status: 'pending', detail: 'Transfer no encontrada hacia treasury' });
    }

    const sent = BigInt(hit.valueStr);
    const need = BigInt(order.amountWei);
    if (sent < need) {
      return res.json({
        ok: true,
        status: 'pending',
        detail: `Monto insuficiente: enviado ${sent}, requerido ${need}`,
        confirmations,
      });
    }

    order.txHash = txHash;
    order.txBlockNumber = txBlock;
    order.seenConfirmations = confirmations;
    if (confirmations >= MIN_CONF) {
      order.status = 'paid';
    }
    if (from) order.from = from;
    await order.save();

    return res.json({
      ok: true,
      status: order.status,
      orderId,
      txHash,
      confirmations,
      minConfirmations: MIN_CONF,
    });
  } catch (err) {
    req.log?.error({ err }, 'payments/submit-tx failed');
    return res.status(500).json({ ok: false, error: 'internal_error' });
  }
});

// --------- GET /api/payments/:orderId/status -----------
router.get('/:orderId/status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await PaymentOrder.findById(orderId).lean();
    if (!order) return res.status(404).json({ ok: false, error: 'order_not_found' });
    return res.json({
      ok: true,
      status: order.status,
      orderId,
      token: order.token,
      amountWei: order.amountWei,
      txHash: order.txHash || null,
      confirmations: order.seenConfirmations || 0,
      minConfirmations: MIN_CONF,
      createdAt: order.createdAt,
    });
  } catch (err) {
    req.log?.error({ err }, 'payments/status failed');
    return res.status(500).json({ ok: false, error: 'internal_error' });
  }
});

export default router;
