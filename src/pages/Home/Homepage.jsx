"use client";

import { useRouter } from "next/navigation";
import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useState } from "react";
import ModeToggle from "@/components/ui/ModeToggle";
import Cookies from "js-cookie";

export default function Homepage() {
  const router = useRouter();
  const [hoveredCard, setHoveredCard] = useState(null);
  const [currentMode, setCurrentMode] = useState("anime");

  useEffect(() => {
    // Đọc mode từ cookie, mặc định là anime
    const mode = Cookies.get("app_mode") || "anime";
    setCurrentMode(mode);
  }, []);

  // --- HỆ THỐNG MÀU ĐỘNG ---
  const isHanime = currentMode === "hanime";

  const theme = {
    background: isHanime
      ? "linear-gradient(135deg, #1a0505 0%, #4c0519 50%, #2d0606 100%)" // Tông đỏ đen cực tối
      : "linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0f172a 100%)", // Tông xanh Navy/Sapphire
    accent: isHanime ? "#ec4899" : "#3b82f6", // Hồng đậm vs Xanh dương
    accentGlow: isHanime
      ? "rgba(236, 72, 153, 0.5)"
      : "rgba(59, 130, 246, 0.5)",
    cardHoverBorder: isHanime
      ? "rgba(236, 72, 153, 0.8)"
      : "rgba(59, 130, 246, 0.8)",
    buttonClass: isHanime ? "btn-danger" : "btn-primary",
  };

  return (
    <div
      className="transition-all duration-700 min-vh-100 w-100 d-flex flex-column justify-content-center align-items-center"
      style={{
        background: theme.background,
        color: "white",
      }}
    >
      {/* Header Section */}
      <div className="mb-5 text-center animate-in fade-in">
        <h1
          className="mb-3 display-3 fw-bold"
          style={{ textShadow: `0 0 20px ${theme.accentGlow}` }}
        >
          <span className="text-white">Aniko!</span>
        </h1>
        <p className="lead text-white-50">
          Cổng thông tin giải trí & Thư viện {isHanime ? "HAnime" : "Anime"} tối
          thượng
        </p>
        <p className="opacity-75 small text-white-50">
          Dữ liệu cập nhật: 09/12/2025
        </p>

        <div className="mt-4">
          <ModeToggle />
        </div>
      </div>

      {/* Navigation Cards */}
      <main className="container">
        <div className="row justify-content-center g-4">
          {/* Card 1: Library */}
          <div className="col-md-5 col-lg-4">
            <div
              onClick={() => router.push("/list")}
              onMouseEnter={() => setHoveredCard("library")}
              onMouseLeave={() => setHoveredCard(null)}
              className="border-0 shadow-lg cursor-pointer card h-100"
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(12px)",
                borderRadius: "24px",
                transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                transform:
                  hoveredCard === "library" ? "translateY(-12px)" : "none",
                border: `1px solid ${
                  hoveredCard === "library"
                    ? theme.cardHoverBorder
                    : "rgba(255,255,255,0.1)"
                }`,
                boxShadow:
                  hoveredCard === "library"
                    ? `0 10px 30px ${theme.accentGlow}`
                    : "none",
              }}
            >
              <div className="p-5 text-center card-body d-flex flex-column align-items-center">
                <div
                  className="mb-4 d-flex justify-content-center align-items-center rounded-circle"
                  style={{
                    width: "80px",
                    height: "80px",
                    backgroundColor: theme.accent,
                    boxShadow: `0 0 20px ${theme.accentGlow}`,
                    opacity: 0.9,
                  }}
                >
                  <span style={{ fontSize: "40px" }}>📚</span>
                </div>
                <h3 className="mb-2 text-white card-title fw-bold">
                  {isHanime ? "Thư viện HAnime" : "Thư viện Anime"}
                </h3>
                <p className="mb-4 card-text text-white-50">
                  Tra cứu, lọc và tìm kiếm hàng ngàn bộ{" "}
                  {isHanime ? "haiten" : "anime"} với dữ liệu chi tiết từ
                  Database.
                </p>
                <button
                  className={`px-4 mt-auto btn ${theme.buttonClass} rounded-pill fw-bold w-100 shadow-sm`}
                >
                  Truy cập ngay &rarr;
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Mini Games */}
          <div className="col-md-5 col-lg-4">
            <div
              onClick={() => router.push("/game")}
              onMouseEnter={() => setHoveredCard("game")}
              onMouseLeave={() => setHoveredCard(null)}
              className="border-0 shadow-lg cursor-pointer card h-100"
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(12px)",
                borderRadius: "24px",
                transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                transform:
                  hoveredCard === "game" ? "translateY(-12px)" : "none",
                border: `1px solid ${
                  hoveredCard === "game"
                    ? "rgba(25, 135, 84, 0.8)"
                    : "rgba(255,255,255,0.1)"
                }`,
                boxShadow:
                  hoveredCard === "game"
                    ? "0 10px 30px rgba(25, 135, 84, 0.4)"
                    : "none",
              }}
            >
              <div className="p-5 text-center card-body d-flex flex-column align-items-center">
                <div
                  className="mb-4 d-flex justify-content-center align-items-center bg-success rounded-circle"
                  style={{
                    width: "80px",
                    height: "80px",
                    boxShadow: "0 0 20px rgba(25, 135, 84, 0.5)",
                  }}
                >
                  <span style={{ fontSize: "40px", marginBottom: "10px" }}>
                    🎮
                  </span>
                </div>
                <h3 className="mb-2 text-white card-title fw-bold">
                  Mini Games
                </h3>
                <p className="mb-4 card-text text-white-50">
                  Thử thách kiến thức của bạn với Wordle, Bingo và các trò chơi
                  giải trí khác.
                </p>
                <button className="px-4 mt-auto shadow-sm btn btn-success rounded-pill fw-bold w-100">
                  Chơi ngay &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-5 opacity-50 text-white-50 small">
        © 2026 H-Anidle Project. IT Engineer Edition.
      </footer>
    </div>
  );
}
