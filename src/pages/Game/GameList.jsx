"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import "bootstrap/dist/css/bootstrap.min.css";
import { useState } from "react";

export default function GameList() {
  const router = useRouter();
  const [hoveredGame, setHoveredGame] = useState(null);

  // Danh sách game (Dễ dàng mở rộng sau này)
  const games = [
    {
      id: "hanidle",
      name: "H-Anidle",
      description:
        "Thử thách kiến thức Anime của bạn. Đoán tên bộ phim dựa trên gợi ý.",
      icon: "🧩",
      path: "/game/hanidle",
      status: "active", // active | coming_soon | maintenance
      color: "primary",
    },
    {
      id: "hentexto",
      name: "HenTexto",
      description: "Contexto phien ban HAnime.",
      icon: "🐈‍",
      path: "/game/hentexto",
      status: "active",
      color: "info",
    },
    {
      id: "hentohen",
      name: "HenToHen",
      description: "Immaculate Grid phien ban HAnime.",
      icon: "🐈‍",
      path: "/game/hentohen",
      status: "active",
      color: "info",
    },
    {
      id: "Hengo",
      name: "Hengo",
      description: "Bingo phien ban HAnime.",
      icon: "🥀",
      path: "/game/bingo",
      status: "active",
      color: "info",
    },
  ];

  return (
    <div
      className="min-vh-100 w-100 py-5"
      style={{
        background: "linear-gradient(to bottom right, #141E30, #243B55)", // Gradient xanh đen Deep Sea
        color: "white",
      }}
    >
      <div className="container">
        {/* Header & Navigation */}
        <div className="d-flex align-items-center mb-5 animate-in fade-in">
          <Link
            href="/"
            className="btn btn-outline-light btn-sm rounded-pill px-3 me-3"
          >
            &larr; Home
          </Link>
          <div>
            <h1 className="fw-bold mb-0">Game Center 🎮</h1>
            <p className="text-white-50 mb-0 small">Chọn trò chơi để bắt đầu</p>
          </div>
        </div>

        {/* Game Grid */}
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {games.map((game) => (
            <div className="col" key={game.id}>
              <div
                onClick={() =>
                  game.status === "active" && router.push(game.path)
                }
                onMouseEnter={() => setHoveredGame(game.id)}
                onMouseLeave={() => setHoveredGame(null)}
                className={`card h-100 border-0 shadow-lg text-white ${
                  game.status === "active" ? "cursor-pointer" : ""
                }`}
                style={{
                  background: "rgba(255, 255, 255, 0.05)", // Glass effect
                  backdropFilter: "blur(10px)",
                  borderRadius: "15px",
                  transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
                  transform:
                    hoveredGame === game.id && game.status === "active"
                      ? "translateY(-10px)"
                      : "none",
                  border:
                    hoveredGame === game.id
                      ? `1px solid var(--bs-${game.color})`
                      : "1px solid rgba(255,255,255,0.1)",
                  cursor: game.status === "active" ? "pointer" : "default",
                  opacity: game.status === "coming_soon" ? 0.6 : 1,
                }}
              >
                <div className="card-body p-4 d-flex flex-column">
                  {/* Icon & Badge */}
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div
                      className={`d-flex align-items-center justify-content-center rounded-circle bg-${game.color} bg-opacity-25`}
                      style={{
                        width: "60px",
                        height: "60px",
                        fontSize: "30px",
                      }}
                    >
                      {game.icon}
                    </div>

                    {game.status === "active" ? (
                      <span className="badge bg-success rounded-pill">
                        Playable
                      </span>
                    ) : (
                      <span className="badge bg-secondary rounded-pill">
                        Coming Soon
                      </span>
                    )}
                  </div>

                  {/* Title & Desc */}
                  <h4 className="card-title fw-bold mb-2">{game.name}</h4>
                  <p className="card-text text-white-50 small flex-grow-1">
                    {game.description}
                  </p>

                  {/* Action Button */}
                  <div className="mt-3">
                    {game.status === "active" ? (
                      <button
                        className={`btn btn-${game.color} w-100 fw-bold rounded-pill`}
                      >
                        Chơi Ngay
                      </button>
                    ) : (
                      <button
                        className="btn btn-outline-secondary w-100 fw-bold rounded-pill"
                        disabled
                      >
                        Đang phát triển...
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
