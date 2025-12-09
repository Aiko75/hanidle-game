// src/components/HAnime/index.jsx
"use client";

import data from "@/../public/data/ihentai_all.json";
import AnimeGrid from "@/components/list/AnimeGrid";
import FilterBar from "@/components/list/FilterBar";
import Link from "next/link"; // <--- IMPORT LINK
import { useMemo, useState } from "react";

export default function HAnimeList() {
  const [filters, setFilters] = useState({
    genre: "All",
    studio: "All",
    sortBy: "newest",
    minYear: "",
    maxYear: "",
    minView: "",
    maxView: "",
  });

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setFilters({
      genre: "All",
      studio: "All",
      sortBy: "newest",
      minYear: "",
      maxYear: "",
      minView: "",
      maxView: "",
    });
  };

  const options = useMemo(() => {
    const genres = new Set();
    const studios = new Set();
    data.forEach((item) => {
      item.genres?.forEach((g) => genres.add(g.name));
      item.studios?.forEach((s) => studios.add(s.name));
    });
    return {
      genres: ["All", ...Array.from(genres).sort()],
      studios: ["All", ...Array.from(studios).sort()],
    };
  }, []);

  const processedData = useMemo(() => {
    let result = [...data];

    if (filters.genre !== "All") {
      result = result.filter((item) =>
        item.genres?.some((g) => g.name === filters.genre)
      );
    }
    if (filters.studio !== "All") {
      result = result.filter((item) =>
        item.studios?.some((s) => s.name === filters.studio)
      );
    }

    result = result.filter((item) => {
      const itemYear = parseInt(item.releaseYear?.name || "0");
      const itemViews = item.views || 0;

      if (filters.minYear && itemYear < parseInt(filters.minYear)) return false;
      if (filters.maxYear && itemYear > parseInt(filters.maxYear)) return false;
      if (filters.minView && itemViews < parseInt(filters.minView))
        return false;
      if (filters.maxView && itemViews > parseInt(filters.maxView))
        return false;
      return true;
    });

    result.sort((a, b) => {
      const yearA = parseInt(a.releaseYear?.name || "0");
      const yearB = parseInt(b.releaseYear?.name || "0");
      const viewsA = a.views || 0;
      const viewsB = b.views || 0;

      switch (filters.sortBy) {
        case "newest":
          return yearB - yearA;
        case "oldest":
          return yearA - yearB;
        case "most_viewed":
          return viewsB - viewsA;
        case "least_viewed":
          return viewsA - viewsB;
        default:
          return 0;
      }
    });

    return result;
  }, [filters]);

  return (
    <div className="min-h-screen w-full bg-zinc-50 dark:bg-black flex justify-center py-10">
      <main className="w-full max-w-6xl px-4 sm:px-10">
        {/* --- HEADER & NAVIGATION --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-black dark:text-white mb-1">
              Thư viện HAnime
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400">
              Hiển thị:{" "}
              <span className="font-bold text-black dark:text-white">
                {processedData.length}
              </span>{" "}
              / {data.length} bộ
            </p>
          </div>

          {/* NÚT SANG TRANG RANDOM */}
          <Link
            href="/list/random"
            className="btn btn-primary btn-lg d-flex align-items-center gap-2 shadow fw-bold"
            style={{ borderRadius: "50px" }} // Thêm chút style inline cho bo tròn đẹp hơn
          >
            Gacha 210 Time :D
          </Link>
        </div>

        <FilterBar
          filters={filters}
          options={options}
          onUpdate={updateFilter}
          onReset={handleReset}
        />

        <AnimeGrid data={processedData} />
      </main>
    </div>
  );
}
