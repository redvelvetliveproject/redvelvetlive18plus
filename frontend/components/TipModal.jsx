// frontend/components/TipModal.jsx
import React, { useState } from "react";
import { ethers } from "ethers";
import { useToast } from "./ToastManager.jsx";

/**
 * 💎 TipModal – Enviar tips (ONECOP / USDT)
 *
 * Props:
 *  - isOpen: bool → controla visibilidad del modal
 *  - onClose: func → cierra el modal
 *  - model: objeto con { name, wallet }
 *  - defaultCurrency: string → "ONECOP" o "USDT"
 */
export default function TipModal({
  isOpen,
  onClose,
  model = {},
  defaultCurrency = "ONECOP",
}) {
  const [tipAmount, setTipAmount] = useState("");
  const [sending, setSending] = useState(false);
  const { addToast } = useToast(); // ✅ Notificaciones visuales

  if (!isOpen) return null;

  // 🔐 Configuración de contratos (ajusta si usas otras direcciones)
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

  // ⚙️ Enviar tip con Web3
  async function sendTip(currency = defaultCurrency) {
    try {
      if (!window.ethereum) {
        addToast({
          message: "🚫 Por favor instala MetaMask para continuar.",
          type: "error",
        });
        return;
      }

      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const { address, decimals } = CONTRACTS[currency];
      const abi = [
        "function transfer(address to, uint256 amount) public returns (bool)",
      ];
      const contract = new ethers.Contract(address, abi, signer);

      const amount = ethers.parseUnits(tipAmount || "0", decimals);
      if (amount <= 0) {
        addToast({ message: "⚠️ Ingresa un monto válido.", type: "warning" });
        return;
      }

      setSending(true);
      addToast({
        message: `⏳ Enviando ${tipAmount} ${currency}...`,
        type: "info",
      });

      const tx = await contract.transfer(model.wallet, amount);
      await tx.wait();

      addToast({
        message: `✅ Tip enviado con éxito (${tipAmount} ${currency}) a ${model.name}!`,
        type: "success",
      });

      setTipAmount("");
      onClose();
    } catch (err) {
      console.error("❌ Error al enviar tip:", err);
      addToast({
        message: "❌ Error al enviar el tip. Verifica tu conexión o red BSC.",
        type: "error",
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white dark:bg-neutral-900 p-6 rounded-2xl w-full max-w-sm text-center shadow-2xl transform transition-all
                   border border-neutral-200 dark:border-neutral-700"
      >
        <h3 className="text-2xl font-semibold mb-4 text-neutral-900 dark:text-white">
          💎 Enviar tip a {model.name || "la modelo"}
        </h3>

        <input
          type="number"
          min="0"
          step="0.01"
          value={tipAmount}
          onChange={(e) => setTipAmount(e.target.value)}
          placeholder="Monto"
          className="w-full p-3 border rounded-lg mb-4 text-center 
                     dark:bg-neutral-800 dark:text-white border-neutral-300 dark:border-neutral-700 focus:ring-2 focus:ring-red-500 outline-none transition"
        />

        <div className="flex gap-3 justify-center mb-4">
          <button
            onClick={() => sendTip("ONECOP")}
            disabled={sending}
            className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg font-semibold disabled:opacity-50 transition"
          >
            💛 ONECOP
          </button>
          <button
            onClick={() => sendTip("USDT")}
            disabled={sending}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold disabled:opacity-50 transition"
          >
            💚 USDT
          </button>
        </div>

        <button
          onClick={onClose}
          disabled={sending}
          className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 text-sm mt-2"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

