"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import "bootstrap/dist/css/bootstrap.min.css";
import { useState } from "react";
import { LOCAL_STORAGE_KEYS } from "@/app/constants/localKey";
import { useMode } from "@/context/ModeContext"; // Import Context

export default function GameList() {
  const router = useRouter();
  const { mode } = useMode(); // Lấy mode hiện tại ('anime' | 'hanime')
  const [hoveredGame, setHoveredGame] = useState(null);

  // --- CẤU HÌNH DATA ĐA CHẾ ĐỘ ---
  const gamesData = [
    {
      // Dữ liệu chung (Giữ nguyên)
      path: "/game/hanidle",
      status: "active",
      color: "primary",
      localKey: LOCAL_STORAGE_KEYS.WORDLE.PROGRESS,
      // Dữ liệu riêng theo mode
      modes: {
        hanime: {
          id: "hanidle",
          name: "H-Anidle",
          description:
            "Thử thách kiến thức văn hóa 'nhật bản'. Đoán tên phim dựa trên gợi ý.",
          icon: "🧩",
        },
        anime: {
          id: "anidle",
          name: "Anidle",
          description:
            "Thử thách fan cứng Anime. Đoán tên bộ Anime kinh điển qua các gợi ý.",
          icon: "🎬",
        },
      },
    },
    {
      path: "/game/hentexto",
      status: "active",
      color: "info",
      localKey: LOCAL_STORAGE_KEYS.CONTEXTO.PROGRESS,
      modes: {
        hanime: {
          id: "hentexto",
          name: "HenTexto",
          description:
            "Contexto phiên bản HAnime. Tìm ra bộ phim bí ẩn qua sự tương đồng.",
          icon: "🐈‍⬛",
        },
        anime: {
          id: "anitexto",
          name: "AniTexto",
          description:
            "Contexto phiên bản Anime. AI sẽ chỉ dẫn bạn đến bộ Anime bí mật.",
          icon: "robot", // Dùng icon string hoặc emoji
        },
      },
    },
    {
      path: "/game/hentohen",
      status: "active",
      color: "success",
      localKey: LOCAL_STORAGE_KEYS.TICTACTOE.PROGRESS,
      modes: {
        hanime: {
          id: "hentohen",
          name: "HenToHen",
          description:
            "Immaculate Grid phiên bản người lớn. Điền vào ô trống theo tiêu chí.",
          icon: "👅",
        },
        anime: {
          id: "anigrid",
          name: "AniGrid",
          description:
            "Thử thách kiến thức tổng hợp. Tìm Anime thỏa mãn 2 điều kiện giao nhau.",
          icon: "wk", // Ví dụ icon
        },
      },
    },
    {
      path: "/game/bingo",
      status: "active",
      color: "danger",
      localKey: LOCAL_STORAGE_KEYS.BINGO.PROGRESS,
      modes: {
        hanime: {
          id: "hengo",
          name: "Hengo",
          description:
            "Bingo phiên bản HAnime. Quay số và tìm vận may của bạn.",
          icon: "🥀",
        },
        anime: {
          id: "anibingo",
          name: "AniBingo",
          description:
            "Bingo Anime vui vẻ. Sưu tập các waifu/husbando để chiến thắng.",
          icon: "ix",
        },
      },
    },
  ];

  // --- LOGIC ĐIỀU HƯỚNG & DỌN DẸP ---
  const handleGameNavigation = (gameCommon, gameModeData) => {
    if (gameCommon.status !== "active") return;

    // Tự động xóa key local tương ứng nếu được định nghĩa
    if (gameCommon.localKey) {
      localStorage.removeItem(gameCommon.localKey);
      console.log(
        `🧹 IT Ops: Đã dọn dẹp [${gameCommon.localKey}] cho ${gameModeData.name}`
      );
    }

    router.push(gameCommon.path);
  };

  // --- UI THEME ---
  const bgTheme =
    mode === "hanime"
      ? "linear-gradient(to bottom right, #2c001e, #53183b)" // Tông tím/đỏ cho H
      : "linear-gradient(to bottom right, #141E30, #243B55)"; // Tông xanh cho Anime

  return (
    <div
      className="py-5 transition-all duration-500 min-vh-100 w-100"
      style={{
        background: bgTheme,
        color: "white",
        transition: "background 0.5s ease", // Hiệu ứng chuyển màu nền
      }}
    >
      <div className="container">
        {/* Header */}
        <div className="mb-5 d-flex align-items-center animate-in fade-in justify-content-between">
          <div className="d-flex align-items-center">
            <Link
              href="/"
              className="px-3 btn btn-outline-light btn-sm rounded-pill me-3"
            >
              &larr; Home
            </Link>
            <div>
              <h1 className="mb-0 fw-bold">
                Game Center {mode === "hanime" ? "🔞" : "🎮"}
              </h1>
              <p className="mb-0 text-white-50">
                {mode === "hanime"
                  ? "Khu vực giải trí dành cho người trên 18 tuổi."
                  : "Thử thách kiến thức Anime của bạn."}
              </p>
            </div>
          </div>
        </div>

        {/* Game Grid */}
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {gamesData.map((game) => {
            // Lấy data cụ thể theo mode
            const currentData = game.modes[mode];
            // Fix trường hợp icon là emoji hoặc text class
            const renderIcon = () => {
              if (currentData.icon === "robot") return "🤖";
              if (currentData.icon === "wk") return "🧠";
              if (currentData.icon === "ix") return "🍀";
              return currentData.icon;
            };

            return (
              <div className="col" key={currentData.id}>
                <div
                  onClick={() => handleGameNavigation(game, currentData)}
                  onMouseEnter={() => setHoveredGame(currentData.id)}
                  onMouseLeave={() => setHoveredGame(null)}
                  className={`card h-100 border-0 shadow-lg text-white ${
                    game.status === "active" ? "cursor-pointer" : ""
                  }`}
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    backdropFilter: "blur(10px)",
                    borderRadius: "15px",
                    transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
                    transform:
                      hoveredGame === currentData.id && game.status === "active"
                        ? "translateY(-10px)"
                        : "none",
                    border:
                      hoveredGame === currentData.id
                        ? `1px solid var(--bs-${game.color})`
                        : "1px solid rgba(255,255,255,0.1)",
                    cursor: game.status === "active" ? "pointer" : "default",
                    opacity: game.status === "coming_soon" ? 0.6 : 1,
                  }}
                >
                  <div className="p-4 card-body d-flex flex-column">
                    <div className="mb-3 d-flex justify-content-between align-items-start">
                      <div
                        className={`d-flex align-items-center justify-content-center rounded-circle bg-${game.color} bg-opacity-25`}
                        style={{
                          width: "60px",
                          height: "60px",
                          fontSize: "30px",
                        }}
                      >
                        {renderIcon()}
                      </div>
                      <span
                        className={`badge rounded-pill ${
                          mode === "hanime" ? "bg-danger" : "bg-success"
                        }`}
                      >
                        Playable
                      </span>
                    </div>

                    <h4 className="mb-2 card-title fw-bold">
                      {currentData.name}
                    </h4>
                    <p className="card-text text-white-50 small flex-grow-1">
                      {currentData.description}
                    </p>

                    <div className="mt-auto">
                      <button
                        className={`btn btn-${game.color} w-100 fw-bold rounded-pill`}
                      >
                        {mode === "hanime" ? "Start Game" : "Chơi Ngay"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
