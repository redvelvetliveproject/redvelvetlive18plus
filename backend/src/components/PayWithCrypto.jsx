import { useState } from 'react';

const API = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default function PayWithCrypto() {
  const [token, setToken] = useState("USDT"); // "USDT" | "ONECOP"
  const [amount, setAmount] = useState("5");
  const [order, setOrder] = useState(null);
  const [txHash, setTxHash] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const createOrder = async () => {
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      setError("El monto debe ser un número positivo.");
      return;
    }
    setError(""); setLoading(true);
    try {
      const res = await fetch(`${API}/api/payments/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, amount })
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Error creando orden");
      setOrder(json.order);
      setStatus(null);
      setTxHash("");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const submitTx = async () => {
    if (!order || !txHash) return;
    if (!/^0x([A-Fa-f0-9]{64})$/.test(txHash)) {
      setError("TxHash inválido.");
      return;
    }
    setError(""); setLoading(true);
    try {
      const res = await fetch(`${API}/api/payments/submit-tx`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.orderId, txHash })
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Error enviando Tx");
      setStatus(json.order);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const checkStatus = async () => {
    if (!order) return;
    setError(""); setLoading(true);
    try {
      const res = await fetch(`${API}/api/payments/${order.orderId}/status`);
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Error consultando estado");
      setStatus(json.order);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 520, margin: "20px auto", padding: 16, border: "1px solid #eee", borderRadius: 12 }}>
      <h3>Pagar con Cripto (USDT / ONECOP)</h3>

      <div style={{ display: "grid", gap: 12 }}>
        <label>
          Token:&nbsp;
          <select value={token} onChange={e => setToken(e.target.value)}>
            <option value="USDT">USDT (BSC)</option>
            <option value="ONECOP">ONECOP (BSC)</option>
          </select>
        </label>

        <label>
          Monto:&nbsp;
          <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="5" />
        </label>

        <button onClick={createOrder} disabled={loading}>
          {loading ? "Creando..." : "Crear orden"}
        </button>

        {order && (
          <div style={{ background: "#fafafa", padding: 12, borderRadius: 8 }}>
            <div><b>orderId:</b> {order.orderId}</div>
            <div><b>Token:</b> {order.token}</div>
            <div><b>Monto:</b> {order.amount}</div>
            <div><b>Treasury:</b> {order.treasury}</div>
            <div><b>Contrato:</b> {order.tokenContract}</div>
          </div>
        )}

        {order && (
          <>
            <label>
              Tx Hash (después de enviar a Treasury):
              <input
                value={txHash}
                onChange={e => setTxHash(e.target.value)}
                placeholder="0x..."
                style={{ width: "100%" }}
              />
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={submitTx} disabled={loading || !txHash}>Enviar TxHash</button>
              <button onClick={checkStatus} disabled={loading}>Consultar estado</button>
            </div>
          </>
        )}

        {status && (
          <div style={{ background: "#f0fff4", padding: 12, border: "1px solid #c6f6d5", borderRadius: 8 }}>
            <div><b>Status:</b> {status.status}</div>
            {status.seenConfirmations != null && (
              <div><b>Confirmaciones vistas:</b> {status.seenConfirmations}</div>
            )}
            {status.txHash && <div><b>Tx:</b> {status.txHash}</div>}
          </div>
        )}

        {error && <div style={{ color: "crimson" }}>⚠ {error}</div>}
      </div>
    </div>
  );
}
