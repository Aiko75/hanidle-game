"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { LOCAL_STORAGE_KEYS } from "@/constants/localKey";
import Cookies from "js-cookie";
import ResultRow from "@/components/game/Wordle/ResultRow";
import { api } from "@/app/api/baseJsonApi";
import GameSearch from "@/components/game/Contexto/GameSearch";

export default function Wordle() {
  // --- STATE ---
  const [currentMode, setCurrentMode] = useState("anime");
  const [targetAnime, setTargetAnime] = useState(null);
  const [guesses, setGuesses] = useState([]);
  const [isWon, setIsWon] = useState(false);
  const [loading, setLoading] = useState(false);

  const isInitialized = useRef(false);
  const STORAGE_KEY = LOCAL_STORAGE_KEYS.WORDLE.PROGRESS;

  // --- 1. KHỞI TẠO MODE ---
  useEffect(() => {
    const mode = Cookies.get("app_mode") || "anime";
    setCurrentMode(mode);
  }, []);

  // --- HELPER: Fetch Target Mới từ API ---
  const fetchNewTarget = async () => {
    setLoading(true);
    try {
      const json = await api.get("/api/games/wordle/new");
      if (json.success) {
        setTargetAnime(json.data);
        setGuesses([]);
        setIsWon(false);
      }
    } catch (error) {
      console.error("Lỗi lấy đề bài:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- 2. KHÔI PHỤC TIẾN TRÌNH ---
  useEffect(() => {
    if (isInitialized.current) return;

    const mode = Cookies.get("app_mode") || "anime";
    const rawData = localStorage.getItem(STORAGE_KEY);

    if (rawData) {
      try {
        const fullProgress = JSON.parse(rawData);
        const modeProgress = fullProgress[mode];

        if (modeProgress && modeProgress.targetAnime) {
          setTargetAnime(modeProgress.targetAnime);
          setGuesses(modeProgress.guesses || []);
          setIsWon(modeProgress.isWon || false);
        } else {
          fetchNewTarget();
        }
      } catch {
        fetchNewTarget();
      }
    } else {
      fetchNewTarget();
    }
    isInitialized.current = true;
  }, [STORAGE_KEY]);

  // --- 3. LƯU TIẾN TRÌNH ---
  useEffect(() => {
    if (!targetAnime) return;

    const prevRaw = localStorage.getItem(STORAGE_KEY);
    let fullStorage = {};
    try {
      fullStorage = prevRaw ? JSON.parse(prevRaw) : {};
    } catch {}

    fullStorage[currentMode] = {
      targetAnime,
      guesses,
      isWon,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fullStorage));
  }, [guesses, targetAnime, isWon, currentMode, STORAGE_KEY]);

  // --- 4. RESET VÁN MỚI ---
  const handleNewGame = () => {
    const prevRaw = localStorage.getItem(STORAGE_KEY);
    let fullStorage = {};
    try {
      fullStorage = JSON.parse(prevRaw);
    } catch {}

    delete fullStorage[currentMode];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fullStorage));
    fetchNewTarget();
  };

  // --- 6. CHỌN ANIME (GỌI API CHECK) ---
  const handleSelectAnime = async (anime) => {
    if (!targetAnime) return;
    setLoading(true);

    try {
      // Gọi API Check
      const json = await api.post(
        "/api/games/wordle/check",
        JSON.stringify({
          guessId: anime.id,
          targetId: targetAnime.id,
        })
      );

      if (json.success) {
        const newGuess = json.guess;
        setGuesses([newGuess, ...guesses]);

        if (json.result.isCorrect) {
          setIsWon(true);
        }
      }
    } catch (err) {
      console.error("Lỗi kiểm tra đáp án:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- UI CONFIG ---
  const themeText =
    currentMode === "hanime" ? "text-pink-600" : "text-blue-600";
  const themeBg =
    currentMode === "hanime"
      ? "bg-pink-600 hover:bg-pink-700"
      : "bg-blue-600 hover:bg-blue-700";
  const themeBorder =
    currentMode === "hanime" ? "border-pink-500" : "border-blue-500";

  // --- LOADING UI KHI KHỞI TẠO ---
  if (!targetAnime && loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 text-slate-400">
        <div className="flex flex-col items-center gap-2">
          <div
            className={`w-8 h-8 border-4 ${themeBorder} rounded-full border-t-transparent animate-spin`}
          ></div>
          <p className="font-medium">Đang khởi tạo màn chơi...</p>
        </div>
      </div>
    );

  return (
    <div
      className={`w-full min-h-screen pb-20 transition-colors duration-500 ${
        currentMode === "hanime" ? "bg-zinc-50" : "bg-slate-50"
      }`}
    >
      {/* HEADER GIỮ NGUYÊN */}
      <div className="sticky top-0 z-40 bg-white border-b shadow-sm border-slate-100">
        <div className="flex items-center justify-between h-16 px-4 mx-auto max-w-7xl">
          <div className="flex items-center gap-3 md:gap-4">
            <Link
              href="/game"
              className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-bold text-sm border border-slate-200 hover:border-blue-200 bg-slate-50 hover:bg-white rounded-full px-4 py-1.5"
            >
              <i className="bi bi-arrow-left"></i> Back
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
            Nhập tên bất kỳ để tìm ra manh mối...
          </p>
        </div>

        {!isWon ? (
          // [UPDATE] Thay thế Input cũ bằng GameSearch
          <div className="relative z-30 w-full max-w-xl mb-12">
            <GameSearch onGuess={handleSelectAnime} disabled={loading} />
          </div>
        ) : (
          /* WIN SCREEN (Giữ nguyên) */
          <div className="w-full max-w-xl mb-10 duration-500 animate-in zoom-in">
            <div className="p-1 shadow-lg bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-green-200">
              <div className="p-6 text-center bg-white rounded-xl">
                <h3 className="mb-2 text-2xl font-bold text-green-700">
                  CHÍNH XÁC!
                </h3>
                <p className="mb-6 text-slate-600">
                  Đáp án là:{" "}
                  <span className="font-bold text-slate-900">
                    {targetAnime.title}
                  </span>
                </p>
                <div className="flex justify-center mb-6">
                  <img
                    src={targetAnime.thumbnail}
                    className="w-32 rounded-lg shadow-md"
                  />
                </div>
                <button
                  onClick={handleNewGame}
                  className="px-8 py-3 font-bold text-white transition-all bg-green-600 rounded-full shadow-lg hover:bg-green-700 hover:scale-105"
                >
                  Chơi lại 🔄
                </button>
              </div>
            </div>
          </div>
        )}

        {/* LIST GUESSES (Giữ nguyên) */}
        <div className="w-full space-y-3">
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
  );
}
