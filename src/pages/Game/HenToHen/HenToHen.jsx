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
  // selectedCell giờ sẽ dùng để highlight ô đang chọn thay vì mở modal
  const [selectedCell, setSelectedCell] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lives, setLives] = useState(9);

  // 1. Load đề bài
  useEffect(() => {
    fetch("/api/games/tictactoe/new")
      .then((res) => res.json())
      .then((res) => {
        if (res.success) setBoard(res.board);
        setLoading(false);
      });
  }, []);

  // 2. Xử lý đoán
  const handleGuess = async (anime) => {
    if (!selectedCell || !board) return;
    const { r, c } = selectedCell;

    // Nếu ô này đã có dữ liệu rồi thì chặn, không cho điền đè (hoặc tùy bạn)
    if (gridState[r][c]) return;

    const rowAttr = board.rows[r];
    const colAttr = board.cols[c];

    const res = await fetch("/api/games/tictactoe/check", {
      method: "POST",
      body: JSON.stringify({ animeId: anime.id, rowAttr, colAttr }),
    });
    const json = await res.json();

    if (json.correct) {
      const newGrid = [...gridState];
      newGrid[r][c] = anime;
      setGridState(newGrid);
      setSelectedCell(null); // Bỏ chọn sau khi điền đúng
    } else {
      alert("Sai rồi! Bộ này không thỏa mãn cả 2 điều kiện.");
      setLives((prev) => prev - 1);
    }
  };

  // --- RENDERING ---

  if (loading)
    return (
      <div className="min-vh-100 d-flex flex-column justify-content-center align-items-center bg-light">
        <div className="spinner-border text-primary mb-3" role="status"></div>
        <h5 className="text-muted">Đang tạo bảng đấu...</h5>
      </div>
    );

  if (!board) {
    return (
      <div className="min-vh-100 d-flex flex-column justify-content-center align-items-center bg-light p-3">
        <div
          className="bg-white p-5 rounded-4 shadow text-center animate-in zoom-in border border-light"
          style={{ maxWidth: "450px" }}
        >
          {/* Icon minh họa */}
          <div className="mb-4">
            <div
              className="d-inline-flex justify-content-center align-items-center bg-warning bg-opacity-10 rounded-circle"
              style={{ width: "80px", height: "80px" }}
            >
              <span className="display-4">🧩</span>
            </div>
          </div>

          <h3 className="fw-bold text-dark mb-3">Không thể tạo bảng đấu</h3>

          <p className="text-muted mb-4">
            Hệ thống không tìm thấy đề bài phù hợp hoặc đã có lỗi xảy ra. Đừng
            lo, hãy thử tạo lại một ván mới nhé!
          </p>

          <div className="d-flex justify-content-center gap-3">
            <Link
              href="/game"
              className="btn btn-outline-secondary rounded-pill px-4 py-2 fw-bold"
            >
              Thoát
            </Link>
            <button
              className="btn btn-primary rounded-pill px-4 py-2 fw-bold shadow-sm hover-scale"
              onClick={() => window.location.reload()}
            >
              Tạo lại ngay
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light pb-5">
      {/* --- HEADER NAVIGATION --- */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
        <div className="container">
          <div className="d-flex align-items-center gap-3">
            <Link
              href="/game"
              className="btn btn-outline-secondary rounded-pill px-3 fw-bold btn-sm"
            >
              <i className="bi bi-arrow-left"></i> Back
            </Link>
            <span className="navbar-brand mb-0 h1 fw-bold text-primary d-none d-sm-block">
              HenToHen
            </span>
          </div>

          <div className="d-flex align-items-center gap-3">
            <div className="d-flex align-items-center bg-danger bg-opacity-10 text-danger px-3 py-1 rounded-pill fw-bold border border-danger border-opacity-25">
              ❤️ {lives}
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

      <div className="container d-flex flex-column align-items-center pt-4 animate-in fade-in">
        {/* --- KHU VỰC TÌM KIẾM (ĐẶT Ở ĐÂY) --- */}
        <div
          className="w-100 mb-4 sticky-md-top"
          style={{ maxWidth: "600px", zIndex: 100 }}
        >
          <div className="bg-white p-3 rounded-4 shadow-sm border">
            {selectedCell ? (
              <div className="mb-2 text-center animate-in slide-in-from-top">
                <small
                  className="text-muted text-uppercase fw-bold"
                  style={{ fontSize: "0.7rem" }}
                >
                  Đang tìm cho ô:
                </small>
                <div className="d-flex justify-content-center align-items-center gap-2 mt-1">
                  <span className="badge bg-success bg-opacity-10 text-success border border-success px-2">
                    {board.rows[selectedCell.r].value}
                  </span>
                  <span className="text-muted">+</span>
                  <span className="badge bg-primary bg-opacity-10 text-primary border border-primary px-2">
                    {board.cols[selectedCell.c].value}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center mb-2 text-muted fst-italic">
                <small>Hãy bấm vào một ô trống bên dưới để bắt đầu đoán</small>
              </div>
            )}

            {/* Search Bar luôn hiển thị, nhưng disable nếu chưa chọn ô */}
            <div
              className={!selectedCell ? "opacity-50 pointer-events-none" : ""}
            >
              <GameSearch onGuess={handleGuess} disabled={!selectedCell} />
            </div>
          </div>
        </div>

        {/* --- MAIN GAME BOARD --- */}
        <div className="overflow-auto p-2" style={{ maxWidth: "100%" }}>
          <div
            className="d-flex flex-column gap-2"
            style={{ minWidth: "340px" }}
          >
            {/* 1. Hàng Tiêu đề Cột */}
            <div className="d-flex gap-2">
              <div style={{ width: 100, height: 100 }}></div>
              {board?.cols?.map((col, i) => (
                <div
                  key={i}
                  className="d-flex flex-column justify-content-center align-items-center bg-white text-center p-2 rounded-3 shadow-sm border border-primary border-opacity-25 text-primary"
                  style={{ width: 100, height: 100 }}
                >
                  <small
                    className="text-uppercase fw-bold opacity-50"
                    style={{ fontSize: "0.65rem" }}
                  >
                    {col.type}
                  </small>
                  <span
                    className="fw-bold text-truncate w-100"
                    style={{ fontSize: "0.8rem" }}
                  >
                    {col.value}
                  </span>
                </div>
              ))}
            </div>

            {/* 2. Các Hàng Dữ Liệu */}
            {board?.rows?.map((row, r) => (
              <div key={r} className="d-flex gap-2">
                {/* Tiêu đề Hàng */}
                <div
                  className="d-flex flex-column justify-content-center align-items-center bg-white text-center p-2 rounded-3 shadow-sm border border-success border-opacity-25 text-success"
                  style={{ width: 100, height: 100 }}
                >
                  <small
                    className="text-uppercase fw-bold opacity-50"
                    style={{ fontSize: "0.65rem" }}
                  >
                    {row.type}
                  </small>
                  <span
                    className="fw-bold text-truncate w-100"
                    style={{ fontSize: "0.8rem" }}
                  >
                    {row.value}
                  </span>
                </div>

                {/* 3 Ô GAME PLAY */}
                {gridState[r].map((cellData, c) => {
                  // Kiểm tra xem ô này có đang được chọn không
                  const isSelected =
                    selectedCell?.r === r && selectedCell?.c === c;

                  return (
                    <div
                      key={c}
                      onClick={() => !cellData && setSelectedCell({ r, c })}
                      className={`
                        position-relative rounded-3 d-flex justify-content-center align-items-center transition-all
                        ${
                          cellData
                            ? "bg-white border-0 shadow-sm"
                            : "bg-white cursor-pointer"
                        }
                        ${isSelected ? "ring-active shadow-lg" : "hover-scale"}
                      `}
                      style={{
                        width: 100,
                        height: 100,
                        // Nếu đang chọn thì viền đậm màu cam, nếu không thì viền nét đứt
                        border: isSelected
                          ? "3px solid #fd7e14"
                          : cellData
                          ? "none"
                          : "2px dashed #dee2e6",
                        transform: isSelected ? "scale(1.05)" : "scale(1)",
                        zIndex: isSelected ? 10 : 1,
                      }}
                    >
                      {cellData ? (
                        <img
                          src={cellData.thumbnail}
                          alt=""
                          className="w-100 h-100 object-fit-cover rounded-3"
                        />
                      ) : isSelected ? (
                        <div
                          className="spinner-grow spinner-grow-sm text-warning"
                          role="status"
                        ></div>
                      ) : (
                        <span className="text-secondary opacity-25 display-6 fw-light">
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
      </div>
    </div>
  );
}
