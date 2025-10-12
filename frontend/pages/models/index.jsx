// frontend/pages/models/index.jsx
import React, { useEffect, useState, useRef } from "react";
import Head from "next/head";
import { createApi } from "../../hooks/use-api.js";
import Layout from "../../components/Layout.jsx";
import ModelCard from "../../components/ModelCard.jsx";
import ModelFilterBar from "../../components/ModelFilterBar.jsx";
import LoadingScreen from "../../components/LoadingScreen.jsx";

const api = createApi("https://api.redvelvetlive.com/api");

export default function ModelExplorer() {
  const [models, setModels] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    country: "",
    locale: "",
    sort: "popularity",
  });

  const loaderRef = useRef();

  // 🔎 Cargar modelos con filtros
  async function fetchModels(reset = false) {
    if (loading) return;
    setLoading(true);

    try {
      const query = new URLSearchParams({
        page,
        limit: 12,
        country: filters.country,
        locale: filters.locale,
        sort: filters.sort,
        search: filters.search,
      });

      const res = await api.get(`/models?${query.toString()}`);
      const newModels = res.results || [];

      setModels(reset ? newModels : [...models, ...newModels]);
      setHasMore(page < res.totalPages);
    } catch (err) {
      console.error("Error al cargar modelos:", err);
    } finally {
      setLoading(false);
    }
  }

  // 🧠 Efecto inicial + filtros reactivos
  useEffect(() => {
    fetchModels(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // 🔁 Scroll infinito
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1 }
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading]);

  // ⚡ Cargar más páginas
  useEffect(() => {
    if (page > 1) fetchModels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return (
    <Layout>
      <Head>
        <title>Modelos | RedVelvetLive 🌹</title>
        <meta
          name="description"
          content="Explora las modelos destacadas de RedVelvetLive. Filtra por país, idioma y popularidad. Descubre nuevos talentos cada día."
        />
      </Head>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-4 text-neutral-900 dark:text-neutral-100">
          🌹 Explora modelos de RedVelvetLive
        </h1>

        <ModelFilterBar filters={filters} setFilters={setFilters} />

        {models.length === 0 && !loading && (
          <p className="text-center text-neutral-500 mt-6">
            ❌ No se encontraron modelos con los filtros seleccionados.
          </p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {models.map((m) => (
            <ModelCard key={m.slug || m._id} model={m} />
          ))}
        </div>

        {loading && <LoadingScreen message="Cargando más modelos..." />}

        <div ref={loaderRef} className="h-10 mt-10"></div>

        {!hasMore && models.length > 0 && (
          <p className="text-center text-neutral-500 mt-6">
            🎉 No hay más modelos para mostrar.
          </p>
        )}
      </div>
    </Layout>
  );
}
