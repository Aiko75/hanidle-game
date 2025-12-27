"use client";

import hanimeData from "@/../public/data/ihentai_all.json";
import animeData from "@/../public/data/anime_full.json";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import ResultRow from "../../../components/game/HAnidle/ResultRow";
import { LOCAL_STORAGE_KEYS } from "@/app/constants/localKey";
import Cookies from "js-cookie";

export default function HAnidle() {
  // --- STATE ---
  const [activeData, setActiveData] = useState([]);
  const [currentMode, setCurrentMode] = useState("anime");
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const [targetAnime, setTargetAnime] = useState(null);
  const [guesses, setGuesses] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isWon, setIsWon] = useState(false);

  const isInitialized = useRef(false);

  // Key không đổi, lấy từ file constants của bạn
  const STORAGE_KEY = LOCAL_STORAGE_KEYS.WORDLE.PROGRESS;

  // --- 1. KHỞI TẠO MODE & DATA ---
  useEffect(() => {
    const mode = Cookies.get("app_mode") || "anime";
    setCurrentMode(mode);

    if (mode === "hanime") {
      setActiveData(hanimeData);
    } else {
      setActiveData(animeData);
    }
    setIsDataLoaded(true);
  }, []);

  // --- HELPER: Random Target mới ---
  const generateNewTarget = (dataSource) => {
    if (!dataSource || dataSource.length === 0) return;
    const random = dataSource[Math.floor(Math.random() * dataSource.length)];
    setTargetAnime(random);
    setGuesses([]);
    setIsWon(false);
  };

  // --- 2. KHÔI PHỤC TIẾN TRÌNH (Logic mới: Đọc vào key con) ---
  useEffect(() => {
    if (!isDataLoaded || activeData.length === 0) return;

    // Lấy toàn bộ cục data từ key cũ
    const rawData = localStorage.getItem(STORAGE_KEY);

    if (rawData) {
      try {
        const fullProgress = JSON.parse(rawData);

        // [QUAN TRỌNG] Chỉ lấy data của mode hiện tại
        // Nếu cấu trúc cũ chưa có mode, fallback về null để tạo mới
        const modeProgress = fullProgress[currentMode];

        if (modeProgress && modeProgress.targetAnime) {
          // Check xem ID có hợp lệ trong bộ data hiện tại không
          const isValid = activeData.some(
            (item) => item.id === modeProgress.targetAnime.id
          );

          if (isValid) {
            setTargetAnime(modeProgress.targetAnime);
            setGuesses(modeProgress.guesses || []);
            setIsWon(modeProgress.isWon || false);
          } else {
            generateNewTarget(activeData);
          }
        } else {
          // Chưa có save của mode này -> Tạo mới
          generateNewTarget(activeData);
        }
      } catch (e) {
        console.error("❌ Lỗi đọc save:", e);
        generateNewTarget(activeData);
      }
    } else {
      generateNewTarget(activeData);
    }
    isInitialized.current = true;
  }, [activeData, isDataLoaded, currentMode]); // Chạy lại khi mode hoặc data thay đổi

  // --- 3. LƯU TIẾN TRÌNH (Logic mới: Merge vào key cũ) ---
  useEffect(() => {
    if (!isInitialized.current || !targetAnime) return;

    // 1. Đọc data cũ ra trước (để giữ lại tiến trình của mode kia)
    const prevRaw = localStorage.getItem(STORAGE_KEY);
    let fullStorage = {};
    try {
      fullStorage = prevRaw ? JSON.parse(prevRaw) : {};
    } catch {
      fullStorage = {};
    }

    // 2. Cập nhật tiến trình của mode hiện tại
    fullStorage[currentMode] = {
      targetAnime,
      guesses,
      isWon,
    };

    // 3. Lưu đè lại vào key cũ
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fullStorage));
  }, [guesses, targetAnime, isWon, currentMode]);

  // --- 4. RESET VÁN MỚI ---
  const handleNewGame = () => {
    // 1. Đọc data cũ
    const prevRaw = localStorage.getItem(STORAGE_KEY);
    let fullStorage = {};
    if (prevRaw) {
      try {
        fullStorage = JSON.parse(prevRaw);
      } catch {}
    }

    // 2. Xóa data của mode hiện tại, giữ mode kia
    delete fullStorage[currentMode];

    // 3. Lưu lại
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fullStorage));

    // 4. Reset state
    generateNewTarget(activeData);
    setInputValue("");
    setSuggestions([]);
  };

  // --- 5. XỬ LÝ INPUT ---
  const handleInput = (value) => {
    setInputValue(value);
    if (value.trim().length === 0) {
      setSuggestions([]);
      return;
    }

    const matched = activeData
      .filter(
        (item) =>
          item.title?.toLowerCase().includes(value.toLowerCase()) &&
          !guesses.some((g) => g.id === item.id)
      )
      .slice(0, 8);
    setSuggestions(matched);
  };

  // --- 6. CHỌN ANIME ---
  const handleSelectAnime = (anime) => {
    const newGuesses = [anime, ...guesses];
    setGuesses(newGuesses);
    setInputValue("");
    setSuggestions([]);

    if (anime.id === targetAnime.id) {
      setIsWon(true);
    }
  };

  // --- UI THEME ---
  const themeColor = currentMode === "hanime" ? "pink" : "blue";
  const themeText =
    currentMode === "hanime" ? "text-pink-600" : "text-blue-600";
  const themeBg =
    currentMode === "hanime"
      ? "bg-pink-600 hover:bg-pink-700"
      : "bg-blue-600 hover:bg-blue-700";
  const themeBorder =
    currentMode === "hanime" ? "border-pink-500" : "border-blue-500";
  const themeGradient =
    currentMode === "hanime"
      ? "from-pink-500 to-red-500"
      : "from-blue-500 to-indigo-500";

  if (!targetAnime)
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 text-slate-400">
        <div className="flex flex-col items-center gap-2">
          <div
            className={`w-8 h-8 border-4 ${themeBorder} rounded-full border-t-transparent animate-spin`}
          ></div>
          <p className="font-medium">Đang tải dữ liệu {currentMode}...</p>
        </div>
      </div>
    );

  return (
    <div
      className={`w-full min-h-screen pb-20 transition-colors duration-500 ${
        currentMode === "hanime" ? "bg-zinc-50" : "bg-slate-50"
      }`}
    >
      {/* HEADER */}
      <div className="sticky top-0 z-40 bg-white border-b shadow-sm border-slate-100">
        <div className="flex items-center justify-between h-16 px-4 mx-auto max-w-7xl">
          <div className="flex items-center gap-3 md:gap-4">
            <Link
              href="/game"
              className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-bold text-sm border border-slate-200 hover:border-blue-200 bg-slate-50 hover:bg-white rounded-full px-4 py-1.5"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
              Back
            </Link>
            <span
              className={`mb-0 navbar-brand h1 fw-bold ${themeText} d-none d-sm-block`}
            >
              {currentMode === "hanime" ? "H-Anidle 🔞" : "Anidle 🎬"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full font-bold text-sm border border-slate-200">
              <span className="hidden mr-1 xs:inline">Guesses:</span>
              <span className={themeText}>{guesses.length}</span>
            </div>
            <button
              onClick={handleNewGame}
              className={`${themeBg} text-white text-sm font-bold py-1.5 px-4 !rounded-full shadow-sm transition-all hover:shadow-md active:scale-95`}
            >
              Ván mới
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex flex-col items-center max-w-6xl px-4 mx-auto mt-8">
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-3xl font-bold text-slate-800">
            {currentMode === "hanime"
              ? "Đoán bộ H-Anime bí ẩn"
              : "Đoán bộ Anime bí ẩn"}
          </h2>
          <p className="text-slate-500">
            Nhập tên bất kỳ để tìm ra manh mối về Thể loại, Studio, Năm...
          </p>
        </div>

        {!isWon ? (
          <div className="relative z-30 w-full max-w-xl mb-12">
            <div className="relative group">
              <div
                className={`absolute -inset-0.5 bg-gradient-to-r ${themeGradient} rounded-full opacity-30 group-hover:opacity-100 transition duration-500 blur`}
              ></div>
              <input
                value={inputValue}
                onChange={(e) => handleInput(e.target.value)}
                placeholder={`Nhập tên ${
                  currentMode === "hanime" ? "Hentai" : "Anime"
                }...`}
                className="relative w-full px-6 py-4 text-lg transition bg-white border rounded-full shadow-sm outline-none border-slate-200 text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              />
            </div>

            {suggestions.length > 0 && (
              <div className="absolute z-50 mt-2 overflow-hidden bg-white border shadow-xl top-full left-4 right-4 rounded-2xl border-slate-100 animate-in fade-in slide-in-from-top-2">
                <div className="overflow-y-auto max-h-80 custom-scrollbar">
                  {suggestions.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => handleSelectAnime(s)}
                      className="flex items-center gap-4 p-3 transition-colors border-b cursor-pointer hover:bg-blue-50 border-slate-50 last:border-0"
                    >
                      <img
                        src={s.thumbnail}
                        alt=""
                        className="object-cover w-12 h-12 rounded-md shadow-sm"
                      />
                      <div>
                        <p className="text-sm font-bold text-slate-700 line-clamp-1">
                          {s.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-semibold bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                            {s.releaseYear?.name || "N/A"}
                          </span>
                          <span className="text-xs text-slate-400 truncate max-w-[150px]">
                            {s.studios?.map((st) => st.name).join(", ")}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full max-w-xl mb-10 duration-500 animate-in zoom-in">
            <div className="p-1 shadow-lg bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-green-200">
              <div className="p-6 text-center bg-white rounded-xl">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-4 text-3xl text-green-600 bg-green-100 rounded-full">
                  🎉
                </div>
                <h3 className="mb-2 text-2xl font-bold text-green-700">
                  CHÍNH XÁC!
                </h3>
                <p className="mb-6 text-slate-600">
                  Bạn đã tìm ra{" "}
                  <span className="font-bold text-slate-900">
                    {targetAnime.title}
                  </span>
                </p>
                <div className="flex justify-center mb-6">
                  <img
                    src={targetAnime.thumbnail}
                    className="w-32 transition-transform duration-500 rounded-lg shadow-md rotate-2 hover:rotate-0"
                  />
                </div>
                <button
                  onClick={handleNewGame}
                  className="px-8 py-3 font-bold text-white transition-all bg-green-600 rounded-full shadow-lg hover:bg-green-700 shadow-green-200 hover:scale-105 active:scale-95"
                >
                  Chơi lại 🔄
                </button>
              </div>
            </div>
          </div>
        )}

        {/* RESULTS TABLE */}
        <div className="w-full space-y-3">
          {guesses.length > 0 && (
            <div className="hidden grid-cols-7 gap-4 px-4 mb-2 md:grid">
              <div className="col-span-3 pl-2 text-xs font-bold tracking-wider uppercase text-slate-400">
                Anime
              </div>
              <div className="text-xs font-bold tracking-wider text-center uppercase text-slate-400">
                Studio
              </div>
              <div className="text-xs font-bold tracking-wider text-center uppercase text-slate-400">
                Năm
              </div>
              <div className="text-xs font-bold tracking-wider text-center uppercase text-slate-400">
                View
              </div>
              <div className="text-xs font-bold tracking-wider text-center uppercase text-slate-400">
                Cen
              </div>
            </div>
          )}
          <div className="flex flex-col gap-3">
            {guesses.map((guess, index) => (
              <div
                key={`${guess.id}-${index}`}
                className="duration-500 animate-in slide-in-from-bottom-4 fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <ResultRow guess={guess} target={targetAnime} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
