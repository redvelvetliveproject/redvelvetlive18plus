// frontend/hooks/use-realtime.js
// Capa simple para WebSocket (o EventSource) con reconexión automática

export function createRealtime({
  url,
  protocols,
  useEventSource = false, // si prefieres SSE
  reconnect = true,
  maxRetries = 5,
  backoffMs = 1000,
} = {}) {
  if (!url) throw new Error('Realtime: url requerida');

  let ws = null;
  let es = null;
  let tries = 0;
  let closed = false;

  const handlers = new Map(); // type -> Set(callback)

  function on(type, cb) {
    if (!handlers.has(type)) handlers.set(type, new Set());
    handlers.get(type).add(cb);
    return () => handlers.get(type)?.delete(cb);
  }

  function emit(type, data) {
    const set = handlers.get(type);
    if (set) for (const cb of set) cb(data);
  }

  function parseMessage(raw) {
    try {
      const msg = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (msg && msg.type) emit(msg.type, msg.data);
      else emit('message', msg);
    } catch {
      emit('message', raw);
    }
  }

  function connect() {
    if (useEventSource) {
      es = new EventSource(url, { withCredentials: true });
      es.onopen = () => { tries = 0; emit('open'); };
      es.onmessage = (e) => parseMessage(e.data);
      es.onerror = () => {
        emit('error', new Error('SSE error'));
        if (reconnect && tries < maxRetries && !closed) {
          tries++;
          setTimeout(connect, backoffMs * tries);
        } else {
          emit('closed');
        }
      };
      return;
    }

    ws = new WebSocket(url, protocols);
    ws.onopen = () => { tries = 0; emit('open'); };
    ws.onmessage = (e) => parseMessage(e.data);
    ws.onerror = (e) => emit('error', e);
    ws.onclose = () => {
      emit('closed');
      if (reconnect && tries < maxRetries && !closed) {
        tries++;
        setTimeout(connect, backoffMs * tries);
      }
    };
  }

  function send(obj) {
    if (!ws || ws.readyState !== WebSocket.OPEN) return false;
    ws.send(typeof obj === 'string' ? obj : JSON.stringify(obj));
    return true;
  }

  function close() {
    closed = true;
    try { ws?.close(); } catch {}
    try { es?.close?.(); } catch {}
  }

  // iniciar conexión
  connect();

  return { on, send, close };
}

