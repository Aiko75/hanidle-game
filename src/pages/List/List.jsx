"use client";

import data from "@/../public/data/ihentai_all.json";
import AnimeGrid from "@/components/list/AnimeGrid";
import FilterBar from "@/components/list/FilterBar";
import Link from "next/link";
import { useMemo, useState } from "react";

export default function HAnimeList() {
  const [searchTerm, setSearchTerm] = useState(""); // 1. State cho Search
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
    setSearchTerm(""); // Reset cả search
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

    // --- LOGIC LỌC THEO SEARCH TERM ---
    if (searchTerm.trim() !== "") {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter((item) => {
        const matchTitle = item.title?.toLowerCase().includes(lowerSearch);
        return matchTitle;
      });
    }

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
  }, [filters, searchTerm]); // Thêm searchTerm vào dependency

  return (
    <div className="min-h-screen w-full bg-zinc-50 flex justify-center py-10">
      <main className="w-full max-w-6xl px-4 sm:px-10">
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <Link
              href="/"
              className="btn btn-outline-secondary rounded-pill px-3 fw-bold btn-sm mb-2 d-inline-block"
            >
              <i className="bi bi-arrow-left"></i> Back
            </Link>
            <h1 className="text-3xl font-semibold text-black mb-1">
              Thư viện HAnime
            </h1>
            <p className="text-zinc-500">
              Hiển thị:{" "}
              <span className="font-bold text-black">
                {processedData.length}
              </span>{" "}
              / {data.length} bộ
            </p>
          </div>

          <Link
            href="/list/random"
            className="btn btn-primary btn-lg d-flex align-items-center gap-2 shadow fw-bold"
            style={{ borderRadius: "50px" }}
          >
            Gacha 210 Time :D
          </Link>
        </div>

        {/* --- SEARCH BAR UI --- */}
        <div className="mb-6">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <i className="bi bi-search text-zinc-400"></i>
            </div>
            <input
              type="text"
              className="w-full bg-white border border-zinc-200 rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all shadow-sm"
              placeholder="Tìm kiếm theo tên phim hoặc tiêu đề thay thế..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-400 hover:text-zinc-600"
              >
                <i className="bi bi-x-circle-fill"></i>
              </button>
            )}
          </div>
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
