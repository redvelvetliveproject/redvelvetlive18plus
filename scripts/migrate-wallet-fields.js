// scripts/migrate-wallet-fields.js
import mongoose from 'mongoose';

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/redvelvetlive';
await mongoose.connect(uri);

const col = mongoose.connection.collection('wallets');

await col.updateMany({ user: { $exists: true } }, { $rename: { user: 'userId' } });
await col.updateMany({ primary: { $exists: true } }, { $rename: { primary: 'isPrimary' } });
await col.updateMany({ verified: { $exists: true } }, { $rename: { verified: 'isVerified' } });

console.log('Migración completada');
process.exit(0);
