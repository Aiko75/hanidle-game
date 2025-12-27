"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LOCAL_STORAGE_KEYS } from "@/app/constants/localKey";
import { api } from "@/app/api/baseJsonApi";

export default function BingoGamePage() {
  const [grid, setGrid] = useState([]);
  const [deck, setDeck] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCells, setSelectedCells] = useState([]);
  const [bingoLines, setBingoLines] = useState([]);
  const [lives, setLives] = useState(0);
  const [loading, setLoading] = useState(true);
  const [gameStatus, setGameStatus] = useState("setup"); // setup, playing, won, lost
  const [targetBingoGoal, setTargetBingoGoal] = useState(1); // Mục tiêu: 1, 2, 3 đường
  const [hintsLeft, setHintsLeft] = useState(3);
  const [activeHintIds, setActiveHintIds] = useState([]); // Chứa 4 ID ô đang được gợi ý

  const isInitialized = useRef(false);
  const STORAGE_KEY = LOCAL_STORAGE_KEYS.BINGO.PROGRESS;

  // --- 1. LOGIC KHÔI PHỤC TIẾN TRÌNH ---
  useEffect(() => {
    const savedProgress = localStorage.getItem(STORAGE_KEY);
    if (savedProgress) {
      try {
        const data = JSON.parse(savedProgress);
        // Chỉ khôi phục nếu game đang trong trạng thái 'playing'
        if (data.gameStatus === "playing") {
          setGrid(data.grid);
          setDeck(data.deck);
          setCurrentIndex(data.currentIndex);
          setSelectedCells(data.selectedCells);
          setBingoLines(data.bingoLines);
          setLives(data.lives);
          setTargetBingoGoal(data.targetBingoGoal);
          setHintsLeft(data.hintsLeft);
          setGameStatus("playing");
        }
      } catch (e) {
        console.error("Lỗi khôi phục tiến trình Bingo:", e);
      }
    }
    setLoading(false);
    isInitialized.current = true;
  }, []);

  // --- 2. LOGIC LƯU TIẾN TRÌNH TỰ ĐỘNG ---
  useEffect(() => {
    if (!isInitialized.current || gameStatus === "setup") return;

    if (gameStatus === "playing") {
      const stateToSave = {
        grid,
        deck,
        currentIndex,
        selectedCells,
        bingoLines,
        lives,
        targetBingoGoal,
        hintsLeft,
        gameStatus,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } else {
      // Nếu thắng hoặc thua, xóa dữ liệu tiến trình để ván sau chơi mới
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [
    grid,
    deck,
    currentIndex,
    selectedCells,
    bingoLines,
    lives,
    gameStatus,
    hintsLeft,
    targetBingoGoal,
  ]);

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
      case "views_lt":
        return (anime.views || 0) < val;
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

  // --- 3. CẬP NHẬT INIT GAME (Xóa dữ liệu cũ khi bắt đầu mới) ---
  const initGame = async (goal) => {
    setLoading(true);
    localStorage.removeItem(STORAGE_KEY); // Clear ván cũ
    setTargetBingoGoal(goal);
    setLives(goal + 2);
    setHintsLeft(goal + 2);
    setSelectedCells([]);
    setBingoLines([]);
    setCurrentIndex(0);
    setActiveHintIds([]);
    setGameStatus("playing");

    try {
      const gridData = await api.get("/api/games/bingo/grid");
      if (gridData.success) {
        setGrid(gridData.grid);
        const deckData = await api.post(
          "/api/games/bingo/deck",
          JSON.stringify({ grid: gridData.grid, goal: goal })
        );
        if (deckData.success) setDeck(deckData.deck);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIC GỢI Ý ĐÃ CẬP NHẬT ---
  const handleUseHint = () => {
    if (hintsLeft <= 0 || gameStatus !== "playing") return;

    const currentAnime = deck[currentIndex];

    // Bước 1: Xác định tất cả các Cell ID đúng dựa trên logic 2 lớp
    const correctIds = grid
      .filter((cell) => {
        let isMatch = checkCondition(currentAnime, cell);
        if (!isMatch) {
          isMatch = currentAnime.matchedCellIds?.includes(cell.id);
        }
        return isMatch;
      })
      .map((cell) => cell.id);

    // Bước 2: Lọc ra các ô đúng mà người dùng chưa chọn
    const availableCorrectIds = correctIds.filter(
      (id) => !selectedCells.includes(id)
    );

    if (availableCorrectIds.length === 0) {
      alert("Lá bài này không khớp với ô trống nào trên bảng!");
      setHintsLeft((prev) => prev - 1);
      return;
    }

    // Bước 3: Lấy 1 ô đúng ngẫu nhiên từ danh sách đã xác định ở Bước 1
    const oneCorrect =
      availableCorrectIds[
        Math.floor(Math.random() * availableCorrectIds.length)
      ];

    // Bước 4: Xác định các ô sai (không nằm trong danh sách correctIds)
    const allIds = Array.from({ length: 16 }, (_, i) => i);
    const wrongIds = allIds.filter((id) => !correctIds.includes(id));
    const threeWrongs = [];
    for (let i = 0; i < 3; i++) {
      if (wrongIds.length > 0) {
        const idx = Math.floor(Math.random() * wrongIds.length);
        threeWrongs.push(wrongIds.splice(idx, 1)[0]);
      }
    }

    // Bước 5: Trộn và hiển thị
    const hintBatch = [oneCorrect, ...threeWrongs].sort(
      () => Math.random() - 0.5
    );
    setActiveHintIds(hintBatch);
    setHintsLeft((prev) => prev - 1);
  };

  const handleCellClick = (cell) => {
    if (gameStatus !== "playing" || selectedCells.includes(cell.id)) return;

    const currentAnime = deck[currentIndex];
    let isCorrect = checkCondition(currentAnime, cell);
    if (!isCorrect) {
      isCorrect = currentAnime.matchedCellIds?.includes(cell.id);
    }

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
      <div className="flex items-center justify-center min-h-screen p-4 bg-slate-100">
        <div className="w-full max-w-sm p-8 text-center bg-white border shadow-xl rounded-2xl">
          <h2 className="mb-6 text-2xl font-bold text-blue-600">
            Chọn Mục Tiêu Bingo
          </h2>
          <div className="grid gap-3">
            {[1, 2, 3].map((num) => (
              <button
                key={num}
                onClick={() => initGame(num)}
                className="py-3 btn btn-outline-primary btn-lg rounded-pill fw-bold hover-scale"
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
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="spinner-border text-primary"></div>
      </div>
    );

  return (
    <div className="min-h-screen pb-20 bg-slate-50">
      {/* HEADER */}
      <div className="sticky top-0 z-40 flex items-center justify-between max-w-6xl p-3 mx-auto mb-6 bg-white border-b shadow-sm">
        <div className="flex items-center gap-4">
          <Link
            href="/game"
            className="px-3 btn btn-sm btn-outline-secondary rounded-pill"
          >
            Back
          </Link>
          <div className="px-3 py-2 font-bold border badge bg-primary bg-opacity-10 text-primary border-primary rounded-pill">
            Goal: {targetBingoGoal} {targetBingoGoal > 1 ? "Lines" : "Line"}
          </div>
        </div>

        <h1 className="hidden text-xl font-black tracking-tighter text-blue-600 md:block">
          ANIME BINGO
        </h1>

        <div className="flex items-center gap-4">
          <div className="text-sm font-bold text-slate-500">
            Card:{" "}
            <span className="text-dark">
              {currentIndex + 1}/{deck.length}
            </span>
          </div>
          <div className="px-3 py-2 shadow-sm badge bg-danger rounded-pill fs-6">
            ❤️ {lives}
          </div>
        </div>
      </div>

      <div className="grid items-start max-w-6xl grid-cols-1 gap-8 px-4 mx-auto md:grid-cols-2">
        {/* LEFT: DECK */}
        <div
          className="flex flex-col items-center sticky-md-top"
          style={{ top: "80px" }}
        >
          {gameStatus === "playing" ? (
            <div className="w-full max-w-md p-6 text-center transition-all bg-white border shadow-lg rounded-2xl">
              <img
                src={deck[currentIndex]?.thumbnail}
                className="object-cover w-48 h-64 mx-auto mb-4 border shadow-md rounded-xl"
                alt="cover"
              />
              <h3 className="mb-4 text-lg font-bold leading-tight wrap-break-words text-slate-800">
                {deck[currentIndex]?.title}
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={nextCard}
                  className="py-2 border btn btn-light rounded-pill fw-bold text-muted"
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
            <div className="w-full max-w-md p-8 text-center bg-white border shadow-lg rounded-2xl animate-in zoom-in">
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
              <p className="mb-6 text-muted">
                Bạn đã đạt {bingoLines.length}/{targetBingoGoal} đường Bingo.
              </p>
              <button
                onClick={() => setGameStatus("setup")}
                className="px-5 shadow-lg btn btn-primary btn-lg rounded-pill"
              >
                Chơi ván mới
              </button>
            </div>
          )}
        </div>

        {/* RIGHT: GRID */}
        <div>
          <div className="flex items-end justify-between mb-4">
            <h5 className="mb-0 font-bold text-slate-700">Bảng Bingo 4x4</h5>
            <div className="text-sm font-bold text-blue-600">
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
