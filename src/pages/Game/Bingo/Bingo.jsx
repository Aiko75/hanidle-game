"use client";

import { useState } from "react";
import Link from "next/link";

export default function BingoGamePage() {
  const [grid, setGrid] = useState([]);
  const [deck, setDeck] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCells, setSelectedCells] = useState([]);
  const [bingoLines, setBingoLines] = useState([]);
  const [lives, setLives] = useState(10);
  const [loading, setLoading] = useState(true);
  const [gameStatus, setGameStatus] = useState("setup"); // setup, playing, won, lost

  // --- NEW STATES ---
  const [targetBingoGoal, setTargetBingoGoal] = useState(1); // Mục tiêu: 1, 2, 3 đường
  const [hintsLeft, setHintsLeft] = useState(3);
  const [activeHintIds, setActiveHintIds] = useState([]); // Chứa 4 ID ô đang được gợi ý

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

  const initGame = async (goal) => {
    setLoading(true);
    setTargetBingoGoal(goal);
    setLives(10);
    setHintsLeft(3);
    setSelectedCells([]);
    setBingoLines([]);
    setCurrentIndex(0);
    setActiveHintIds([]);
    setGameStatus("playing");

    try {
      const gridRes = await fetch("/api/games/bingo/grid");
      const gridData = await gridRes.json();

      if (gridData.success) {
        setGrid(gridData.grid);
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

  // --- LOGIC GỢI Ý ---
  const handleUseHint = () => {
    if (hintsLeft <= 0 || gameStatus !== "playing") return;

    const currentAnime = deck[currentIndex];
    const correctIds = currentAnime.matchedCellIds || [];

    // Lọc ra các ô đúng mà người dùng chưa chọn
    const availableCorrectIds = correctIds.filter(
      (id) => !selectedCells.includes(id)
    );

    if (availableCorrectIds.length === 0) {
      alert("Lá bài này không khớp với ô trống nào trên bảng!");
      return;
    }

    // 1. Lấy 1 ô đúng ngẫu nhiên
    const oneCorrect =
      availableCorrectIds[
        Math.floor(Math.random() * availableCorrectIds.length)
      ];

    // 2. Lấy 3 ô sai ngẫu nhiên
    const allIds = Array.from({ length: 16 }, (_, i) => i);
    const wrongIds = allIds.filter((id) => !correctIds.includes(id));
    const threeWrongs = [];
    for (let i = 0; i < 3; i++) {
      if (wrongIds.length > 0) {
        const idx = Math.floor(Math.random() * wrongIds.length);
        threeWrongs.push(wrongIds.splice(idx, 1)[0]);
      }
    }

    // Trộn 4 ô này lại để người dùng không biết cái nào là cái nào
    const hintBatch = [oneCorrect, ...threeWrongs].sort(
      () => Math.random() - 0.5
    );
    setActiveHintIds(hintBatch);
    setHintsLeft((prev) => prev - 1);
  };

  const handleCellClick = (cell) => {
    if (gameStatus !== "playing" || selectedCells.includes(cell.id)) return;

    const currentAnime = deck[currentIndex];
    // Sử dụng matchedCellIds truyền từ BE để check cho nhanh và chuẩn
    const isCorrect = currentAnime.matchedCellIds?.includes(cell.id);

    if (isCorrect) {
      const newSelected = [...selectedCells, cell.id];
      setSelectedCells(newSelected);
      checkBingo(newSelected);
      setActiveHintIds([]); // Reset gợi ý khi đã chọn
      nextCard();
    } else {
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives <= 0) setGameStatus("lost");
      setActiveHintIds([]);
      nextCard();
    }
  };

  const nextCard = () => {
    if (currentIndex < deck.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      if (bingoLines.length < targetBingoGoal) setGameStatus("lost");
    }
  };

  const checkBingo = (currentSelected) => {
    const newLines = [];
    WIN_PATTERNS.forEach((pattern, index) => {
      if (pattern.every((id) => currentSelected.includes(id))) {
        if (!bingoLines.includes(index)) newLines.push(index);
      }
    });

    if (newLines.length > 0) {
      const totalLines = [...bingoLines, ...newLines];
      setBingoLines(totalLines);
      if (totalLines.length >= targetBingoGoal) {
        setGameStatus("won");
      }
    }
  };

  // --- UI COMPONENTS ---

  if (gameStatus === "setup") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-sm w-full border">
          <h2 className="text-2xl font-bold mb-6 text-blue-600">
            Chọn Mục Tiêu Bingo
          </h2>
          <div className="grid gap-3">
            {[1, 2, 3].map((num) => (
              <button
                key={num}
                onClick={() => initGame(num)}
                className="btn btn-outline-primary btn-lg rounded-pill fw-bold py-3 hover-scale"
              >
                Hoàn thành {num} đường Bingo
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="spinner-border text-primary"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* HEADER */}
      <div className="bg-white shadow-sm sticky top-0 z-40 border-b p-3 mb-6 flex justify-between items-center max-w-6xl mx-auto">
        <div className="flex items-center gap-4">
          <Link
            href="/game"
            className="btn btn-sm btn-outline-secondary rounded-pill px-3"
          >
            Back
          </Link>
          <div className="badge bg-primary bg-opacity-10 text-primary border border-primary px-3 py-2 rounded-pill font-bold">
            Goal: {targetBingoGoal} Lines
          </div>
        </div>

        <h1 className="font-black text-blue-600 text-xl tracking-tighter hidden md:block">
          ANIME BINGO
        </h1>

        <div className="flex items-center gap-4">
          <div className="text-sm font-bold text-slate-500">
            Card: <span className="text-dark">{currentIndex + 1}/50</span>
          </div>
          <div className="badge bg-danger px-3 py-2 rounded-pill fs-6 shadow-sm">
            ❤️ {lives}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* LEFT: DECK */}
        <div
          className="flex flex-col items-center sticky-md-top"
          style={{ top: "80px" }}
        >
          {gameStatus === "playing" ? (
            <div className="bg-white p-6 rounded-2xl shadow-lg border w-full max-w-md text-center transition-all">
              <img
                src={deck[currentIndex]?.thumbnail}
                className="w-48 h-64 object-cover rounded-xl mx-auto mb-4 shadow-md border"
                alt="cover"
              />
              <h3 className="font-bold text-xl mb-4 line-clamp-1">
                {deck[currentIndex]?.title}
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={nextCard}
                  className="btn btn-light rounded-pill fw-bold border text-muted py-2"
                >
                  Bỏ qua (Skip)
                </button>
                <button
                  onClick={handleUseHint}
                  disabled={hintsLeft <= 0}
                  className={`btn rounded-pill fw-bold py-2 ${
                    hintsLeft > 0
                      ? "btn-warning shadow"
                      : "btn-light text-muted"
                  }`}
                >
                  💡 Gợi ý ({hintsLeft})
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-2xl shadow-lg border text-center w-full max-w-md animate-in zoom-in">
              <div
                className={`display-1 mb-4 ${
                  gameStatus === "won" ? "text-success" : "text-danger"
                }`}
              >
                {gameStatus === "won" ? "🏆" : "💀"}
              </div>
              <h2
                className={`font-bold text-3xl mb-2 ${
                  gameStatus === "won" ? "text-success" : "text-danger"
                }`}
              >
                {gameStatus === "won" ? "BINGO MASTER!" : "GAME OVER"}
              </h2>
              <p className="text-muted mb-6">
                Bạn đã đạt {bingoLines.length}/{targetBingoGoal} đường Bingo.
              </p>
              <button
                onClick={() => setGameStatus("setup")}
                className="btn btn-primary btn-lg px-5 rounded-pill shadow-lg"
              >
                Chơi ván mới
              </button>
            </div>
          )}
        </div>

        {/* RIGHT: GRID */}
        <div>
          <div className="flex justify-between items-end mb-4">
            <h5 className="font-bold text-slate-700 mb-0">Bảng Bingo 4x4</h5>
            <div className="text-sm text-blue-600 font-bold">
              Đã đạt: {bingoLines.length} / {targetBingoGoal} lines
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 aspect-square">
            {grid.map((cell) => {
              const isSelected = selectedCells.includes(cell.id);
              const isHinted = activeHintIds.includes(cell.id);

              return (
                <button
                  key={cell.id}
                  onClick={() => handleCellClick(cell)}
                  disabled={isSelected || gameStatus !== "playing"}
                  className={`
                    p-1 rounded-xl border-2 shadow-sm flex flex-col items-center justify-center text-center text-xs font-bold transition-all h-full
                    ${
                      isSelected
                        ? "bg-green-500 text-white border-green-600 scale-95 shadow-none"
                        : "bg-white hover:bg-blue-50 text-slate-600"
                    }
                    ${
                      isHinted && !isSelected
                        ? "border-warning border-4 animate-pulse ring ring-warning ring-opacity-20"
                        : "border-slate-100"
                    }
                  `}
                >
                  <span
                    className={`mb-1 opacity-50 text-[9px] uppercase tracking-tighter ${
                      isSelected ? "text-white" : ""
                    }`}
                  >
                    {cell.type.replace("_", " ")}
                  </span>
                  <div className="line-clamp-3">{cell.label}</div>
                  {isHinted && !isSelected && (
                    <div className="text-[8px] mt-1 bg-warning text-dark px-1 rounded">
                      HINT
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
