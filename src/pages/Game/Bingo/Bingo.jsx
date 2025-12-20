"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const checkCondition = (anime, cell) => {
  const val = cell.value;
  switch (cell.type) {
    case "year_eq":
      return parseInt(anime.releaseYear?.name) === val;
    case "year_gt":
      return parseInt(anime.releaseYear?.name) > val;
    case "year_lt":
      return parseInt(anime.releaseYear?.name) < val;
    case "views_gt":
      return (anime.views || 0) > val;
    case "genre":
      return anime.genres?.some((g) => g.name === val);
    case "studio":
      return anime.studios?.some((s) => s.name === val);
    case "censorship":
      return anime.censorship === val;
    case "category":
      return anime.category === val;
    default:
      return false;
  }
};

// Các tổ hợp chiến thắng (Hàng, Cột, Chéo)
const WIN_PATTERNS = [
  [0, 1, 2, 3],
  [4, 5, 6, 7],
  [8, 9, 10, 11],
  [12, 13, 14, 15], // Rows
  [0, 4, 8, 12],
  [1, 5, 9, 13],
  [2, 6, 10, 14],
  [3, 7, 11, 15], // Cols
  [0, 5, 10, 15],
  [3, 6, 9, 12], // Diagonals
];

export default function BingoGamePage() {
  const [target, setTarget] = useState(null);
  const [grid, setGrid] = useState([]);
  const [selectedCells, setSelectedCells] = useState([]); // Array of IDs
  const [wrongCells, setWrongCells] = useState([]); // Array of IDs
  const [bingoLines, setBingoLines] = useState([]); // Array of Pattern Indexes
  const [lives, setLives] = useState(3);
  const [loading, setLoading] = useState(true);

  const fetchGame = async () => {
    setLoading(true);
    setLives(3);
    setSelectedCells([]);
    setWrongCells([]);
    setBingoLines([]);

    try {
      const res = await fetch("/api/games/bingo/new");
      const data = await res.json();
      if (data.success) {
        setTarget(data.target);
        setGrid(data.grid);
      }
    } finally {
      setLoading(false);
    }
  };

  // 1. Init Game
  useEffect(() => {
    fetchGame();
  }, []);

  // 2. Handle Click
  const handleCellClick = (cell) => {
    if (
      lives <= 0 ||
      selectedCells.includes(cell.id) ||
      wrongCells.includes(cell.id)
    )
      return;

    const isCorrect = checkCondition(target, cell);

    if (isCorrect) {
      const newSelected = [...selectedCells, cell.id];
      setSelectedCells(newSelected);
      checkWin(newSelected);
    } else {
      setWrongCells([...wrongCells, cell.id]);
      setLives((prev) => prev - 1);
    }
  };

  // 3. Check Bingo
  const checkWin = (currentSelected) => {
    const newBingos = [];
    WIN_PATTERNS.forEach((pattern, index) => {
      if (pattern.every((id) => currentSelected.includes(id))) {
        if (!bingoLines.includes(index)) {
          newBingos.push(index);
        }
      }
    });
    if (newBingos.length > 0) {
      setBingoLines([...bingoLines, ...newBingos]);
      // Có thể thêm sound effect Bingo ở đây
    }
  };

  if (loading)
    return (
      <div className="min-vh-100 flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* HEADER */}
      <div className="bg-white shadow-sm sticky top-0 z-40 border-b border-slate-100 mb-6">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/game"
            className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold text-sm"
          >
            &larr; Back
          </Link>
          <h1 className="text-xl font-extrabold text-blue-600">
            ANIME BINGO 🎯
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-400">Lives:</span>
            <div className="flex">
              {[...Array(3)].map((_, i) => (
                <span
                  key={i}
                  className={`text-xl ${
                    i < lives ? "text-red-500" : "text-slate-200"
                  }`}
                >
                  ❤️
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 flex flex-col items-center">
        {/* TARGET ANIME CARD */}
        <div className="w-full mb-6 relative group">
          <div className="absolute -inset-1 bg-linear-to-r from-blue-400 to-purple-400 rounded-2xl blur opacity-25 group-hover:opacity-50 transition"></div>
          <div className="relative bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex gap-4 items-center">
            <img
              src={target.thumbnail}
              className="w-20 h-28 object-cover rounded-lg shadow-sm"
              alt="target"
            />
            <div>
              <div className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-1">
                Target Anime
              </div>
              <h2 className="text-lg font-bold text-slate-800 leading-tight mb-2 line-clamp-2">
                {target.title}
              </h2>
              <p className="text-xs text-slate-400">
                Hãy tìm các đặc điểm đúng của bộ này!
              </p>
            </div>
          </div>
        </div>

        {/* GAME OVER STATE */}
        {lives <= 0 && (
          <div className="w-full mb-6 bg-red-50 border border-red-200 rounded-xl p-4 text-center animate-in zoom-in">
            <h3 className="font-bold text-red-600 text-lg mb-1">
              GAME OVER! 😭
            </h3>
            <p className="text-red-400 text-sm mb-3">
              Hết mạng rồi. Thử lại nhé?
            </p>
            <button
              onClick={fetchGame}
              className="bg-red-500 text-white px-6 py-2 rounded-full font-bold shadow-md hover:bg-red-600 transition"
            >
              Chơi lại
            </button>
          </div>
        )}

        {/* BINGO NOTIFICATION */}
        {bingoLines.length > 0 && (
          <div className="mb-4 px-4 py-2 bg-yellow-100 text-yellow-700 border border-yellow-300 rounded-full font-bold shadow-sm animate-bounce">
            🎉 BINGO! ({bingoLines.length} lines)
          </div>
        )}

        {/* BINGO GRID */}
        <div className="grid grid-cols-4 gap-2 w-full aspect-square">
          {grid.map((cell) => {
            const isSelected = selectedCells.includes(cell.id);
            const isWrong = wrongCells.includes(cell.id);

            // Style động
            let bgClass =
              "bg-white hover:bg-blue-50 cursor-pointer border-slate-200";
            let textClass = "text-slate-600";

            if (isSelected) {
              bgClass = "bg-green-500 border-green-600 ring-2 ring-green-300";
              textClass = "text-white";
            } else if (isWrong) {
              bgClass =
                "bg-slate-200 opacity-50 cursor-not-allowed border-transparent";
              textClass = "text-slate-400 line-through";
            }

            return (
              <button
                key={cell.id}
                onClick={() => handleCellClick(cell)}
                disabled={isSelected || isWrong || lives <= 0}
                className={`
                            relative p-1 rounded-lg border-2 shadow-sm flex flex-col items-center justify-center text-center transition-all duration-200 active:scale-95
                            ${bgClass}
                        `}
              >
                {/* Icon minh họa loại câu hỏi */}
                <span
                  className={`text-xs mb-1 opacity-70 ${
                    isSelected ? "text-green-100" : "text-slate-400"
                  }`}
                >
                  {cell.type === "views_gt" && "👁️"}
                  {cell.type.includes("year") && "📅"}
                  {cell.type === "genre" && "🎭"}
                  {cell.type === "studio" && "🎬"}
                  {cell.type === "censorship" && "🔞"}
                  {cell.type === "category" && "📺"}
                </span>

                <span
                  className={`text-[10px] sm:text-xs font-bold leading-tight ${textClass}`}
                >
                  {cell.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Win/Next Button */}
        {bingoLines.length > 0 && lives > 0 && (
          <div className="mt-8 animate-in slide-in-from-bottom">
            <button
              onClick={fetchGame}
              className="bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold py-3 px-10 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition"
            >
              Ván tiếp theo ➡️
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
