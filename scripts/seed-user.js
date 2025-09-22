import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../src/models/User.js';

const uri = process.env.MONGO_URI;
await mongoose.connect(uri);

const email = 'demo@rv.com';
const password = await bcrypt.hash('Passw0rd!', 10);

let u = await User.findOne({ email });
if (!u) {
  u = await User.create({ name: 'Demo', email, password });
}
console.log('Usuario listo:', u.email);
process.exit(0);

