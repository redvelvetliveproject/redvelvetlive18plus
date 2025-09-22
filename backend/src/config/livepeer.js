// backend/src/services/livepeer.js
import logger from '../config/logger.js';
import env from '../config/env.js';

const BASE = env.LIVEPEER_BASE_URL;
const API_KEY = env.LIVEPEER_API_KEY;

function headers() {
  if (!API_KEY) {
    logger.error("LIVEPEER_API_KEY no está definido en .env");
    throw new Error('LIVEPEER_API_KEY requerido');
  }
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${API_KEY}`,
  };
}

export async function createStream({ name, profiles } = {}) {
  const res = await fetch(`${BASE}/stream`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      name: name || `rv-stream-${Date.now()}`,
      profiles: profiles || [
        { name: '720p', bitrate: 2000000, fps: 30, width: 1280, height: 720 },
        { name: '480p', bitrate: 1000000, fps: 30, width: 854, height: 480 },
      ],
      record: true,
    }),
  });
  if (!res.ok) {
    logger.error(`Error creando stream en Livepeer: ${res.status}`);
    throw new Error(`livepeer createStream HTTP ${res.status}`);
  }
  return res.json();
}

export async function getStream(streamId) {
  const res = await fetch(`${BASE}/stream/${encodeURIComponent(streamId)}`, {
    headers: headers(),
  });
  if (!res.ok) {
    logger.error(`Error obteniendo stream ${streamId}: ${res.status}`);
    throw new Error(`livepeer getStream HTTP ${res.status}`);
  }
  return res.json();
}

export async function getStreamStatus(streamId) {
  const res = await fetch(`${BASE}/stream/${encodeURIComponent(streamId)}/sessions`, {
    headers: headers(),
  });
  if (!res.ok) {
    logger.error(`Error obteniendo estado del stream ${streamId}: ${res.status}`);
    throw new Error(`livepeer status HTTP ${res.status}`);
  }
  return res.json();
}

export async function deleteStream(streamId) {
  const res = await fetch(`${BASE}/stream/${encodeURIComponent(streamId)}`, {
    method: 'DELETE',
    headers: headers(),
  });
  if (!res.ok) {
    logger.error(`Error eliminando stream ${streamId}: ${res.status}`);
    throw new Error(`livepeer delete HTTP ${res.status}`);
  }
  return { ok: true };
}
