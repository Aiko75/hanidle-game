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
  const [hintsUsed, setHintsUsed] = useState(0);

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

  // 2. LOGIC GỢI Ý
  const hintLogic = useMemo(() => {
    const guessCount = guesses.length;
    let earned = 0;

    // Logic tích điểm gợi ý
    if (guessCount >= 4) {
      earned = 1;
      earned += Math.floor((guessCount - 4) / 2);
    }

    const available = earned - hintsUsed;

    let revealList = [];
    if (secretAnime) {
      if (secretAnime.genres) {
        revealList.push(
          ...secretAnime.genres.map((g) => ({
            type: "Genre",
            value: g.name,
            color: "bg-info bg-opacity-10 text-info border-info",
          }))
        );
      }
      if (secretAnime.studios) {
        revealList.push(
          ...secretAnime.studios.map((s) => ({
            type: "Studio",
            value: s.name,
            color: "bg-warning bg-opacity-10 text-warning border-warning",
          }))
        );
      }
      if (secretAnime.release_year) {
        revealList.push({
          type: "Year",
          value: secretAnime.release_year,
          color: "bg-secondary bg-opacity-10 text-secondary border-secondary",
        });
      }
    }

    return {
      available,
      nextUnlock: guessCount < 4 ? 4 - guessCount : 2 - ((guessCount - 4) % 2),
      revealList,
      isMaxed: hintsUsed >= revealList.length,
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

  // --- LOADING STATE ---
  if (!secretAnime) {
    return (
      <div className="min-vh-100 d-flex flex-column justify-content-center align-items-center bg-light">
        <div className="spinner-border text-primary mb-3" role="status"></div>
        <h5 className="text-muted">Đang thiết lập hồ sơ bí mật...</h5>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light pb-5">
      {/* --- HEADER NAVIGATION --- */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top mb-4">
        <div className="container">
          <div className="d-flex align-items-center gap-3">
            <Link
              href="/game"
              className="btn btn-outline-secondary rounded-pill px-3 fw-bold btn-sm"
            >
              <i className="bi bi-arrow-left"></i> Back
            </Link>
            <span className="navbar-brand mb-0 h1 fw-bold text-primary d-none d-sm-block">
              HenTexto
            </span>
          </div>

          <div className="d-flex align-items-center gap-2 text-muted fw-bold font-monospace">
            <span className="d-none d-md-inline">Guesses:</span>
            <span className="badge bg-dark rounded-pill px-3">
              {guesses.length}
            </span>
          </div>
        </div>
      </nav>

      {/* --- MAIN GAME CONTAINER --- */}
      <div className="container d-flex flex-column align-items-center animate-in fade-in">
        {/* --- HEADER TEXT --- */}
        {!winItem && (
          <div className="text-center mb-4">
            <h2 className="fw-bold text-dark">Truy tìm Anime</h2>
            <p className="text-muted">
              Đoán tên phim và xem bạn đang ở "gần" hay "xa" đáp án!
            </p>
          </div>
        )}

        {/* --- WIN STATE --- */}
        {winItem && (
          <div
            className="w-100 mb-5 animate-in zoom-in duration-500"
            style={{ maxWidth: "500px" }}
          >
            <div className="card border-0 shadow-lg overflow-hidden rounded-4">
              <div className="card-header bg-success text-white text-center py-3">
                <h3 className="fw-bold mb-0">🎉 CHÍNH XÁC!</h3>
              </div>
              <div className="card-body text-center p-4 bg-white">
                <p className="text-muted mb-3">Đáp án bí mật chính là:</p>

                <div className="d-flex justify-content-center mb-4">
                  <div style={{ maxWidth: "240px", width: "100%" }}>
                    <AnimeCard item={winItem} />
                  </div>
                </div>

                <button
                  className="btn btn-success btn-lg rounded-pill px-5 fw-bold shadow-sm hover-scale"
                  onClick={() => window.location.reload()}
                >
                  Chơi ván mới 🔄
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- GAMEPLAY AREA --- */}
        {!winItem && (
          <div
            className="w-100 d-flex flex-column align-items-center"
            style={{ maxWidth: "600px" }}
          >
            {/* 1. SEARCH INPUT */}
            <div className="w-100 mb-3 shadow-sm rounded-4 bg-white border p-1">
              <GameSearch onGuess={handleGuess} disabled={loading} />
            </div>

            {/* 2. STATS & HINT BAR */}
            <div className="w-100 d-flex justify-content-between align-items-center mb-3 px-2">
              {/* Text thông báo lượt mở Hint tiếp theo */}
              <div className="text-muted fst-italic small">
                {hintLogic.nextUnlock > 0 && !hintLogic.isMaxed ? (
                  <span>
                    <i className="bi bi-clock-history me-1"></i> Hint mới sau{" "}
                    <strong>{hintLogic.nextUnlock}</strong> lượt
                  </span>
                ) : (
                  <span>
                    <i className="bi bi-check-circle-fill text-success me-1"></i>{" "}
                    Sẵn sàng
                  </span>
                )}
              </div>

              {/* Nút bấm Hint */}
              <button
                onClick={handleUseHint}
                disabled={hintLogic.available <= 0 || hintLogic.isMaxed}
                className={`btn btn-sm rounded-pill d-flex align-items-center gap-2 shadow-sm transition-all border ${
                  hintLogic.available > 0
                    ? "btn-white text-primary border-primary hover-scale fw-bold"
                    : "btn-light text-muted border-0"
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

            {/* 3. HIỂN THỊ HINTS ĐÃ MỞ (Nằm trong khung trắng đẹp) */}
            {hintsUsed > 0 && (
              <div className="w-100 mb-4 bg-white p-3 rounded-4 shadow-sm border border-light animate-in fade-in">
                <h6
                  className="text-muted text-uppercase fw-bold mb-3"
                  style={{ fontSize: "0.75rem" }}
                >
                  <i className="bi bi-unlock-fill me-2"></i>Thông tin đã giải
                  mã:
                </h6>
                <div className="d-flex flex-wrap gap-2">
                  {hintLogic.revealList.slice(0, hintsUsed).map((hint, idx) => (
                    <span
                      key={idx}
                      className={`badge ${hint.color} border px-3 py-2 animate-in zoom-in text-dark fw-normal`}
                    >
                      <span className="opacity-50 me-1">{hint.type}:</span>
                      <span className="fw-bold">{hint.value}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 4. LIST GUESSES */}
            <div className="w-100">
              <GuessLog guesses={guesses} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
