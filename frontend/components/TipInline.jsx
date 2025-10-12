// frontend/components/TipInline.jsx
import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useToast } from "./ToastManager.jsx";

/**
 * 💎 TipInline – versión ligera para transmisiones en vivo
 * Ideal para Livepeer u otros players.
 *
 * Props:
 *  - model: { name, wallet }
 *  - defaultCurrency: "ONECOP" | "USDT"
 *  - autoHideMs: tiempo en ms antes de ocultar (por defecto 4000)
 */
export default function TipInline({
  model = {},
  defaultCurrency = "ONECOP",
  autoHideMs = 4000,
}) {
  const [amount, setAmount] = useState("");
  const [sending, setSending] = useState(false);
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const { addToast } = useToast();

  // 🧠 Contratos configurados (actualiza direcciones si cambian)
  const CONTRACTS = {
    ONECOP: {
      address: "0x61028e69fe97c7a4ddc4753bc6188d8cdbd6befe", // ✅ ONECOP Testnet
      decimals: 18,
    },
    USDT: {
      address: "0x55d398326f99059ff775485246999027b3197955", // ✅ USDT BSC Mainnet
      decimals: 18,
    },
  };

  // 🎛️ Mostrar/ocultar automáticamente
  const show = () => {
    setVisible(true);
    setProgress(0);
  };

  useEffect(() => {
    if (!visible) return;
    const timer = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(timer);
          setVisible(false);
          return 100;
        }
        return p + 100 / (autoHideMs / 100);
      });
    }, 100);
    return () => clearInterval(timer);
  }, [visible, autoHideMs]);

  // ⚙️ Enviar tip
  async function sendTip(currency = defaultCurrency) {
    try {
      if (!window.ethereum) {
        addToast({ message: "🚫 Instala MetaMask para enviar tips.", type: "error" });
        return;
      }

      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const { address, decimals } = CONTRACTS[currency];
      const abi = ["function transfer(address to, uint256 amount) public returns (bool)"];
      const contract = new ethers.Contract(address, abi, signer);

      const amountWei = ethers.parseUnits(amount || "0", decimals);
      if (amountWei <= 0n) {
        addToast({ message: "⚠️ Ingresa un monto válido.", type: "warning" });
        return;
      }

      setSending(true);
      addToast({ message: `⏳ Enviando ${amount} ${currency}...`, type: "info" });

      const tx = await contract.transfer(model.wallet, amountWei);
      await tx.wait();

      addToast({
        message: `✅ Tip enviado a ${model.name} (${amount} ${currency})`,
        type: "success",
      });
      setAmount("");
      setVisible(false);
    } catch (err) {
      console.error("Error tip:", err);
      addToast({
        message: "❌ No se pudo enviar el tip. Verifica tu red o conexión.",
        type: "error",
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      {/* 🔘 Botón flotante que abre el tip rápido */}
      <button
        onClick={show}
        className="fixed bottom-5 right-5 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700
                   text-white font-bold py-3 px-5 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-red-400
                   transition-all duration-300 z-50"
      >
        💎 Tip
      </button>

      {/* 💬 Caja flotante */}
      {visible && (
        <div
          className="fixed bottom-20 right-5 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700
                     rounded-2xl p-4 w-72 shadow-2xl animate-fadeIn z-50"
        >
          <h4 className="text-sm font-semibold mb-2 text-neutral-900 dark:text-neutral-100">
            Enviar tip a {model.name || "la modelo"}
          </h4>

          <input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Monto"
            className="w-full p-2 border rounded-lg text-center mb-3 dark:bg-neutral-800 dark:text-white 
                       border-neutral-300 dark:border-neutral-700 focus:ring-2 focus:ring-red-500 outline-none"
          />

          <div className="flex justify-center gap-3">
            <button
              onClick={() => sendTip("ONECOP")}
              disabled={sending}
              className="bg-yellow-500 hover:bg-yellow-600 text-black px-3 py-1 rounded-md font-semibold text-sm disabled:opacity-50"
            >
              💛 ONECOP
            </button>
            <button
              onClick={() => sendTip("USDT")}
              disabled={sending}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md font-semibold text-sm disabled:opacity-50"
            >
              💚 USDT
            </button>
          </div>

          {/* Barra de progreso visual */}
          <div className="relative w-full h-1 bg-neutral-200 dark:bg-neutral-700 mt-3 rounded-full overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full bg-red-600 transition-all duration-100 linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </>
  );
}
