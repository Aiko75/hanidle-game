"use client";

import { useRouter } from "next/navigation";
import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useState } from "react";
import ModeToggle from "@/components/ui/ModeToggle";
import Cookies from "js-cookie";

export default function Homepage() {
  const router = useRouter();

  // State để xử lý hiệu ứng hover đơn giản
  const [hoveredCard, setHoveredCard] = useState(null);
  const [currentMode, setCurrentMode] = useState("anime");

  // 3. [CHANGE] Effect đọc Cookie để chọn dữ liệu
  useEffect(() => {
    const mode = Cookies.get("app_mode") || "anime";
    setCurrentMode(mode);
  }, []);

  return (
    <div
      className="min-vh-100 w-100 d-flex flex-column justify-content-center align-items-center"
      style={{
        background:
          "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)", // Gradient tối màu Gaming
        color: "white",
      }}
    >
      {/* Header Section */}
      <div className="mb-5 text-center animate-in fade-in">
        <h1
          className="mb-3 display-3 fw-bold"
          style={{ textShadow: "0 0 20px rgba(168, 85, 247, 0.5)" }}
        >
          <span className="text-white">H-Anidle</span>{" "}
          <span className="text-primary">Hub</span>
        </h1>
        <p className="lead text-white-50">
          Cổng thông tin giải trí & Thư viện HAnime tối thượng(câu này AI gen
          chứ tôi ko có viết:)))
        </p>
        <p className="lead text-white-50">Dữ liệu được lấy từ: 9/12/2025</p>
        <ModeToggle />
      </div>

      {/* Navigation Cards */}
      <main className="container">
        <div className="row justify-content-center g-4">
          {/* Card 1: Anime Library */}
          <div className="col-md-5 col-lg-4">
            <div
              onClick={() => router.push("/list")}
              onMouseEnter={() => setHoveredCard("library")}
              onMouseLeave={() => setHoveredCard(null)}
              className="border-0 shadow-lg cursor-pointer card h-100"
              style={{
                background: "rgba(255, 255, 255, 0.1)", // Glassmorphism effect
                backdropFilter: "blur(10px)",
                borderRadius: "20px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                transform:
                  hoveredCard === "library" ? "translateY(-10px)" : "none",
                border:
                  hoveredCard === "library"
                    ? "1px solid rgba(255,255,255,0.5)"
                    : "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <div className="p-5 text-center card-body d-flex flex-column align-items-center">
                <div
                  className="mb-4 bg-opacity-25 d-flex justify-content-center align-items-center bg-primary rounded-circle"
                  style={{ width: "80px", height: "80px" }}
                >
                  <span style={{ fontSize: "40px" }}>📚</span>
                </div>
                <h3 className="mb-2 text-white card-title fw-bold">
                  {currentMode === "hanime"
                    ? "Thư viện HAnime"
                    : "Thư viện Anime"}
                </h3>
                <p className="mb-4 card-text text-white-50">
                  Tra cứu, lọc và tìm kiếm hàng ngàn bộ anime với đầy đủ thông
                  tin chi tiết.
                </p>
                <button className="px-4 mt-auto btn btn-primary rounded-pill fw-bold w-100">
                  Truy cập ngay &rarr;
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Mini Game */}
          <div className="col-md-5 col-lg-4">
            <div
              onClick={() => router.push("/game")}
              onMouseEnter={() => setHoveredCard("game")}
              onMouseLeave={() => setHoveredCard(null)}
              className="border-0 shadow-lg cursor-pointer card h-100"
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(10px)",
                borderRadius: "20px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                transform:
                  hoveredCard === "game" ? "translateY(-10px)" : "none",
                border:
                  hoveredCard === "game"
                    ? "1px solid rgba(25, 135, 84, 0.8)"
                    : "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <div className="p-5 text-center card-body d-flex flex-column align-items-center">
                <div
                  className="mb-4 bg-opacity-25 d-flex justify-content-center align-items-center bg-success rounded-circle"
                  style={{ width: "80px", height: "80px" }}
                >
                  <span style={{ fontSize: "40px" }}>🎮</span>
                </div>
                <h3 className="mb-2 text-white card-title fw-bold">
                  Mini Games
                </h3>
                <p className="mb-4 card-text text-white-50">
                  Thử thách kiến thức của bạn với các trò chơi đoán tên, Gacha
                  nhân phẩm.
                </p>
                <button className="px-4 mt-auto btn btn-success rounded-pill fw-bold w-100">
                  Chơi ngay &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-5 text-white-50 small">
        © 2025 H-Anidle Project. Made for fun.
      </footer>
    </div>
  );
}
