"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import GuessLog from "@/components/game/HenTexto/GuessLog";
import GameSearch from "@/components/game/HenTexto/GameSearch";
import AnimeCard from "@/components/list/AnimeCard";

export default function HanidleGamePage() {
  const [guesses, setGuesses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [secretAnime, setSecretAnime] = useState(null);
  const [winItem, setWinItem] = useState(null);

  // --- STATE CHO GỢI Ý ---
  const [hintsUsed, setHintsUsed] = useState(0); // Số gợi ý người dùng ĐÃ BẤM mở

  // 1. KHỞI TẠO GAME
  useEffect(() => {
    fetch("/api/hanimes/random?limit=1")
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          console.log("Secret ID:", res.data.id, res.data.title);
          setSecretAnime(res.data);
        }
      })
      .catch((err) => console.error("Lỗi khởi tạo game:", err));
  }, []);

  // 2. TÍNH TOÁN LOGIC GỢI Ý (Derived State)
  const hintLogic = useMemo(() => {
    const guessCount = guesses.length;
    let earned = 0;

    // Logic: Xuất hiện sau 4 lần đoán đầu tiên
    if (guessCount >= 4) {
      earned = 1; // 4 lần đầu tặng 1 cái
      // Sau đó cứ 2 lần đoán tặng thêm 1 cái
      earned += Math.floor((guessCount - 4) / 2);
    }

    const available = earned - hintsUsed;

    // Chuẩn bị danh sách dữ liệu để hiển thị theo thứ tự: Genre -> Studio -> Year
    let revealList = [];
    if (secretAnime) {
      // Thêm Genres
      if (secretAnime.genres) {
        revealList.push(
          ...secretAnime.genres.map((g) => ({
            type: "Genre",
            value: g.name,
            color: "bg-info",
          }))
        );
      }
      // Thêm Studios
      if (secretAnime.studios) {
        revealList.push(
          ...secretAnime.studios.map((s) => ({
            type: "Studio",
            value: s.name,
            color: "bg-warning",
          }))
        );
      }
      // Thêm Năm
      if (secretAnime.release_year) {
        revealList.push({
          type: "Year",
          value: secretAnime.release_year,
          color: "bg-secondary",
        });
      }
    }

    return {
      available, // Số lượng hint đang có để bấm
      nextUnlock: guessCount < 4 ? 4 - guessCount : 2 - ((guessCount - 4) % 2), // Bao lâu nữa có hint mới
      revealList, // Danh sách toàn bộ hint
      isMaxed: hintsUsed >= revealList.length, // Đã mở hết sạch sành sanh chưa
    };
  }, [guesses.length, hintsUsed, secretAnime]);

  const handleUseHint = () => {
    if (hintLogic.available > 0 && !hintLogic.isMaxed) {
      setHintsUsed((prev) => prev + 1);
    }
  };

  const handleGuess = async (anime) => {
    if (!secretAnime) return;
    if (guesses.some((g) => g.id === anime.id)) return;

    setLoading(true);
    try {
      const res = await fetch("/api/games/hentexto/guess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestId: anime.id,
          secretId: secretAnime.id,
        }),
      });

      const json = await res.json();

      if (json.success) {
        const rank = json.rank;
        const newGuess = { ...anime, rank: rank };
        const updatedGuesses = [newGuess, ...guesses];
        updatedGuesses.sort((a, b) => a.rank - b.rank);
        setGuesses(updatedGuesses);

        if (rank === 1) setWinItem(anime);
      }
    } catch (error) {
      console.error("Lỗi đoán:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!secretAnime) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center bg-dark text-white">
        <div className="spinner-border text-primary me-2"></div> Đang tạo đề
        bài...
      </div>
    );
  }

  return (
    <div
      className="min-vh-100 w-100 d-flex flex-col align-items-center py-5"
      style={{
        background: "linear-gradient(135deg, #1e130c 0%, #9a8478 100%)",
        color: "white",
      }}
    >
      <div className="container text-center mb-4">
        <Link
          href="/game"
          className="btn btn-outline-light btn-sm rounded-pill mb-3"
        >
          &larr; Thoát Game
        </Link>
        <h1 className="display-4 fw-bold">H-Anidle Contexto</h1>
        <p className="lead text-white-50">
          Tìm kiếm bộ Anime bí mật. Đoán tên để xem độ chính xác!
        </p>
      </div>

      {winItem && (
        <div className="container mb-5 animate-in zoom-in duration-500">
          <div className="alert alert-success text-center shadow-lg border-0 p-4 rounded-4">
            <h2 className="fw-bold mb-3">🎉 CHÚC MỪNG! BẠN ĐÃ TÌM RA!</h2>
            <div className="d-flex justify-content-center">
              <div style={{ maxWidth: "280px" }}>
                <AnimeCard item={winItem} />
              </div>
            </div>
            <button
              className="btn btn-success btn-lg mt-4 rounded-pill px-5 fw-bold"
              onClick={() => window.location.reload()}
            >
              Chơi ván mới 🔄
            </button>
          </div>
        </div>
      )}

      {!winItem && (
        <div className="container d-flex flex-column align-items-center w-100">
          <GameSearch onGuess={handleGuess} disabled={loading} />

          <div
            className="d-flex justify-content-between w-100 mt-3 px-2"
            style={{ maxWidth: "600px" }}
          >
            <div className="text-white-50">
              Lượt đoán:{" "}
              <span className="fw-bold text-white">{guesses.length}</span>
            </div>

            {/* --- UI GỢI Ý --- */}
            <div className="d-flex align-items-center gap-2">
              {hintLogic.nextUnlock > 0 && !hintLogic.isMaxed && (
                <small className="text-white-50 fst-italic me-2">
                  (+1 gợi ý sau {hintLogic.nextUnlock} lượt)
                </small>
              )}

              <button
                onClick={handleUseHint}
                disabled={hintLogic.available <= 0 || hintLogic.isMaxed}
                className={`btn btn-sm rounded-pill d-flex align-items-center gap-1 shadow-sm transition-all ${
                  hintLogic.available > 0
                    ? "btn-warning text-dark fw-bold hover-scale"
                    : "btn-secondary opacity-50"
                }`}
              >
                <span>💡 Gợi ý</span>
                {hintLogic.available > 0 && (
                  <span className="badge bg-danger text-white rounded-circle">
                    {hintLogic.available}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* --- HIỂN THỊ CÁC GỢI Ý ĐÃ MỞ --- */}
          {hintsUsed > 0 && (
            <div
              className="w-100 mt-3 p-3 rounded-3 bg-black bg-opacity-25 animate-in fade-in"
              style={{ maxWidth: "600px" }}
            >
              <h6 className="text-white-50 text-uppercase fw-bold text-xs mb-2">
                Thông tin đã mở khóa:
              </h6>
              <div className="d-flex flex-wrap gap-2">
                {hintLogic.revealList.slice(0, hintsUsed).map((hint, idx) => (
                  <span
                    key={idx}
                    className={`badge ${hint.color} text-dark border border-white border-opacity-25 px-3 py-2 animate-in zoom-in`}
                  >
                    {hint.type}: <strong>{hint.value}</strong>
                  </span>
                ))}
              </div>
            </div>
          )}

          <GuessLog guesses={guesses} />
        </div>
      )}
    </div>
  );
}
