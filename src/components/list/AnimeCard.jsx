// src/components/HAnime/AnimeCard.jsx
"use client";

// 1. Import Link từ Next.js
import Link from "next/link";

export default function AnimeCard({ item }) {
  return (
    <Link
      href={`/anime/${item.id}`}
      // Xóa target="_blank" để mở ngay trong tab hiện tại
      className="bg-white dark:bg-zinc-900 rounded-lg shadow hover:scale-[1.03] transition p-2 flex flex-col h-full text-decoration-none"
    >
      {/* Thumbnail */}
      <div className="relative w-full aspect-[3/4] overflow-hidden rounded-md bg-zinc-200 dark:bg-zinc-800">
        <img
          src={item.thumbnail}
          alt={item.title}
          loading="lazy"
          className="w-full h-full object-cover"
        />
        {/* Badge Studio */}
        {item.studios?.[0] && (
          <span className="absolute top-1 right-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">
            {item.studios[0].name}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-grow mt-2">
        <p
          className="text-sm font-medium text-black dark:text-zinc-200 line-clamp-2 text-center mb-1"
          title={item.title}
        >
          {item.title}
        </p>

        {/* Metadata Footer */}
        <div className="flex justify-between items-center text-[10px] text-zinc-500 dark:text-zinc-400 px-1 mt-auto">
          <span>{item.releaseYear?.name || item.release_year}</span>
          <span className="flex items-center gap-1">
            👁️{" "}
            {new Intl.NumberFormat("en-US", {
              notation: "compact",
            }).format(item.views)}
          </span>
        </div>
      </div>
    </Link>
  );
}
