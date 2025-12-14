"use client";

import data from "@/../public/data/ihentai_all.json";
import { useState, useEffect } from "react";
import Link from "next/link";
import ResultRow from "../../../components/game/HAnidle/ResultRow";

export default function HAnidle() {
  const [targetAnime, setTargetAnime] = useState(null);
  const [guesses, setGuesses] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isWon, setIsWon] = useState(false);

  // 1. Khởi tạo bộ bí mật
  useEffect(() => {
    const timer = setTimeout(() => {
      const random = data[Math.floor(Math.random() * data.length)];
      setTargetAnime(random);
      console.log("Target Anime (Debug):", random.title);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // 2. Xử lý Input
  const handleInput = (value) => {
    setInputValue(value);
    if (value.trim().length === 0) {
      setSuggestions([]);
      return;
    }
    const matched = data
      .filter(
        (item) =>
          item.title.toLowerCase().includes(value.toLowerCase()) &&
          !guesses.some((g) => g.id === item.id)
      )
      .slice(0, 8);
    setSuggestions(matched);
  };

  // 3. Chọn Anime
  const handleSelectAnime = (anime) => {
    const newGuesses = [anime, ...guesses];
    setGuesses(newGuesses);
    setInputValue("");
    setSuggestions([]);

    if (anime.id === targetAnime.id) {
      setIsWon(true);
    }
  };

  if (!targetAnime)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="font-medium">Loading Game...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen w-full bg-slate-50 pb-20">
      {/* --- HEADER NAVIGATION (NAV) --- */}
      <div className="bg-white shadow-sm sticky top-0 z-40 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Left Side: Back Button + Title */}
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

            <span className="navbar-brand mb-0 h1 fw-bold text-primary d-none d-sm-block">
              HenTexto
            </span>
          </div>

          {/* Right Side: Guesses Counter + Reset Button */}
          <div className="flex items-center gap-3">
            {/* Counter Badge */}
            <div className="flex items-center bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full font-bold text-sm border border-slate-200">
              <span className="mr-1 hidden xs:inline">Guesses:</span>
              <span className="text-blue-600">{guesses.length}</span>
            </div>

            {/* New Game Button */}
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-1.5 px-4 !rounded-full shadow-sm transition-all hover:shadow-md active:scale-95"
            >
              Ván mới
            </button>
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT CONTAINER --- */}
      <div className="max-w-6xl mx-auto px-4 mt-8 flex flex-col items-center">
        {/* --- TITLE & DESC --- */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">
            Đoán bộ Anime bí ẩn
          </h2>
          <p className="text-slate-500">
            Nhập tên bất kỳ để tìm ra manh mối về Thể loại, Studio, Năm...
          </p>
        </div>

        {/* --- INPUT AREA --- */}
        {!isWon ? (
          <div className="w-full max-w-xl relative mb-12 z-30">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full opacity-30 group-hover:opacity-100 transition duration-500 blur"></div>
              <input
                value={inputValue}
                onChange={(e) => handleInput(e.target.value)}
                placeholder="Nhập tên anime..."
                className="relative w-full py-4 px-6 rounded-full bg-white border border-slate-200 text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition shadow-sm text-lg"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </div>
            </div>

            {/* Suggestions Dropdown */}
            {suggestions.length > 0 && (
              <div className="absolute top-full left-4 right-4 bg-white mt-2 rounded-2xl border border-slate-100 shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                <div className="max-h-80 overflow-y-auto custom-scrollbar">
                  {suggestions.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => handleSelectAnime(s)}
                      className="p-3 cursor-pointer hover:bg-blue-50 flex items-center gap-4 border-b border-slate-50 last:border-0 transition-colors"
                    >
                      <img
                        src={s.thumbnail}
                        alt=""
                        className="w-12 h-12 object-cover rounded-md shadow-sm"
                      />
                      <div>
                        <p className="font-bold text-slate-700 text-sm line-clamp-1">
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
          /* --- WIN STATE --- */
          <div className="mb-10 w-full max-w-xl animate-in zoom-in duration-500">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-1 shadow-lg shadow-green-200">
              <div className="bg-white rounded-xl p-6 text-center">
                <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 text-3xl">
                  🎉
                </div>
                <h3 className="text-2xl font-bold text-green-700 mb-2">
                  CHÍNH XÁC!
                </h3>
                <p className="text-slate-600 mb-6">
                  Bạn đã tìm ra{" "}
                  <span className="font-bold text-slate-900">
                    {targetAnime.title}
                  </span>
                </p>

                <div className="flex justify-center mb-6">
                  <img
                    src={targetAnime.thumbnail}
                    className="w-32 rounded-lg shadow-md rotate-2 hover:rotate-0 transition-transform duration-500"
                  />
                </div>

                <button
                  onClick={() => window.location.reload()}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-green-200 transition-all hover:scale-105 active:scale-95"
                >
                  Chơi lại 🔄
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- RESULTS TABLE --- */}
        <div className="w-full space-y-3">
          {guesses.length > 0 && (
            <div className="hidden md:grid grid-cols-7 gap-4 px-4 mb-2">
              <div className="col-span-3 text-xs font-bold text-slate-400 uppercase tracking-wider pl-2">
                Anime
              </div>
              <div className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                Studio
              </div>
              <div className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                Năm
              </div>
              <div className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                View
              </div>
              <div className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                Cen
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {guesses.map((guess, index) => (
              <div
                key={`${guess.id}-${index}`}
                className="animate-in slide-in-from-bottom-4 fade-in duration-500"
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
