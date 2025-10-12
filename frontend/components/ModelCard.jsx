// frontend/components/ModelCard.jsx
import React from "react";

export default function ModelCard({ model }) {
  const { name, slug, bio, avatar, stats, country, popularity } = model;

  return (
    <a
      href={`/models/${slug}`}
      className="block bg-white dark:bg-neutral-900 rounded-xl shadow-md hover:shadow-lg transition p-4 border border-neutral-200 dark:border-neutral-800"
    >
      <div className="relative w-full aspect-square mb-3 overflow-hidden rounded-lg">
        <img
          src={avatar?.large || "/assets/default-avatar.webp"}
          alt={`Perfil de ${name}`}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          loading="lazy"
        />
      </div>

      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 truncate">
        {name}
      </h3>

      <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 mb-2">
        {bio || "Modelo destacada en RedVelvetLive 💋"}
      </p>

      <div className="flex justify-between text-xs text-neutral-500 mt-2">
        <span>🌍 {country || "??"}</span>
        <span>⭐ {popularity}</span>
      </div>

      <div className="flex gap-3 text-xs mt-1 text-neutral-500 dark:text-neutral-400">
        <span>👥 {stats?.followers || 0}</span>
        <span>💎 {stats?.tips || 0}</span>
      </div>
    </a>
  );
}
