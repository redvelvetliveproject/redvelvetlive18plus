// backend/src/models/WalletChallenge.js
import mongoose from 'mongoose';

const { Schema, model, Types } = mongoose;

/**
 * Challenge para verificar que una wallet realmente pertenece a un usuario.
 * Se genera un mensaje firmado con personal_sign.
 */
const WalletChallengeSchema = new Schema(
  {
    userId:   { type: Types.ObjectId, ref: 'User', required: true, index: true },
    walletId: { type: Types.ObjectId, ref: 'Wallet', required: true, index: true },
    address:  {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: [/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address'],
      index: true,
    },
    challenge: { type: String, required: true },  // mensaje exacto a firmar
    used:      { type: Boolean, default: false, index: true },
    expiresAt: { type: Date, required: true, index: true },
  },
  { timestamps: true }
);

// Solo un challenge activo por (userId, walletId) a la vez
WalletChallengeSchema.index({ userId: 1, walletId: 1, used: 1 });

const WalletChallenge =
  mongoose.models.WalletChallenge || model('WalletChallenge', WalletChallengeSchema);

export default WalletChallenge;
