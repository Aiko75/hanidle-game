"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// Hàm check logic tại Client
const checkCondition = (anime, cell) => {
  if (!anime) return false;
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

// Logic check Bingo (Giữ nguyên)
const WIN_PATTERNS = [
  [0, 1, 2, 3],
  [4, 5, 6, 7],
  [8, 9, 10, 11],
  [12, 13, 14, 15],
  [0, 4, 8, 12],
  [1, 5, 9, 13],
  [2, 6, 10, 14],
  [3, 7, 11, 15],
  [0, 5, 10, 15],
  [3, 6, 9, 12],
];

export default function BingoGamePage() {
  const [grid, setGrid] = useState([]);
  const [deck, setDeck] = useState([]); // Bộ bài 50 lá
  const [currentIndex, setCurrentIndex] = useState(0); // Lá bài hiện tại

  const [selectedCells, setSelectedCells] = useState([]);
  const [bingoLines, setBingoLines] = useState([]);
  const [lives, setLives] = useState(3);
  const [loading, setLoading] = useState(true);
  const [gameStatus, setGameStatus] = useState("playing"); // playing, won, lost

  const initGame = async () => {
    setLoading(true);
    setLives(3);
    setSelectedCells([]);
    setBingoLines([]);
    setCurrentIndex(0);
    setGameStatus("playing");

    try {
      // B1: Lấy Grid 16 ô
      const gridRes = await fetch("/api/games/bingo/grid");
      const gridData = await gridRes.json();

      if (gridData.success) {
        setGrid(gridData.grid);

        // B2: Lấy bộ bài 50 lá dựa trên Grid vừa tạo
        const deckRes = await fetch("/api/games/bingo/deck", {
          method: "POST",
          body: JSON.stringify({ grid: gridData.grid }),
        });
        const deckData = await deckRes.json();

        if (deckData.success) {
          setDeck(deckData.deck);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initGame();
  }, []);

  // Xử lý khi bấm vào ô
  const handleCellClick = (cell) => {
    if (gameStatus !== "playing" || selectedCells.includes(cell.id)) return;

    const currentAnime = deck[currentIndex];
    const isCorrect = checkCondition(currentAnime, cell);

    if (isCorrect) {
      // Đúng -> Chọn ô -> Check Bingo
      const newSelected = [...selectedCells, cell.id];
      setSelectedCells(newSelected);
      checkBingo(newSelected);
      nextCard(); // Chuyển bài
    } else {
      // Sai -> Trừ mạng -> Chuyển bài
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives <= 0) setGameStatus("lost");
      nextCard();
    }
  };

  // Nút bỏ qua (Skip)
  const nextCard = () => {
    if (currentIndex < deck.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Hết bài mà chưa Bingo -> Thua? Hoặc random thêm?
      // Ở đây tôi cho là Thua nếu hết bài
      if (bingoLines.length === 0) setGameStatus("lost");
    }
  };

  const checkBingo = (currentSelected) => {
    const newBingos = [];
    WIN_PATTERNS.forEach((pattern, index) => {
      if (pattern.every((id) => currentSelected.includes(id))) {
        if (!bingoLines.includes(index)) newBingos.push(index);
      }
    });
    if (newBingos.length > 0) {
      setBingoLines([...bingoLines, ...newBingos]);
      // setGameStatus("won"); // Tùy bạn muốn 1 dòng là thắng hay chơi tiếp
    }
  };

  const currentAnime = deck[currentIndex];

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="spinner-border text-primary"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* HEADER */}
      <div className="bg-white shadow-sm sticky top-0 z-40 border-b p-3 mb-6 flex justify-between items-center max-w-4xl mx-auto">
        <Link href="/game" className="btn btn-sm btn-outline-secondary">
          Back
        </Link>
        <h1 className="font-bold text-blue-600">ANIME BINGO</h1>
        <div className="flex gap-2">
          <span>Cards: {50 - currentIndex}</span>
          <span>❤️ {lives}</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* LEFT: CURRENT CARD (DECK) */}
        <div className="flex flex-col items-center">
          {currentAnime && gameStatus === "playing" ? (
            <div className="bg-white p-4 rounded-xl shadow-lg border w-full max-w-sm text-center relative">
              <div className="absolute top-2 right-2 bg-slate-100 text-xs px-2 py-1 rounded-full font-bold">
                #{currentIndex + 1}/50
              </div>
              <img
                src={currentAnime.thumbnail}
                className="w-40 h-56 object-cover rounded-lg mx-auto mb-3 shadow-md"
                alt="cover"
              />
              <h3 className="font-bold text-lg line-clamp-2 mb-2">
                {currentAnime.title}
              </h3>

              {/* Nút Skip */}
              <button
                onClick={nextCard}
                className="btn btn-secondary w-full rounded-pill fw-bold"
              >
                Skip / Bỏ qua ⏭️
              </button>
              <p className="text-xs text-slate-400 mt-2">
                Bấm vào ô bên phải nếu trùng khớp
              </p>
            </div>
          ) : (
            <div className="text-center p-10">
              {gameStatus === "lost" && (
                <h2 className="text-red-500 font-bold text-2xl">GAME OVER</h2>
              )}
              <button onClick={initGame} className="btn btn-primary mt-4">
                Chơi lại
              </button>
            </div>
          )}
        </div>

        {/* RIGHT: BINGO GRID */}
        <div>
          {bingoLines.length > 0 && (
            <div className="mb-4 bg-yellow-100 text-yellow-800 p-2 rounded text-center font-bold animate-bounce">
              🎉 BINGO! ({bingoLines.length} lines)
            </div>
          )}

          <div className="grid grid-cols-4 gap-2 aspect-square">
            {grid.map((cell) => {
              const isSelected = selectedCells.includes(cell.id);
              return (
                <button
                  key={cell.id}
                  onClick={() => handleCellClick(cell)}
                  disabled={isSelected || gameStatus !== "playing"}
                  className={`
                                p-1 rounded-lg border-2 shadow-sm flex flex-col items-center justify-center text-center text-xs font-bold transition-all
                                ${
                                  isSelected
                                    ? "bg-green-500 text-white border-green-600"
                                    : "bg-white hover:bg-blue-50 text-slate-600"
                                }
                            `}
                >
                  <span className="mb-1 opacity-70 text-[10px]">
                    {cell.type}
                  </span>
                  {cell.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
