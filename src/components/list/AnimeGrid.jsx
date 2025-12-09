// src/components/HAnime/AnimeGrid.jsx
"use client";
import AnimeCard from "./AnimeCard";

export default function AnimeGrid({ data }) {
  if (data.length === 0) {
    return (
      <div className="text-center py-20 text-zinc-500 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
        Không tìm thấy bộ nào phù hợp với bộ lọc hiện tại.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
      {data.map((item, index) => (
        // Dùng item.id làm key nếu có, fallback là index
        <AnimeCard key={item.id || index} item={item} />
      ))}
    </div>
  );
}
