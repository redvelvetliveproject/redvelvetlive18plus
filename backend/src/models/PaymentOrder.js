// backend/src/models/PaymentOrder.js
import mongoose from 'mongoose';

const PaymentOrderSchema = new mongoose.Schema(
  {
    token: { type: String, enum: ['ONECOP', 'USDT'], required: true },
    amountWei: { type: String, required: true },   // string para valores grandes
    from: { type: String },                        // opcional (puede venir del cliente)
    treasury: { type: String, required: true },
    tokenContract: { type: String, required: true },
    chainId: { type: Number, default: 56 },        // BSC mainnet
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
      index: true
    },
    txHash: { type: String },
    txBlockNumber: { type: Number },
    seenConfirmations: { type: Number, default: 0 },
    meta: { type: Object },                        // sandbox para extras
  },
  { timestamps: true }
);

PaymentOrderSchema.index({ status: 1, token: 1, createdAt: -1 });

// Método de conveniencia
PaymentOrderSchema.methods.markPaid = function (txHash, blockNumber) {
  this.status = 'paid';
  this.txHash = txHash;
  this.txBlockNumber = blockNumber;
  return this.save();
};

const PaymentOrder =
  mongoose.models.PaymentOrder || mongoose.model('PaymentOrder', PaymentOrderSchema);

export default PaymentOrder;
