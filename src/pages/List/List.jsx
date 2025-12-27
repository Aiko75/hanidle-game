"use client";

import hanimeData from "@/../public/data/ihentai_all.json";
import animeData from "@/../public/data/anime_full.json";
import { LOCAL_STORAGE_KEYS } from "@/app/constants/localKey";
import AnimeGrid from "@/components/list/AnimeGrid";
import FilterBar from "@/components/list/FilterBar";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useMemo, useCallback, useState, useEffect, useRef } from "react";
import Cookies from "js-cookie";

export default function HAnimeList() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const itemsPerPage = 20;
  const isInitialized = useRef(false);

  // 2. [CHANGE] State để lưu Mode và Data hiện tại
  // Mặc định là animeData để tránh Hydration Error, sẽ cập nhật ngay trong useEffect
  const [activeData, setActiveData] = useState(animeData);
  const [currentMode, setCurrentMode] = useState("anime");
  const [isDataLoaded, setIsDataLoaded] = useState(false); // Flag để tránh flash content
  // State cho Search và Page
  const [localSearch, setLocalSearch] = useState(searchParams.get("q") || "");
  const currentPage = parseInt(searchParams.get("page") || "1");
  const [pageInput, setPageInput] = useState(currentPage.toString());

  // 3. [CHANGE] Effect đọc Cookie để chọn dữ liệu
  useEffect(() => {
    const mode = Cookies.get("app_mode") || "anime";
    setCurrentMode(mode);

    // Chọn nguồn dữ liệu dựa trên mode
    if (mode === "hanime") {
      setActiveData(hanimeData);
    } else {
      setActiveData(animeData);
    }
    setIsDataLoaded(true);
  }, []);

  const searchTerm = searchParams.get("q") || "";
  const filters = useMemo(
    () => ({
      genre: searchParams.get("genre") || "All",
      studio: searchParams.get("studio") || "All",
      sortBy: searchParams.get("sortBy") || "newest",
      minYear: searchParams.get("minYear") || "",
      maxYear: searchParams.get("maxYear") || "",
      minView: searchParams.get("minView") || "",
      maxView: searchParams.get("maxView") || "",
    }),
    [searchParams]
  );

  // --- LOGIC KHỞI TẠO TỪ LOCAL STORAGE ---
  useEffect(() => {
    const savedPage = localStorage.getItem(LOCAL_STORAGE_KEYS.LIST.PAGE);
    const urlPage = searchParams.get("page");

    if (!urlPage && savedPage) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", savedPage);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
    isInitialized.current = true;
  }, [pathname, router, searchParams]);

  // --- LOGIC LƯU TRANG VÀO LOCAL STORAGE ---
  useEffect(() => {
    if (isInitialized.current) {
      localStorage.setItem(
        LOCAL_STORAGE_KEYS.LIST.PAGE,
        currentPage.toString()
      );
    }
  }, [currentPage]);

  // 4. [CHANGE] Logic lọc dữ liệu (Sử dụng activeData thay vì data)
  const filteredData = useMemo(() => {
    if (!isDataLoaded) return []; // Chưa load xong thì trả về rỗng

    let result = [...activeData]; // <-- Dùng activeData

    if (searchTerm.trim() !== "") {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter((item) =>
        item.title?.toLowerCase().includes(lowerSearch)
      );
    }
    if (filters.genre !== "All")
      result = result.filter((item) =>
        item.genres?.some((g) => g.name === filters.genre)
      );
    if (filters.studio !== "All")
      result = result.filter((item) =>
        item.studios?.some((s) => s.name === filters.studio)
      );

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
      const vA = a.views || 0,
        vB = b.views || 0;
      const yA = parseInt(a.releaseYear?.name || "0"),
        yB = parseInt(b.releaseYear?.name || "0");
      switch (filters.sortBy) {
        case "newest":
          return yB - yA;
        case "oldest":
          return yA - yB;
        case "most_viewed":
          return vB - vA;
        case "least_viewed":
          return vA - vB;
        default:
          return 0;
      }
    });
    return result;
  }, [filters, searchTerm, activeData, isDataLoaded]); // Thêm activeData vào dependency

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const updateQuery = useCallback(
    (updates) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value && value !== "All") params.set(key, value);
        else params.delete(key);
      });
      if (!updates.page) params.set("page", "1");
      router.replace(`${pathname}?${params.toString()}`, { scroll: true });
    },
    [searchParams, pathname, router]
  );

  // Reset về trang 1 nếu switch mode làm tổng số trang giảm xuống thấp hơn trang hiện tại
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      updateQuery({ page: "1" });
    }
  }, [totalPages, currentPage, updateQuery]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== searchTerm) updateQuery({ q: localSearch });
    }, 400);
    return () => clearTimeout(timer);
  }, [localSearch, updateQuery, searchTerm]);

  useEffect(() => {
    setPageInput(currentPage.toString());
  }, [currentPage]);

  const handlePageJump = (val) => {
    setPageInput(val);
    const p = parseInt(val);
    if (p >= 1 && p <= totalPages) {
      updateQuery({ page: p.toString() });
    }
  };

  const handleReset = () => {
    setLocalSearch("");
    localStorage.removeItem(LOCAL_STORAGE_KEYS.LIST.PAGE);
    router.push(pathname);
  };

  // 5. [CHANGE] Options (Filter) cũng phải cập nhật theo activeData
  const options = useMemo(() => {
    if (!isDataLoaded) return { genres: ["All"], studios: ["All"] };

    const genres = new Set(),
      studios = new Set();
    activeData.forEach((item) => {
      // <-- Dùng activeData
      item.genres?.forEach((g) => genres.add(g.name));
      item.studios?.forEach((s) => studios.add(s.name));
    });
    return {
      genres: ["All", ...Array.from(genres).sort()],
      studios: ["All", ...Array.from(studios).sort()],
    };
  }, [activeData, isDataLoaded]);

  // UI Loading nhẹ nếu chưa đọc xong cookie (tránh flash data sai)
  if (!isDataLoaded)
    return <div className="p-10 text-center">Loading Library...</div>;

  return (
    <div
      className={`flex justify-center w-full min-h-screen py-10 transition-colors duration-500 ${
        currentMode === "hanime" ? "bg-zinc-50" : "bg-blue-50" // [Optional] Đổi màu nền nhẹ theo mode
      }`}
    >
      <main className="w-full max-w-6xl px-4 sm:px-10">
        <div className="flex flex-col items-start justify-between gap-4 mb-6 md:flex-row md:items-center">
          <div>
            <Link
              href="/"
              className="px-3 mb-2 btn btn-outline-secondary rounded-pill fw-bold btn-sm d-inline-block"
            >
              <i className="bi bi-arrow-left"></i> Back
            </Link>
            {/* 6. [CHANGE] Tiêu đề động */}
            <h1
              className={`mb-1 text-3xl font-semibold ${
                currentMode === "hanime" ? "text-pink-600" : "text-blue-700"
              }`}
            >
              {currentMode === "hanime" ? "Thư viện HAnime" : "Thư viện Anime"}
            </h1>
            <p className="text-zinc-500">
              Tổng cộng: <b>{filteredData.length}</b> bộ
            </p>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <i className="bi bi-search text-zinc-400"></i>
            </div>
            <input
              type="text"
              className="w-full py-3 pl-12 pr-4 transition-all bg-white border shadow-sm outline-none border-zinc-200 rounded-2xl focus:ring-2 focus:ring-primary"
              placeholder={`Tìm kiếm ${
                currentMode === "hanime" ? "Hentai..." : "Anime..."
              }`}
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
            />
          </div>
        </div>

        <FilterBar
          filters={filters}
          options={options}
          onUpdate={(key, val) => updateQuery({ [key]: val })}
          onReset={handleReset}
        />

        {/* Truyền activeData hoặc filteredData xuống Grid */}
        <AnimeGrid data={paginatedData} />

        {/* --- PHÂN TRANG (Giữ nguyên) --- */}
        {totalPages > 1 && (
          <div className="flex flex-col items-center justify-between gap-6 mt-12 mb-20 md:flex-row">
            {/* ... Code phân trang giữ nguyên ... */}
            <div className="flex gap-1">
              {[...Array(Math.min(5, totalPages))].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => updateQuery({ page: (i + 1).toString() })}
                  className={`w-10 h-10 rounded-xl font-bold transition-all ${
                    currentPage === i + 1
                      ? "bg-primary text-white"
                      : "bg-white border hover:bg-zinc-100"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 px-4 py-2 bg-white border shadow-sm rounded-2xl">
              <span className="text-sm font-bold text-zinc-400">PAGE</span>
              <input
                type="number"
                className="w-16 p-1 font-bold text-center border-b-2 outline-none border-primary"
                value={pageInput}
                onChange={(e) => handlePageJump(e.target.value)}
                min="1"
                max={totalPages}
              />
              <span className="text-sm font-bold text-zinc-400">
                / {totalPages}
              </span>
            </div>

            <div className="flex gap-1">
              {totalPages > 5 &&
                [...Array(Math.min(5, totalPages - 5))].map((_, i) => {
                  const pageNum = totalPages - 4 + i;
                  if (pageNum <= 5) return null;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => updateQuery({ page: pageNum.toString() })}
                      className={`w-10 h-10 rounded-xl font-bold transition-all ${
                        currentPage === pageNum
                          ? "bg-primary text-white"
                          : "bg-white border hover:bg-zinc-100"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
