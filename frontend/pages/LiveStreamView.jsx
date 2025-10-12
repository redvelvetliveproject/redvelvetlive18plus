// frontend/pages/LiveStreamView.jsx
import React from "react";
import Head from "next/head";
import Layout from "../components/Layout.jsx";
import TipInline from "../components/TipInline.jsx";
import { Player } from "@livepeer/react";
import LoadingScreen from "../components/LoadingScreen.jsx";

/**
 * 🎥 Página principal de transmisión en vivo (LiveStreamView)
 * - Usa el componente Player de Livepeer
 * - Incluye overlay de TipInline (ONECOP / USDT)
 * - Ideal para pruebas y vista pública
 */
export default function LiveStreamView() {
  // 🔧 Modelo de ejemplo (puedes reemplazar con datos reales del backend)
  const model = {
    name: "Valeria",
    wallet: "0x77d35401C8CaD5A6E7b4457755974DC3d7fdD5c0",
    playbackId: "b17e4d8a-xxxx-xxxx-xxxx-xxxxxxxxxxxx", // Ejemplo (Livepeer)
    bio: "Transmisión en vivo desde RedVelvetLive ❤️",
  };

  return (
    <Layout>
      <Head>
        <title>RedVelvetLive 🎥 | Transmisión en vivo de {model.name}</title>
        <meta
          name="description"
          content={`Disfruta la transmisión en vivo de ${model.name} en RedVelvetLive. Envía tips en ONECOP o USDT al instante.`}
        />
      </Head>

      {/* Contenedor principal */}
      <div
        className="flex flex-col items-center justify-center w-full min-h-[80vh] bg-black relative"
        style={{
          background:
            "linear-gradient(to bottom, #0f0f0f 40%, #1a1a1a 100%)",
        }}
      >
        {/* Player */}
        <div className="relative w-full max-w-5xl aspect-video rounded-xl overflow-hidden shadow-2xl">
          {model.playbackId ? (
            <Player
              playbackId={model.playbackId}
              autoPlay
              muted={false}
              showPipButton
              priority
              objectFit="cover"
            />
          ) : (
            <LoadingScreen message="Conectando transmisión..." />
          )}

          {/* Overlay: TipInline flotante */}
          <TipInline model={model} />
        </div>

        {/* Información del modelo */}
        <div className="text-center mt-6 px-4">
          <h1 className="text-3xl font-semibold text-white mb-2">
            {model.name}
          </h1>
          <p className="text-neutral-300 text-lg max-w-2xl mx-auto">
            {model.bio}
          </p>
        </div>

        {/* Botones secundarios */}
        <div className="flex gap-4 mt-6">
          <a
            href="/models"
            className="bg-neutral-800 hover:bg-neutral-700 text-white px-5 py-2 rounded-lg font-medium transition"
          >
            🔙 Volver al explorador
          </a>
          <button
            onClick={() => window.scrollTo(0, 0)}
            className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg font-semibold transition"
          >
            🔝 Subir al inicio
          </button>
        </div>
      </div>
    </Layout>
  );
}
