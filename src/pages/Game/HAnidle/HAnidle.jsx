"use client";

import data from "@/../public/data/ihentai_all.json";
import { useState, useEffect } from "react";
import ResultRow from "./ResultRow";

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
