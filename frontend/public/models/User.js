// backend/src/models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, maxlength: 120 },
    email: { type: String, trim: true, lowercase: true, unique: true, sparse: true },
    // Si tu flujo permite login solo por wallet, el email puede ser opcional.
    password: { type: String, minlength: 6, select: false }, // nunca se devuelve por defecto
    wallet: { type: String, trim: true, lowercase: true, index: true }, // opcional Web3
    role: { type: String, enum: ['client', 'model', 'admin'], default: 'client', index: true },
    isActive: { type: Boolean, default: true, index: true },

    // Campos opcionales futuros (los dejamos listos):
    // referralCode: { type: String, unique: true, sparse: true },
    // referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    // locale: { type: String, default: 'es' },
  },
  { timestamps: true }
);

// Índices útiles para búsquedas típicas
UserSchema.index({ email: 1 });
UserSchema.index({ wallet: 1 });
UserSchema.index({ role: 1, isActive: 1 });

// Hash de password solo si se modifica
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Método para comparar password en login
UserSchema.methods.comparePassword = async function (candidate) {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

// Método seguro para exponer el usuario (sin password ni campos sensibles)
UserSchema.methods.toSafeJSON = function () {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    wallet: this.wallet,
    role: this.role,
    isActive: this.isActive,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export default mongoose.model('User', UserSchema);
