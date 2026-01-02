"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LOCAL_STORAGE_KEYS } from "@/constants/localKey";
import { api } from "@/app/api/baseJsonApi";

export default function Bingo() {
  const [grid, setGrid] = useState([]);
  const [deck, setDeck] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCells, setSelectedCells] = useState([]);
  const [bingoLines, setBingoLines] = useState([]);
  const [lives, setLives] = useState(0);
  const [loading, setLoading] = useState(true);

  // Mặc định luôn là playing hoặc kết quả, bỏ qua bước setup
  const [gameStatus, setGameStatus] = useState("playing");

  // Mặc định mục tiêu là 2 đường
  const DEFAULT_GOAL = 1;
  const [targetBingoGoal, setTargetBingoGoal] = useState(DEFAULT_GOAL);

  const [hintsLeft, setHintsLeft] = useState(3);
  const [activeHintIds, setActiveHintIds] = useState([]);

  const isInitialized = useRef(false);
  const STORAGE_KEY = LOCAL_STORAGE_KEYS.BINGO.PROGRESS;

  // --- 1. LOGIC KHÔI PHỤC HOẶC TẠO MỚI GAME ---
  useEffect(() => {
    if (isInitialized.current) return;

    const savedProgress = localStorage.getItem(STORAGE_KEY);

    if (savedProgress) {
      try {
        const data = JSON.parse(savedProgress);
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
          setLoading(false);
        } else {
          // Nếu save game là đã thắng/thua -> Chơi mới luôn
          initGame(DEFAULT_GOAL);
        }
      } catch (e) {
        console.error("Lỗi khôi phục, chơi mới:", e);
        initGame(DEFAULT_GOAL);
      }
    } else {
      // Không có save -> Chơi mới luôn
      initGame(DEFAULT_GOAL);
    }

    isInitialized.current = true;
  }, [STORAGE_KEY]);

  // --- 2. LOGIC LƯU TIẾN TRÌNH TỰ ĐỘNG ---
  useEffect(() => {
    if (!isInitialized.current || loading) return;

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
    loading,
    STORAGE_KEY,
  ]);

  // --- HÀM CHECK LOGIC (Giữ nguyên) ---
  const checkCondition = (anime, cell) => {
    if (!anime) return false;
    let isMatch = false;
    const val = cell.value;
    const year = anime.release_year || parseInt(anime.releaseYear?.name || 0);
    const views = anime.views || 0;

    switch (cell.type) {
      case "year_eq":
        isMatch = year === val;
        break;
      case "year_gt":
        isMatch = year > val;
        break;
      case "year_lt":
        isMatch = year < val;
        break;
      case "views_gt":
        isMatch = views > val;
        break;
      case "views_lt":
        isMatch = views < val;
        break;
      case "genre":
        if (Array.isArray(anime.genres)) {
          isMatch = anime.genres.some((g) =>
            typeof g === "string" ? g === val : g.name === val
          );
        }
        break;
      case "studio":
        if (Array.isArray(anime.studios)) {
          isMatch = anime.studios.some((s) =>
            typeof s === "string" ? s === val : s.name === val
          );
        }
        break;
      case "tag_match":
        if (Array.isArray(anime.tags)) {
          const inTags = anime.tags.some((t) =>
            typeof t === "string" ? t === val : t.name === val
          );
          if (inTags) isMatch = true;
        }
        if (!isMatch && anime.title) {
          isMatch = anime.title.toLowerCase().includes(val.toLowerCase());
        }
        break;
      case "censorship":
        isMatch =
          anime.censorship === val || anime.raw_data?.censorship === val;
        break;
      case "category":
        isMatch = anime.category === val || anime.raw_data?.category === val;
        break;
      default:
        isMatch = false;
    }

    // Check Fallback BE
    if (!isMatch && anime.matchedCellIds) {
      isMatch = anime.matchedCellIds.includes(cell.id);
    }
    return isMatch;
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

  // --- 3. KHỞI TẠO GAME MỚI ---
  const initGame = async (goal = DEFAULT_GOAL) => {
    setLoading(true);
    localStorage.removeItem(STORAGE_KEY);

    setTargetBingoGoal(goal);
    setLives(10);
    setHintsLeft(5); // 4 gợi ý

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

  // --- LOGIC HINT ---
  const handleUseHint = () => {
    if (hintsLeft <= 0 || gameStatus !== "playing") return;
    const currentAnime = deck[currentIndex];

    const correctIds = grid
      .filter((cell) => checkCondition(currentAnime, cell))
      .map((cell) => cell.id);

    const availableCorrectIds = correctIds.filter(
      (id) => !selectedCells.includes(id)
    );

    if (availableCorrectIds.length === 0) {
      alert("Lá bài này không khớp với ô trống nào trên bảng!");
      setHintsLeft((prev) => prev - 1);
      return;
    }

    const oneCorrect =
      availableCorrectIds[
        Math.floor(Math.random() * availableCorrectIds.length)
      ];
    const allIds = Array.from({ length: 16 }, (_, i) => i);
    const wrongIds = allIds.filter((id) => !correctIds.includes(id));
    const threeWrongs = [];
    for (let i = 0; i < 3; i++) {
      if (wrongIds.length > 0) {
        const idx = Math.floor(Math.random() * wrongIds.length);
        threeWrongs.push(wrongIds.splice(idx, 1)[0]);
      }
    }
    const hintBatch = [oneCorrect, ...threeWrongs].sort(
      () => Math.random() - 0.5
    );
    setActiveHintIds(hintBatch);
    setHintsLeft((prev) => prev - 1);
  };

  // --- LOGIC CLICK ---
  const handleCellClick = (cell) => {
    if (gameStatus !== "playing" || selectedCells.includes(cell.id)) return;
    const currentAnime = deck[currentIndex];

    const isCorrect = checkCondition(currentAnime, cell);

    if (isCorrect) {
      const newSelected = [...selectedCells, cell.id];
      setSelectedCells(newSelected);
      checkBingo(newSelected);
      setActiveHintIds([]);
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

  // --- RENDER ---
  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="spinner-border text-primary"></div>
        <div className="ms-3 fw-bold text-muted">Đang chia bài...</div>
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
            Mục tiêu: {targetBingoGoal} Dòng
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
                onClick={() => initGame(DEFAULT_GOAL)}
                className="px-5 shadow-lg btn btn-primary btn-lg rounded-pill"
              >
                Chơi lại
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
