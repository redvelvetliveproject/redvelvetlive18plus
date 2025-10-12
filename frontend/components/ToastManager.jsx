// frontend/components/ToastManager.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

// Contexto global de notificaciones
const ToastContext = createContext();

export function useToast() {
  return useContext(ToastContext);
}

// 📦 Tipos de notificaciones
const toastStyles = {
  success: "bg-green-600 text-white",
  error: "bg-red-600 text-white",
  info: "bg-blue-600 text-white",
  warning: "bg-yellow-500 text-black",
};

// 🧩 Componente contenedor global
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  // 🕒 Remueve automáticamente tras 4s
  useEffect(() => {
    const timers = toasts.map((t) =>
      setTimeout(() => removeToast(t.id), 4000)
    );
    return () => timers.forEach(clearTimeout);
  }, [toasts]);

  // Agregar nuevo toast
  function addToast({ message, type = "info" }) {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  }

  // Eliminar toast manualmente
  function removeToast(id) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}

      {/* 📍Contenedor visual (posición inferior derecha) */}
      <div className="fixed bottom-5 right-5 flex flex-col gap-3 z-50">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3 }}
              className={`px-4 py-3 rounded-lg shadow-lg ${toastStyles[t.type]}`}
            >
              <div className="flex justify-between items-center">
                <p className="font-medium">{t.message}</p>
                <button
                  onClick={() => removeToast(t.id)}
                  className="ml-3 text-white/80 hover:text-white text-sm"
                >
                  ✕
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
