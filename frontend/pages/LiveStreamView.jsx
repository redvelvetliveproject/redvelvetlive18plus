// frontend/pages/LiveStreamView.jsx
import React, { useEffect, useState } from "react";
import Head from "next/head";
import { Player } from "@livepeer/react";
import Layout from "../components/Layout.jsx";
import TipInline from "../components/TipInline.jsx";
import LoadingScreen from "../components/LoadingScreen.jsx";
import { createApi } from "../hooks/use-api.js";
import { useToast } from "../components/ToastManager.jsx";

const api = createApi("https://api.redvelvetlive.com/api");

/**
 * 🎥 LiveStreamView.jsx (Versión PRO)
 * - Integra Livepeer Player + Web3 Tips (ONECOP / USDT)
 * - Compatible con datos reales del backend (slug) o modo demo
 * - Diseño responsivo, modo oscuro y SEO optimizado
 */
export default function LiveStreamView({ slug = "rvl-valeria" }) {
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  // 🧠 Cargar datos de modelo desde el backend o usar datos de ejemplo
  useEffect(() => {
    async function fetchModel() {
      try {
        const res = await api.get(`/models/${slug}`);
        if (res && res.name) {
          setModel(res);
        } else {
          // ⚙️ Fallback de ejemplo si no hay modelo en el backend
          setModel({
            name: "Valeria",
            wallet: "0x77d35401C8CaD5A6E7b4457755974DC3d7fdD5c0",
            playbackId: "b17e4d8a-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
            bio: "Transmisión en vivo desde RedVelvetLive ❤️",
            socialLinks: {
              instagram: "https://instagram.com/redvelvetlive",
              twitter: "https://twitter.com/redvelvetlive",
            },
          });
          addToast({
            message: "⚠️ Modo demostración: usando datos de ejemplo.",
            type: "info",
          });
        }
      } catch (err) {
        console.error("❌ Error cargando modelo:", err);
        addToast({
          message: "❌ No se pudo cargar la transmisión.",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    }
    fetchModel();
  }, [slug, addToast]);

  if (loading) return <LoadingScreen message="Cargando transmisión en vivo..." />;

  if (!model)
    return (
      <Layout>
        <div className="text-center py-20">
          <h2 className="text-red-600 text-2xl font-bold mb-2">
            Modelo no encontrada
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400">
            Es posible que la transmisión haya finalizado o no exista.
          </p>
          <a
            href="/models"
            className="inline-block mt-4 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg font-semibold transition"
          >
            🔙 Volver al explorador
          </a>
        </div>
      </Layout>
    );

  return (
    <Layout>
      <Head>
        <title>RedVelvetLive 🎥 | Transmisión de {model.name}</title>
        <meta
          name="description"
          content={`Disfruta la transmisión en vivo de ${model.name} en RedVelvetLive. Envía tips al instante con ONECOP o USDT.`}
        />
      </Head>

      <div
        className="flex flex-col items-center justify-center w-full min-h-[80vh] bg-black relative"
        style={{
          background: "linear-gradient(to bottom, #0f0f0f 40%, #1a1a1a 100%)",
        }}
      >
        {/* 🎬 Player principal */}
        <div className="relative w-full max-w-5xl aspect-video rounded-xl overflow-hidden shadow-2xl">
          {model.playbackId ? (
            <Player
              playbackId={model.playbackId}
              title={model.name}
              autoPlay
              muted={false}
              loop
              showPipButton
              priority
              objectFit="cover"
              theme={{
                borderStyles: { containerBorderStyle: "hidden" },
                radii: { containerBorderRadius: "12px" },
              }}
            />
          ) : (
            <LoadingScreen message="Conectando transmisión..." />
          )}

          {/* 💎 Overlay TipInline (ONECOP / USDT) */}
          <TipInline model={model} defaultCurrency="ONECOP" />
        </div>

        {/* 📜 Información del modelo */}
        <div className="text-center mt-6 px-4">
          <h1 className="text-3xl font-semibold text-white mb-2">
            {model.name}
          </h1>
          <p className="text-neutral-300 text-lg max-w-2xl mx-auto">
            {model.bio || "Modelo de RedVelvetLive en transmisión en vivo."}
          </p>
        </div>

        {/* 🔗 Enlaces y acciones */}
        <div className="flex flex-wrap justify-center gap-4 mt-6 mb-10">
          {model.socialLinks?.instagram && (
            <a
              href={model.socialLinks.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-pink-600 hover:bg-pink-700 text-white px-5 py-2 rounded-lg font-medium transition"
            >
              📸 Instagram
            </a>
          )}
          {model.socialLinks?.twitter && (
            <a
              href={model.socialLinks.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-sky-600 hover:bg-sky-700 text-white px-5 py-2 rounded-lg font-medium transition"
            >
              🐦 Twitter
            </a>
          )}
          <a
            href="/models"
            className="bg-neutral-800 hover:bg-neutral-700 text-white px-5 py-2 rounded-lg font-medium transition"
          >
            🔙 Volver al explorador
          </a>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg font-semibold transition"
          >
            🔝 Subir al inicio
          </button>
        </div>
      </div>
    </Layout>
  );
}

