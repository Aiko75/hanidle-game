"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import GameSearch from "@/components/game/HenTexto/GameSearch";

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

  // --- CẤU HÌNH GIAO DIỆN (Dễ dàng chỉnh sửa tại đây) ---
  const styles = {
    // Container bao ngoài cùng
    wrapper: {
      width: "100%",
      maxWidth: "800px",
      margin: "0 auto",
      padding: "10px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
    // Bảng Grid
    container: {
      display: "flex",
      flexDirection: "column",
      gap: "clamp(4px, 1.5vw, 12px)", // Giãn cách tự co theo màn hình
      padding: "clamp(10px, 3vw, 25px)",
      backgroundColor: "white",
      borderRadius: "24px",
      boxShadow: "0 20px 40px rgba(0,0,0,0.05)",
      width: "100%",
      maxWidth: "fit-content",
    },
    row: {
      display: "flex",
      gap: "clamp(4px, 1.5vw, 12px)",
    },
    cellBase: {
      // Ô sẽ có kích thước từ 70px (mobile) đến 150px (desktop)
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
      fontSize: "clamp(0.6rem, 1.5vw, 0.9rem)", // Font chữ cũng co giãn
    },
    headerCell: (isRow) => ({
      backgroundColor: isRow ? "#f0fdf4" : "#f0f9ff", // Màu xanh lá nhẹ cho hàng, xanh dương cho cột
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

  useEffect(() => {
    fetch("/api/games/tictactoe/new")
      .then((res) => res.json())
      .then((res) => {
        if (res.success) setBoard(res.board);
        setLoading(false);
      });
  }, []);

  const handleGuess = async (anime) => {
    if (!selectedCell || !board) return;
    const { r, c } = selectedCell;
    if (gridState[r][c]) return;

    const res = await fetch("/api/games/tictactoe/check", {
      method: "POST",
      body: JSON.stringify({
        animeId: anime.id,
        rowAttr: board.rows[r],
        colAttr: board.cols[c],
      }),
    });
    const json = await res.json();

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

  if (loading)
    return (
      <div className="min-vh-100 d-flex flex-column justify-content-center align-items-center bg-light">
        <div className="spinner-border text-primary mb-3" role="status"></div>
        <h5 className="text-muted fw-bold tracking-tight">
          Đang tải dữ liệu H-Anime...
        </h5>
      </div>
    );

  return (
    <div className="min-vh-100 bg-light pb-5">
      <nav className="navbar navbar-light bg-white shadow-sm sticky-top mb-4">
        <div className="container">
          <Link
            href="/game"
            className="btn btn-sm btn-outline-secondary rounded-pill px-3 fw-bold"
          >
            &larr; Back
          </Link>
          <div className="d-flex align-items-center gap-3">
            <div className="badge bg-danger bg-opacity-10 text-danger border border-danger px-3 py-2 rounded-pill font-monospace">
              LIVES: {lives}
            </div>
            <button
              className="btn btn-sm btn-primary rounded-pill px-3 fw-bold shadow-sm"
              onClick={() => window.location.reload()}
            >
              Ván mới
            </button>
          </div>
        </div>
      </nav>

      <div style={styles.wrapper}>
        {/* --- SEARCH AREA (Responsive) --- */}
        <div
          className="w-100 mb-4 sticky-top"
          style={{ maxWidth: "600px", top: "75px", zIndex: 100 }}
        >
          <div className="bg-white p-3 rounded-4 shadow-lg border mx-2">
            {selectedCell ? (
              <div className="mb-2 text-center animate-in fade-in">
                <small
                  className="text-muted fw-bold"
                  style={{ fontSize: "0.65rem" }}
                >
                  Mục tiêu:
                </small>
                <div className="d-flex justify-content-center align-items-center gap-1 mt-1">
                  <span className="badge bg-success truncate-text">
                    {board.rows[selectedCell.r].value}
                  </span>
                  <span className="text-muted">+</span>
                  <span className="badge bg-primary truncate-text">
                    {board.cols[selectedCell.c].value}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-center mb-1 text-muted small fst-italic">
                Bấm chọn ô trống bên dưới
              </p>
            )}
            <div style={{ opacity: selectedCell ? 1 : 0.4 }}>
              <GameSearch onGuess={handleGuess} disabled={!selectedCell} />
            </div>
          </div>
        </div>

        {/* --- MAIN GAME BOARD (Sử dụng clamp để res) --- */}
        <div style={styles.container}>
          {/* Header Row */}
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
                  {col.type}
                </b>
                <div className="fw-bold mt-1 line-clamp-2 px-1">
                  {col.value}
                </div>
              </div>
            ))}
          </div>

          {/* Data Rows */}
          {board?.rows?.map((row, r) => (
            <div key={r} style={styles.row}>
              <div style={{ ...styles.cellBase, ...styles.headerCell(true) }}>
                <b
                  className="text-success text-uppercase"
                  style={{ fontSize: "0.55rem", opacity: 0.6 }}
                >
                  {row.type}
                </b>
                <div className="fw-bold mt-1 line-clamp-2 px-1">
                  {row.value}
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
                        +
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .truncate-text {
          max-width: 100px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        @media (max-width: 576px) {
          .truncate-text {
            max-width: 70px;
          }
        }
      `}</style>
    </div>
  );
}
