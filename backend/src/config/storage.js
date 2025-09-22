// backend/src/config/storage.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from './logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DRIVER = (process.env.STORAGE_DRIVER || 'local').toLowerCase();

let S3 = null;
let s3Client = null;

if (DRIVER === 's3') {
  const sdk = await import('@aws-sdk/client-s3');
  S3 = sdk;
  const endpoint = process.env.S3_ENDPOINT || undefined;
  s3Client = new S3.S3Client({
    region: process.env.S3_REGION || 'auto',
    endpoint,
    forcePathStyle: !!endpoint, // R2 necesita path-style
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY || '',
      secretAccessKey: process.env.S3_SECRET_KEY || '',
    },
  });
  logger.info(`[storage] Usando driver S3/R2 en bucket ${process.env.S3_BUCKET}`);
} else {
  logger.info('[storage] Usando driver local');
}

const LOCAL_DIR = path.resolve(
  process.env.LOCAL_UPLOAD_DIR || path.join(__dirname, '../../uploads')
);

function ensureLocalDir() {
  if (!fs.existsSync(LOCAL_DIR)) fs.mkdirSync(LOCAL_DIR, { recursive: true });
}

export async function upload({ key, body, contentType }) {
  if (!key) throw new Error('key requerido');
  if (!body) throw new Error('body requerido');

  if (DRIVER === 's3') {
    const Bucket = process.env.S3_BUCKET;
    if (!Bucket) throw new Error('S3_BUCKET requerido');

    await s3Client.send(
      new S3.PutObjectCommand({
        Bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
        ACL: 'private',
      })
    );

    const url = (process.env.S3_PUBLIC_BASE_URL
      ? `${process.env.S3_PUBLIC_BASE_URL}/${key}`
      : `s3://${Bucket}/${key}`);

    return { ok: true, key, url };
  }

  ensureLocalDir();
  const dest = path.join(LOCAL_DIR, key);
  const dir = path.dirname(dest);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  if (Buffer.isBuffer(body)) {
    fs.writeFileSync(dest, body);
  } else {
    await new Promise((resolve, reject) => {
      const ws = fs.createWriteStream(dest);
      body.pipe(ws).on('finish', resolve).on('error', reject);
    });
  }

  return { ok: true, key, url: `/uploads/${key}` };
}

export async function getObject({ key }) {
  if (DRIVER === 's3') {
    const Bucket = process.env.S3_BUCKET;
    const out = await s3Client.send(
      new S3.GetObjectCommand({ Bucket, Key: key })
    );
    return Buffer.from(await out.Body.transformToByteArray());
  }
  const filePath = path.join(LOCAL_DIR, key);
  return fs.readFileSync(filePath);
}

export async function remove({ key }) {
  if (DRIVER === 's3') {
    const Bucket = process.env.S3_BUCKET;
    await s3Client.send(new S3.DeleteObjectCommand({ Bucket, Key: key }));
    return { ok: true };
  }
  const filePath = path.join(LOCAL_DIR, key);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  return { ok: true };
}
