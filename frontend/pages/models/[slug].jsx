// frontend/pages/live/[slug].jsx
import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { Player } from "@livepeer/react";
import Layout from "../../components/Layout.jsx";
import TipInline from "../../components/TipInline.jsx";
import LoadingScreen from "../../components/LoadingScreen.jsx";
import { createApi } from "../../hooks/use-api.js";
import { useToast } from "../../components/ToastManager.jsx";

const api = createApi("https://api.redvelvetlive.com/api");

/**
 * 🎥 RedVelvetLive — LiveStreamDynamic (Versión PRO Final)
 * Página dinámica que reproduce transmisiones Livepeer
 * y permite enviar tips en ONECOP o USDT.
 */
export default function LiveStreamDynamic() {
  const router = useRouter();
  const { slug } = router.query;

  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  // 📡 Cargar modelo desde backend
  useEffect(() => {
    if (!slug) return;

    async function fetchModel() {
      try {
        const res = await api.get(`/models/${slug}`);
        if (!res || !res.name) {
          addToast({
            message: "⚠️ Modelo no encontrada o fuera de línea.",
            type: "warning",
          });
          setModel(null);
          return;
        }
        setModel(res);
      } catch (err) {
        console.error("❌ Error cargando transmisión:", err);
        addToast({
          message: "❌ No se pudo cargar la transmisión. Intenta más tarde.",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchModel();
  }, [slug, addToast]);

  // 🔄 Estado de carga
  if (loading) return <LoadingScreen message="Cargando transmisión en vivo..." />;

  // 🚫 Modelo no encontrado
  if (!model)
    return (
      <Layout>
        <div className="text-center py-24 px-6">
          <h2 className="text-3xl font-bold text-red-600 mb-3">
            ❌ Modelo no encontrada
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            Es posible que la transmisión haya finalizado o no exista.
          </p>
          <a
            href="/models"
            className="inline-block bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            🔙 Volver al explorador
          </a>
        </div>
      </Layout>
    );

  return (
    <Layout>
      <Head>
        <title>🎥 {model.name} | Transmisión en vivo - RedVelvetLive</title>
        <meta
          name="description"
          content={`Disfruta la transmisión en vivo de ${model.name} en RedVelvetLive. Envía tips instantáneos en ONECOP o USDT.`}
        />
        <meta property="og:title" content={`${model.name} | Live en RedVelvetLive`} />
        <meta
          property="og:description"
          content={`Mira la transmisión de ${model.name} y envíale tips con ONECOP o USDT.`}
        />
        <meta property="og:image" content={model.avatar?.large || "/assets/img/banner1.webp"} />
        <meta property="og:type" content="video.other" />
        <meta property="og:url" content={`https://redvelvetlive.com/live/${slug}`} />
      </Head>

      <section
        className="flex flex-col items-center justify-center w-full min-h-[85vh] relative"
        style={{
          background: "linear-gradient(to bottom, #0e0e0e 40%, #1a1a1a 100%)",
        }}
      >
        {/* 🎬 Player principal */}
        <div className="relative w-full max-w-5xl aspect-video rounded-xl overflow-hidden shadow-2xl fade-in-up">
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
                colors: { accent: "#e31221" },
              }}
            />
          ) : (
            <LoadingScreen message="Conectando transmisión..." />
          )}

          {/* 💎 TipInline — Envío rápido de tips */}
          <TipInline model={model} defaultCurrency="ONECOP" />
        </div>

        {/* 📜 Información de modelo */}
        <div className="text-center mt-8 px-4">
          <h1 className="text-3xl font-bold text-white mb-2 tracking-wide">
            {model.name}
          </h1>
          <p className="text-neutral-300 text-lg max-w-2xl mx-auto leading-relaxed">
            {model.bio || "Modelo en vivo en RedVelvetLive 💋"}
          </p>

          {/* 🌎 Info extra */}
          <div className="flex justify-center gap-6 mt-4 text-neutral-400 text-sm">
            {model.country && <p>🌍 {model.country}</p>}
            {model.locale && <p>🗣️ {model.locale.toUpperCase()}</p>}
          </div>
        </div>

        {/* 🔗 Enlaces sociales */}
        <div className="flex flex-wrap justify-center gap-4 mt-8 mb-10">
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
          {model.socialLinks?.onlyfans && (
            <a
              href={model.socialLinks.onlyfans}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition"
            >
              🔥 OnlyFans
            </a>
          )}
        </div>

        {/* 📲 Botones secundarios */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
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
      </section>
    </Layout>
  );
}


