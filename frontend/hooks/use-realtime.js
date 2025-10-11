// frontend/hooks/use-realtime.js
// Capa WebSocket/SSE con reconexión inteligente y eventos extendidos

export function createRealtime({
  url,
  protocols,
  useEventSource = false,
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
    emit('connecting');
    if (useEventSource) {
      es = new EventSource(url, { withCredentials: true });
      es.onopen = () => {
        tries = 0;
        emit('open');
      };
      es.onmessage = (e) => parseMessage(e.data);
      es.onerror = () => handleReconnect('SSE error');
      return;
    }

    ws = new WebSocket(url, protocols);
    ws.onopen = () => {
      tries = 0;
      emit('open');
      if (tries > 0) emit('reconnected');
    };
    ws.onmessage = (e) => parseMessage(e.data);
    ws.onerror = (e) => emit('error', e);
    ws.onclose = () => handleReconnect('closed');
  }

  function handleReconnect(reason) {
    emit('closed', reason);
    if (reconnect && tries < maxRetries && !closed) {
      tries++;
      const wait = backoffMs * tries;
      emit('reconnecting', { attempt: tries, wait });
      setTimeout(connect, wait);
    }
  }

  function send(obj) {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.warn('[Realtime] Intento de enviar sin conexión.');
      return false;
    }
    ws.send(typeof obj === 'string' ? obj : JSON.stringify(obj));
    return true;
  }

  function close() {
    closed = true;
    try { ws?.close(); } catch {}
    try { es?.close?.(); } catch {}
  }

  function readyState() {
    return ws?.readyState ?? (es ? (es.readyState === 1 ? 1 : 0) : 0);
  }

  // iniciar conexión
  connect();

  return { on, send, close, readyState };
}
