"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import GameSearch from "@/components/game/HenTexto/GameSearch";
import { LOCAL_STORAGE_KEYS } from "@/app/constants/localKey";
import { api } from "@/app/api/baseJsonApi";

export default function TicTacToePage() {
  const [board, setBoard] = useState(null);
  const [gridState, setGridState] = useState(
    Array(3)
      .fill(null)
      .map(() => Array(3).fill(null))
  );
  const [selectedCell, setSelectedCell] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lives, setLives] = useState(9);

  const isInitialized = useRef(false);
  const STORAGE_KEY = LOCAL_STORAGE_KEYS.TICTACTOE.PROGRESS;

  const fetchNewBoard = async () => {
    const res = await api.get("/api/games/tictactoe/new");
    if (res.success) setBoard(res.board);
    setLoading(false);
    isInitialized.current = true;
  };

  // --- 1. LOGIC KHÔI PHỤC TIẾN TRÌNH (Sử dụng duy nhất 1 biến PROGRESS) ---
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);

    if (savedData) {
      try {
        const progress = JSON.parse(savedData);
        // Khôi phục đồng thời toàn bộ trạng thái bàn cờ
        setBoard(progress.board);
        setGridState(progress.gridState);
        setLives(progress.lives);
        setLoading(false);
        isInitialized.current = true;
      } catch (e) {
        console.error("❌ Lỗi phục hồi PROGRESS HenToHen:", e);
        fetchNewBoard();
      }
    } else {
      fetchNewBoard();
    }
  }, []);

  // --- 2. LOGIC LƯU TIẾN TRÌNH TỰ ĐỘNG (Gộp thành 1 Object) ---
  useEffect(() => {
    if (!isInitialized.current || !board) return;

    const progressToSave = {
      board,
      gridState,
      lives,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(progressToSave));
  }, [gridState, lives, board]);

  // --- 3. RESET GAME (Xóa key PROGRESS duy nhất) ---
  const handleNewGame = () => {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  };

  const handleGuess = async (anime) => {
    if (!selectedCell || !board) return;
    const { r, c } = selectedCell;
    if (gridState[r][c]) return;

    const json = await api.post(
      "/api/games/tictactoe/check",
      JSON.stringify({
        animeId: anime.id,
        rowAttr: board.rows[r],
        colAttr: board.cols[c],
      })
    );

    if (json.correct) {
      const newGrid = [...gridState];
      newGrid[r][c] = anime;
      setGridState(newGrid);
      setSelectedCell(null);
    } else {
      alert(json.message);
      setLives((prev) => prev - 1);
    }
  };

  const styles = {
    wrapper: {
      width: "100%",
      maxWidth: "800px",
      margin: "0 auto",
      padding: "10px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
    container: {
      display: "flex",
      flexDirection: "column",
      gap: "clamp(4px, 1.5vw, 12px)",
      padding: "clamp(10px, 3vw, 25px)",
      backgroundColor: "white",
      borderRadius: "24px",
      boxShadow: "0 20px 40px rgba(0,0,0,0.05)",
      width: "100%",
      maxWidth: "fit-content",
    },
    row: { display: "flex", gap: "clamp(4px, 1.5vw, 12px)" },
    cellBase: {
      width: "clamp(75px, 20vw, 150px)",
      height: "clamp(75px, 20vw, 150px)",
      borderRadius: "clamp(8px, 2vw, 16px)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
      position: "relative",
      overflow: "hidden",
      fontSize: "clamp(0.6rem, 1.5vw, 0.9rem)",
    },
    headerCell: (isRow) => ({
      backgroundColor: isRow ? "#f0fdf4" : "#f0f9ff",
      border: "1px solid rgba(0,0,0,0.05)",
      textAlign: "center",
      padding: "5px",
    }),
    playableCell: (isSelected, hasData) => ({
      backgroundColor: "#ffffff",
      cursor: hasData ? "default" : "pointer",
      border: isSelected
        ? "3px solid #fd7e14"
        : hasData
        ? "none"
        : "1.5px dashed #cbd5e1",
      transform: isSelected ? "scale(1.05)" : "scale(1)",
      boxShadow: isSelected ? "0 10px 20px rgba(253, 126, 20, 0.2)" : "none",
      zIndex: isSelected ? 10 : 1,
    }),
  };

  if (loading)
    return (
      <div className="min-vh-100 d-flex flex-column justify-content-center align-items-center bg-light">
        <div className="mb-3 spinner-border text-primary" role="status"></div>
        <h5 className="text-muted fw-bold">Đang thiết lập bàn cờ...</h5>
      </div>
    );

  return (
    <div className="pb-5 min-vh-100 bg-light">
      <nav className="mb-4 bg-white shadow-sm navbar navbar-light sticky-top">
        <div className="container">
          <Link
            href="/game"
            className="px-3 btn btn-sm btn-outline-secondary rounded-pill fw-bold"
          >
            {" "}
            &larr; Back{" "}
          </Link>
          <div className="gap-3 d-flex align-items-center">
            <div className="px-3 py-2 border badge bg-danger bg-opacity-10 text-danger border-danger rounded-pill font-monospace">
              {" "}
              LIVES: {lives}{" "}
            </div>
            <button
              className="px-3 shadow-sm btn btn-sm btn-primary rounded-pill fw-bold"
              onClick={handleNewGame}
            >
              {" "}
              Ván mới{" "}
            </button>
          </div>
        </div>
      </nav>

      <div style={styles.wrapper}>
        <div
          className="mb-4 w-100 sticky-top"
          style={{ maxWidth: "600px", top: "75px", zIndex: 100 }}
        >
          <div className="p-3 mx-2 bg-white border shadow-lg rounded-4">
            {selectedCell ? (
              <div className="mb-2 text-center animate-in fade-in">
                <small
                  className="text-muted fw-bold"
                  style={{ fontSize: "0.65rem" }}
                >
                  {" "}
                  Mục tiêu:{" "}
                </small>
                <div className="gap-1 mt-1 d-flex justify-content-center align-items-center">
                  <span className="badge bg-success truncate-text">
                    {" "}
                    {board.rows[selectedCell.r].value}{" "}
                  </span>
                  <span className="text-muted">+</span>
                  <span className="badge bg-primary truncate-text">
                    {" "}
                    {board.cols[selectedCell.c].value}{" "}
                  </span>
                </div>
              </div>
            ) : (
              <p className="mb-1 text-center text-muted small fst-italic">
                {" "}
                Bấm chọn ô trống bên dưới{" "}
              </p>
            )}
            <div style={{ opacity: selectedCell ? 1 : 0.4 }}>
              <GameSearch onGuess={handleGuess} disabled={!selectedCell} />
            </div>
          </div>
        </div>

        <div style={styles.container}>
          <div style={styles.row}>
            <div style={styles.cellBase}></div>
            {board?.cols?.map((col, i) => (
              <div
                key={i}
                style={{ ...styles.cellBase, ...styles.headerCell(false) }}
              >
                <b
                  className="text-primary text-uppercase"
                  style={{ fontSize: "0.55rem", opacity: 0.6 }}
                >
                  {" "}
                  {col.type}{" "}
                </b>
                <div className="px-1 mt-1 fw-bold line-clamp-2">
                  {" "}
                  {col.value}{" "}
                </div>
              </div>
            ))}
          </div>

          {board?.rows?.map((row, r) => (
            <div key={r} style={styles.row}>
              <div style={{ ...styles.cellBase, ...styles.headerCell(true) }}>
                <b
                  className="text-success text-uppercase"
                  style={{ fontSize: "0.55rem", opacity: 0.6 }}
                >
                  {" "}
                  {row.type}{" "}
                </b>
                <div className="px-1 mt-1 fw-bold line-clamp-2">
                  {" "}
                  {row.value}{" "}
                </div>
              </div>
              {gridState[r].map((cellData, c) => {
                const isSelected =
                  selectedCell?.r === r && selectedCell?.c === c;
                return (
                  <div
                    key={c}
                    onClick={() => !cellData && setSelectedCell({ r, c })}
                    style={{
                      ...styles.cellBase,
                      ...styles.playableCell(isSelected, !!cellData),
                    }}
                  >
                    {cellData ? (
                      <img
                        src={cellData.thumbnail}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        alt="poster"
                      />
                    ) : isSelected ? (
                      <div
                        className="spinner-border text-warning border-3"
                        style={{ width: "30%", height: "30%" }}
                      />
                    ) : (
                      <span className="opacity-25" style={{ fontSize: "2rem" }}>
                        {" "}
                        +{" "}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
