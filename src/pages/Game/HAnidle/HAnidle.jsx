"use client";

import data from "@/../public/data/ihentai_all.json";
import { useState, useEffect } from "react";

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
    }, 0);
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
      .slice(0, 10);
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
    return <div className="text-white p-10">Loading Game...</div>;

  return (
    <div className="min-h-screen p-5 md:p-10 text-white bg-zinc-900 flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-8 text-blue-500">H-Anidle</h1>

      {/* --- INPUT --- */}
      {!isWon && (
        <div className="w-full max-w-xl relative mb-10 z-50">
          <input
            value={inputValue}
            onChange={(e) => handleInput(e.target.value)}
            placeholder="Nhập tên anime để đoán..."
            className="w-full p-4 rounded-lg bg-zinc-800 border border-zinc-700 text-white outline-none focus:border-blue-500 transition shadow-lg"
          />
          {suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-zinc-800 mt-2 rounded-lg border border-zinc-700 shadow-xl max-h-80 overflow-y-auto">
              {suggestions.map((s) => (
                <div
                  key={s.id}
                  onClick={() => handleSelectAnime(s)}
                  className="p-3 cursor-pointer hover:bg-zinc-700 flex items-center gap-3 border-b border-zinc-700/50 last:border-0"
                >
                  <img
                    src={s.thumbnail}
                    alt=""
                    className="w-10 h-10 object-cover rounded"
                  />
                  <div>
                    <p className="font-semibold text-sm">{s.title}</p>
                    <p className="text-xs text-zinc-400">
                      {s.releaseYear?.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {isWon && (
        <div className="mb-8 p-4 bg-green-600/20 border border-green-500 rounded-lg text-green-400 font-bold text-center animate-bounce">
          🎉 CHÚC MỪNG! BẠN ĐÃ TÌM RA BỘ HENTAI BÍ MẬT! 🎉
        </div>
      )}

      {/* --- KẾT QUẢ --- */}
      <div className="w-full max-w-5xl space-y-4">
        {guesses.length > 0 && (
          <div className="hidden md:grid grid-cols-7 gap-2 text-center text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
            <div className="col-span-3">Anime Info</div>
            <div>Studio</div>
            <div>Năm</div>
            <div>View</div>
            <div>Censorship</div>
          </div>
        )}

        {guesses.map((guess, index) => (
          <ResultRow
            key={`${guess.id}-${index}`}
            guess={guess}
            target={targetAnime}
          />
        ))}
      </div>
    </div>
  );
}

// --- LOGIC HÀNG KẾT QUẢ ---
function ResultRow({ guess, target }) {
  // 1. Studio
  const guessStudio = guess.studios?.[0];
  const targetStudio = target.studios?.[0];
  const isStudioCorrect = guessStudio?.id === targetStudio?.id;

  // 2. Năm (Xử lý mũi tên)
  const guessYear = parseInt(guess.releaseYear?.name || "0");
  const targetYear = parseInt(target.releaseYear?.name || "0");
  const isYearCorrect = guessYear === targetYear;
  let yearArrow = null;
  if (!isYearCorrect) {
    yearArrow = guessYear < targetYear ? "↑" : "↓"; // Nếu đoán thấp hơn thì mũi tên lên (cần tăng)
  }

  // 3. Views (Xử lý mũi tên)
  const isViewCorrect = guess.views === target.views;
  let viewArrow = null;
  if (!isViewCorrect) {
    viewArrow = guess.views < target.views ? "↑" : "↓";
  }

  // 4. Censorship
  const isCensorCorrect = guess.censorship === target.censorship;

  // 5. Title
  const isTitleCorrect = guess.id === target.id;

  return (
    <div className="bg-zinc-800 rounded-lg p-4 md:p-0 md:bg-transparent flex flex-col md:grid md:grid-cols-7 gap-2 animate-in fade-in slide-in-from-top-4 duration-500">
      {/* Cột 1: Info (Chiếm 3 cột để hiển thị đủ tags) */}
      <div
        className={`col-span-3 relative group rounded-md overflow-hidden flex p-2 md:h-auto border-2 ${
          isTitleCorrect ? "border-green-500" : "border-zinc-700"
        }`}
      >
        <div className="flex gap-3 w-full">
          <img
            src={guess.thumbnail}
            alt="thumb"
            className="w-20 h-28 object-cover rounded shadow-md shrink-0"
          />
          <div className="flex flex-col w-full">
            <p
              className="font-bold text-sm line-clamp-2 text-white"
              title={guess.title}
            >
              {guess.title}
            </p>
            {/* Logic Genres: Hiển thị TOÀN BỘ tag */}
            <div className="flex flex-wrap gap-1 mt-2 content-start">
              {guess.genres.map((g) => {
                const isGenreMatch = target.genres.some((tg) => tg.id === g.id);
                return (
                  <span
                    key={g.id}
                    className={`text-[10px] px-1.5 py-0.5 rounded border ${
                      isGenreMatch
                        ? "bg-green-600/90 border-green-500 text-white"
                        : "bg-zinc-700/50 border-zinc-600 text-zinc-400"
                    }`}
                  >
                    {g.name}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Cột 2: Studio */}
      <InfoBox
        label="Studio"
        value={guessStudio?.name || "N/A"}
        isCorrect={isStudioCorrect}
      />

      {/* Cột 3: Năm (Có mũi tên) */}
      <InfoBox
        label="Năm"
        value={guess.releaseYear?.name || "N/A"}
        isCorrect={isYearCorrect}
        arrow={yearArrow}
      />

      {/* Cột 4: Views (Có mũi tên) */}
      <InfoBox
        label="Views"
        value={new Intl.NumberFormat().format(guess.views)}
        isCorrect={isViewCorrect}
        arrow={viewArrow}
      />

      {/* Cột 5: Censorship */}
      <InfoBox
        label="Censorship"
        value={guess.censorship}
        isCorrect={isCensorCorrect}
        className="capitalize"
      />
    </div>
  );
}

// Component ô thông tin (Đã update để nhận prop arrow)
function InfoBox({ label, value, isCorrect, arrow, className = "" }) {
  return (
    <div
      className={`
        flex flex-col justify-center items-center p-2 rounded-md border text-center h-full min-h-[60px] relative
        ${
          isCorrect
            ? "bg-green-600 border-green-500 text-white"
            : "bg-zinc-800 border-zinc-700 text-gray-300"
          /* Nếu sai thì để màu tối cho đỡ rối mắt, hoặc để red tùy bạn */
        }
        ${!isCorrect && arrow ? "border-red-500/50" : ""} 
        transition-colors duration-300
      `}
    >
      <span className="md:hidden text-[10px] opacity-70 mb-1">{label}</span>

      <div className="flex flex-col items-center">
        <span
          className={`font-semibold text-sm md:text-base shadow-sm ${className}`}
        >
          {value}
        </span>

        {/* Mũi tên chỉ dẫn */}
        {arrow && !isCorrect && (
          <span className="text-xl font-bold text-yellow-400 animate-pulse mt-1">
            {arrow}
          </span>
        )}
      </div>

      {/* Background hint màu đỏ mờ nếu sai hoàn toàn */}
      {!isCorrect && !arrow && (
        <div className="absolute inset-0 bg-red-500/10 rounded-md pointer-events-none"></div>
      )}
    </div>
  );
}
