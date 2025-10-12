// frontend/components/ModelFilterBar.jsx
import React from "react";

export default function ModelFilterBar({ filters, setFilters }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
      {/* 🔍 Buscador */}
      <input
        type="text"
        placeholder="Buscar modelo..."
        value={filters.search}
        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        className="flex-1 min-w-[220px] p-2 border rounded-lg dark:bg-neutral-900 dark:text-neutral-100 border-neutral-300 dark:border-neutral-700"
      />

      {/* 🌍 Filtro por país */}
      <select
        value={filters.country}
        onChange={(e) => setFilters({ ...filters, country: e.target.value })}
        className="p-2 border rounded-lg dark:bg-neutral-900 dark:text-neutral-100 border-neutral-300 dark:border-neutral-700"
      >
        <option value="">🌎 País</option>
        <option value="CO">🇨🇴 Colombia</option>
        <option value="BR">🇧🇷 Brasil</option>
        <option value="MX">🇲🇽 México</option>
        <option value="US">🇺🇸 USA</option>
        <option value="ES">🇪🇸 España</option>
      </select>

      {/* 🈯 Idioma */}
      <select
        value={filters.locale}
        onChange={(e) => setFilters({ ...filters, locale: e.target.value })}
        className="p-2 border rounded-lg dark:bg-neutral-900 dark:text-neutral-100 border-neutral-300 dark:border-neutral-700"
      >
        <option value="">🈳 Idioma</option>
        <option value="es">Español</option>
        <option value="en">Inglés</option>
      </select>

      {/* 🔝 Orden */}
      <select
        value={filters.sort}
        onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
        className="p-2 border rounded-lg dark:bg-neutral-900 dark:text-neutral-100 border-neutral-300 dark:border-neutral-700"
      >
        <option value="popularity">🔥 Popularidad</option>
        <option value="followers">👥 Seguidores</option>
        <option value="tips">💎 Tips</option>
      </select>
    </div>
  );
}
