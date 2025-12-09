"use client";

import data from "@/../public/data/ihentai_all.json";
import { useMemo, useState } from "react";

export default function HAnimeList() {
  // --- STATE QUẢN LÝ FILTER & SORT ---
  const [filterGenre, setFilterGenre] = useState("All");
  const [filterStudio, setFilterStudio] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  // --- NEW STATE: RANGE FILTER (Between... And...) ---
  const [minYear, setMinYear] = useState("");
  const [maxYear, setMaxYear] = useState("");
  const [minView, setMinView] = useState("");
  const [maxView, setMaxView] = useState("");

  // --- 1. TRÍCH XUẤT OPTION (Giữ nguyên) ---
  const uniqueGenres = useMemo(() => {
    const genres = new Set();
    data.forEach((item) => item.genres?.forEach((g) => genres.add(g.name)));
    return ["All", ...Array.from(genres).sort()];
  }, []);

  const uniqueStudios = useMemo(() => {
    const studios = new Set();
    data.forEach((item) => item.studios?.forEach((s) => studios.add(s.name)));
    return ["All", ...Array.from(studios).sort()];
  }, []);

  // --- 2. LOGIC LỌC & SẮP XẾP ---
  const processedData = useMemo(() => {
    let result = [...data];

    // Filter: Genre
    if (filterGenre !== "All") {
      result = result.filter((item) =>
        item.genres?.some((g) => g.name === filterGenre)
      );
    }

    // Filter: Studio
    if (filterStudio !== "All") {
      result = result.filter((item) =>
        item.studios?.some((s) => s.name === filterStudio)
      );
    }

    // --- LOGIC MỚI: FILTER RANGE ---
    result = result.filter((item) => {
      // Lấy năm và view, ép kiểu an toàn
      const itemYear = parseInt(item.releaseYear?.name || "0");
      const itemViews = item.views || 0;

      // Check Năm (Min - Max)
      // Nếu user có nhập minYear và năm của item < minYear => Loại
      if (minYear !== "" && itemYear < parseInt(minYear)) return false;
      // Nếu user có nhập maxYear và năm của item > maxYear => Loại
      if (maxYear !== "" && itemYear > parseInt(maxYear)) return false;

      // Check View (Min - Max)
      if (minView !== "" && itemViews < parseInt(minView)) return false;
      if (maxView !== "" && itemViews > parseInt(maxView)) return false;

      return true;
    });

    // Sort (Giữ nguyên)
    result.sort((a, b) => {
      const yearA = parseInt(a.releaseYear?.name || "0");
      const yearB = parseInt(b.releaseYear?.name || "0");
      const viewsA = a.views || 0;
      const viewsB = b.views || 0;

      switch (sortBy) {
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
  }, [filterGenre, filterStudio, sortBy, minYear, maxYear, minView, maxView]); // Thêm dependency

  // Hàm Reset toàn bộ filter
  const handleReset = () => {
    setFilterGenre("All");
    setFilterStudio("All");
    setSortBy("newest");
    setMinYear("");
    setMaxYear("");
    setMinView("");
    setMaxView("");
  };

  return (
    <div className="min-h-screen w-full bg-zinc-50 dark:bg-black flex justify-center py-10">
      <main className="w-full max-w-6xl px-4 sm:px-10">
        <h1 className="text-3xl font-semibold text-black dark:text-white mb-2">
          Thư viện HAnime
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mb-6">
          Hiển thị:{" "}
          <span className="font-bold text-black dark:text-white">
            {processedData.length}
          </span>{" "}
          / {data.length} bộ
        </p>

        {/* --- THANH CÔNG CỤ (FILTER AREA) --- */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm mb-8 space-y-4">
          {/* Hàng 1: Dropdown cơ bản */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-xs font-bold uppercase text-zinc-500">
                Thể loại
              </label>
              <select
                value={filterGenre}
                onChange={(e) => setFilterGenre(e.target.value)}
                className="w-full p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-blue-500"
              >
                {uniqueGenres.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1 flex-1">
              <label className="text-xs font-bold uppercase text-zinc-500">
                Studio
              </label>
              <select
                value={filterStudio}
                onChange={(e) => setFilterStudio(e.target.value)}
                className="w-full p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-blue-500"
              >
                {uniqueStudios.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1 flex-1">
              <label className="text-xs font-bold uppercase text-zinc-500">
                Sắp xếp
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">Năm (Mới nhất)</option>
                <option value="oldest">Năm (Cũ nhất)</option>
                <option value="most_viewed">Views (Cao nhất)</option>
                <option value="least_viewed">Views (Thấp nhất)</option>
              </select>
            </div>
          </div>

          <hr className="border-zinc-200 dark:border-zinc-700" />

          {/* Hàng 2: Range Filters (Năm & Views) */}
          <div className="flex flex-col md:flex-row gap-6">
            {/* Filter Năm */}
            <div className="flex-1">
              <label className="text-xs font-bold uppercase text-zinc-500 mb-1 block">
                Năm phát hành
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Từ (2000)"
                  value={minYear}
                  onChange={(e) => setMinYear(e.target.value)}
                  className="w-full p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white border border-zinc-200 dark:border-zinc-700 text-sm"
                />
                <span className="text-zinc-400">-</span>
                <input
                  type="number"
                  placeholder="Đến (2025)"
                  value={maxYear}
                  onChange={(e) => setMaxYear(e.target.value)}
                  className="w-full p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white border border-zinc-200 dark:border-zinc-700 text-sm"
                />
              </div>
            </div>

            {/* Filter Views */}
            <div className="flex-1">
              <label className="text-xs font-bold uppercase text-zinc-500 mb-1 block">
                Lượt xem
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min Views"
                  value={minView}
                  onChange={(e) => setMinView(e.target.value)}
                  className="w-full p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white border border-zinc-200 dark:border-zinc-700 text-sm"
                />
                <span className="text-zinc-400">-</span>
                <input
                  type="number"
                  placeholder="Max Views"
                  value={maxView}
                  onChange={(e) => setMaxView(e.target.value)}
                  className="w-full p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white border border-zinc-200 dark:border-zinc-700 text-sm"
                />
              </div>
            </div>

            {/* Reset Button */}
            <div className="flex items-end">
              <button
                onClick={handleReset}
                className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition text-sm font-semibold h-[38px] w-full md:w-auto"
              >
                Reset All
              </button>
            </div>
          </div>
        </div>

        {/* --- RESULT GRID --- */}
        {processedData.length === 0 ? (
          <div className="text-center py-20 text-zinc-500 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
            Không tìm thấy bộ nào phù hợp với bộ lọc hiện tại.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {processedData.map((item, index) => (
              <a
                key={index}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white dark:bg-zinc-900 rounded-lg shadow hover:scale-[1.03] transition p-2 flex flex-col h-full"
              >
                <div className="relative w-full aspect-[3/4] overflow-hidden rounded-md bg-zinc-200 dark:bg-zinc-800">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                  {item.studios?.[0] && (
                    <span className="absolute top-1 right-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">
                      {item.studios[0].name}
                    </span>
                  )}
                </div>

                <div className="flex flex-col flex-grow mt-2">
                  <p
                    className="text-sm font-medium text-black dark:text-zinc-200 line-clamp-2 text-center mb-1"
                    title={item.title}
                  >
                    {item.title}
                  </p>
                  <div className="flex justify-between items-center text-[10px] text-zinc-500 dark:text-zinc-400 px-1 mt-auto">
                    <span>{item.releaseYear?.name || "N/A"}</span>
                    <span className="flex items-center gap-1">
                      👁️{" "}
                      {new Intl.NumberFormat("en-US", {
                        notation: "compact",
                      }).format(item.views)}
                    </span>
                  </div>

                  {/* Genres (Limit to 3 for design consistency)
                    {item.genres?.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-1 mt-2">
                        {item.genres.slice(0, 3).map((g, i) => (
                        <span
                            key={i}
                            className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700"
                        >
                            {g.name}
                        </span>
                        ))}
                        {item.genres.length > 3 && (
                            <span className="text-[9px] text-zinc-400 self-center">+{item.genres.length - 3}</span>
                        )}
                    </div>
                    )} */}
                </div>
              </a>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
