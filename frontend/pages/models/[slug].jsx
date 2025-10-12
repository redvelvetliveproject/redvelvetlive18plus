// frontend/pages/models/[slug].jsx
import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Layout from "../../components/Layout.jsx";
import { createApi } from "../../hooks/use-api.js";
import LoadingScreen from "../../components/LoadingScreen.jsx";
import { ethers } from "ethers";

const api = createApi("https://api.redvelvetlive.com/api");

export default function ModelProfile() {
  const router = useRouter();
  const { slug } = router.query;

  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTipModal, setShowTipModal] = useState(false);
  const [tipAmount, setTipAmount] = useState("");
  const [sendingTip, setSendingTip] = useState(false);

  // 📡 Cargar modelo desde API
  useEffect(() => {
    if (!slug) return;
    const fetchModel = async () => {
      try {
        const res = await api.get(`/models/${slug}`);
        setModel(res);
      } catch (err) {
        console.error("Error al cargar el perfil del modelo:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchModel();
  }, [slug]);

  // 💰 Enviar tip (ONECOP o USDT)
  async function sendTip(currency = "ONECOP") {
    try {
      if (!window.ethereum) {
        alert("Instala MetaMask para enviar tips");
        return;
      }

      setSendingTip(true);

      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // 💡 Dirección del contrato (debes colocar la correcta de ONECOP o USDT)
      const contractAddress =
        currency === "ONECOP"
          ? "0x61028e69fe97c7a4ddc4753bc6188d8cdbd6befe" // ONECOP Testnet
          : "0x55d398326f99059ff775485246999027b3197955"; // USDT BSC Mainnet

      // ABI mínima para transferencias
      const abi = [
        "function transfer(address to, uint256 amount) public returns (bool)",
      ];

      const contract = new ethers.Contract(contractAddress, abi, signer);

      const amount = ethers.parseUnits(tipAmount, 18); // 18 decimales
      const tx = await contract.transfer(model.wallet, amount);

      await tx.wait();

      alert(
        `✅ Tip enviado con éxito (${tipAmount} ${currency}) a ${model.name}!`
      );
      setShowTipModal(false);
      setTipAmount("");
    } catch (err) {
      console.error("Error al enviar tip:", err);
      alert("❌ Error al enviar el tip.");
    } finally {
      setSendingTip(false);
    }
  }

  if (loading) return <LoadingScreen message="Cargando perfil..." />;

  if (!model)
    return (
      <Layout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200">
            ❌ Modelo no encontrada
          </h2>
          <p className="text-neutral-500 mt-2">
            El perfil que intentas ver no existe o fue eliminado.
          </p>
        </div>
      </Layout>
    );

  const { name, bio, avatar, country, locale, stats, socialLinks, gallery } =
    model;

  return (
    <Layout>
      <Head>
        <title>{`${name} 🌹 | RedVelvetLive`}</title>
        <meta
          name="description"
          content={`Perfil de ${name} en RedVelvetLive. ${bio || ""}`}
        />
        <meta property="og:title" content={`${name} 🌹 | RedVelvetLive`} />
        <meta
          property="og:description"
          content={`Perfil de ${name}. Descubre su contenido exclusivo en RedVelvetLive.`}
        />
        <meta
          property="og:image"
          content={avatar?.large || "/assets/default-avatar.webp"}
        />
      </Head>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* 🖼️ Avatar */}
          <div className="md:w-1/3 text-center">
            <img
              src={avatar?.large || "/assets/default-avatar.webp"}
              alt={name}
              className="w-64 h-64 object-cover rounded-xl mx-auto border border-neutral-300 dark:border-neutral-700"
            />
            <h1 className="text-3xl font-bold mt-4 text-neutral-900 dark:text-neutral-100">
              {name}
            </h1>
            <p className="text-neutral-500">{country || "🌍 Desconocido"}</p>
            <p className="text-sm text-neutral-400 italic">
              Idioma: {locale?.toUpperCase() || "ES"}
            </p>

            {/* 💎 Botones de interacción */}
            <div className="flex justify-center gap-3 mt-5">
              <button
                onClick={() => setShowTipModal(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold"
              >
                💎 Enviar Tip
              </button>
              <button className="bg-neutral-800 hover:bg-neutral-900 text-white px-4 py-2 rounded-lg font-semibold">
                ⭐ Seguir
              </button>
            </div>
          </div>

          {/* 🧾 Información */}
          <div className="md:w-2/3">
            <h2 className="text-xl font-semibold mb-2 text-neutral-800 dark:text-neutral-200">
              Biografía
            </h2>
            <p className="text-neutral-700 dark:text-neutral-400 leading-relaxed mb-4">
              {bio || "Sin biografía disponible."}
            </p>

            {/* 🌐 Redes sociales */}
            <div className="flex gap-4 mb-4">
              {socialLinks?.instagram && (
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="text-pink-500 hover:underline"
                >
                  📸 Instagram
                </a>
              )}
              {socialLinks?.twitter && (
                <a
                  href={socialLinks.twitter}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sky-500 hover:underline"
                >
                  🐦 Twitter
                </a>
              )}
              {socialLinks?.onlyfans && (
                <a
                  href={socialLinks.onlyfans}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  🔥 OnlyFans
                </a>
              )}
            </div>

            {/* 📊 Métricas */}
            <div className="flex gap-6 text-neutral-600 dark:text-neutral-300 mb-6">
              <p>👥 Seguidores: {stats?.followers || 0}</p>
              <p>💎 Tips: {stats?.tips || 0}</p>
              <p>⭐ Popularidad: {model.popularity || 0}</p>
            </div>

            {/* 🖼️ Galería */}
            <h3 className="text-lg font-semibold mb-3 text-neutral-800 dark:text-neutral-200">
              Galería
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {gallery?.length ? (
                gallery.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt={`Foto ${i + 1} de ${name}`}
                    className="rounded-lg object-cover w-full h-40 border border-neutral-200 dark:border-neutral-800 hover:scale-105 transition-transform duration-200"
                    loading="lazy"
                  />
                ))
              ) : (
                <p className="text-neutral-500 col-span-full">
                  Sin fotos públicas disponibles.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 💰 Modal de Tip */}
      {showTipModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl max-w-sm w-full shadow-xl text-center">
            <h3 className="text-xl font-semibold mb-4 text-neutral-800 dark:text-neutral-100">
              Enviar tip a {name}
            </h3>
            <input
              type="number"
              min="0"
              placeholder="Monto"
              value={tipAmount}
              onChange={(e) => setTipAmount(e.target.value)}
              className="w-full p-2 border rounded-lg mb-3 text-center dark:bg-neutral-800 dark:text-neutral-100 border-neutral-300 dark:border-neutral-700"
            />
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => sendTip("ONECOP")}
                disabled={sendingTip}
                className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg font-semibold disabled:opacity-50"
              >
                💛 ONECOP
              </button>
              <button
                onClick={() => sendTip("USDT")}
                disabled={sendingTip}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold disabled:opacity-50"
              >
                💚 USDT
              </button>
            </div>
            <button
              onClick={() => setShowTipModal(false)}
              className="mt-4 text-neutral-500 hover:underline"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}
