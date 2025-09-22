// backend/src/models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const { Schema, model } = mongoose;

const ROLES = ['client', 'model', 'admin'];
const LOCALES = ['es', 'en'];
const STATUSES = ['active', 'inactive', 'banned'];

const PreferencesSchema = new Schema(
  {
    locale: { type: String, enum: LOCALES, default: 'es' },
    notifications: {
      email: { type: Boolean, default: false },
      push: { type: Boolean, default: false },
    },
  },
  { _id: false }
);

const UserSchema = new Schema(
  {
    name: { type: String, trim: true, minlength: 2, maxlength: 120 },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email'],
    },
    password: {
      type: String,
      select: false,
      minlength: 8,
    },
    wallet: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
      match: [/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address'],
    },
    role: { type: String, enum: ROLES, default: 'client', index: true },
    locale: { type: String, enum: LOCALES, default: 'es' },
    status: { type: String, enum: STATUSES, default: 'active', index: true },

    preferences: { type: PreferencesSchema, default: undefined },

    lastLoginAt: { type: Date },
    loginCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Hash automático antes de guardar
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (e) {
    next(e);
  }
});

// Helpers
UserSchema.methods.setPassword = async function (plain) {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(plain, salt);
};
UserSchema.methods.comparePassword = async function (candidate = '') {
  return this.password ? bcrypt.compare(candidate, this.password) : false;
};
UserSchema.methods.toSafeJSON = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    wallet: this.wallet,
    role: this.role,
    locale: this.locale,
    status: this.status,
    preferences: this.preferences || undefined,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

// Índices
UserSchema.index({ email: 1 }, { unique: true, sparse: true });
UserSchema.index({ wallet: 1 }, { unique: true, sparse: true });
UserSchema.index({ role: 1, status: 1 });

const User = mongoose.models.User || model('User', UserSchema);
export default User;
