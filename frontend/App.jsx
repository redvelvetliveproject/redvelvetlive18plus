// frontend/App.jsx
import React from "react";
import Example from "./components/Example.jsx";
import Dashboard from "./components/Dashboard.jsx";
import { ToastProvider } from "./components/ToastManager.jsx";

/**
 * 🌹 RedVelvetLive Frontend
 * Estructura base de la app con soporte global para notificaciones (toasts).
 * Compatible con Tailwind + modo oscuro + animaciones framer-motion.
 */

export default function App() {
  return (
    <ToastProvider>
      <main className="min-h-screen bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 flex flex-col items-center justify-center p-6">
        <header className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-red-600 mb-2">
            ❤️ RedVelvetLive Frontend
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 text-sm">
            Plataforma Web3 con pagos instantáneos y contenido sin bloqueos
          </p>
        </header>

        <section className="w-full max-w-3xl space-y-6">
          <Example />
          <Dashboard />
        </section>

        <footer className="mt-10 text-center text-xs text-neutral-500 dark:text-neutral-500">
          © {new Date().getFullYear()} RedVelvetLive – Todos los derechos reservados.
        </footer>
      </main>
    </ToastProvider>
  );
}
