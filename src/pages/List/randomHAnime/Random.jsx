"use client";

import { useState } from "react";
import Link from "next/link";
import AnimeCard from "@/components/list/AnimeCard";

export default function RandomPage() {
  const [animes, setAnimes] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRandomAnime = async () => {
    setLoading(true);
    setAnimes([]);
    try {
      const res = await fetch("/api/hanimes/random", { cache: "no-store" });
      const json = await res.json();

      if (json.success) {
        setTimeout(() => {
          setAnimes(json.data);
          setLoading(false);
        }, 800);
      }
    } catch (err) {
      console.error("Failed to fetch random anime", err);
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 min-vh-100">
      {/* Navigation Back */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <Link
          href="/"
          className="btn btn-outline-secondary btn-sm rounded-pill px-3"
        >
          &larr; Quay lại thư viện
        </Link>
        <span className="badge bg-light text-dark border">
          Mode: Batch Summon x20
        </span>
      </div>

      <div className="text-center mb-5">
        <h1 className="display-5 fw-bold text-primary mb-3">
          🎰 Gacha 210 Time
        </h1>
        <p className="text-muted mb-4">
          Nhân phẩm của bạn thế nào? Quay thử 20 bộ nhé!
        </p>

        {/* Button Random Bootstrap */}
        <button
          onClick={fetchRandomAnime}
          disabled={loading}
          className={`btn btn-lg px-5 py-3 rounded-pill fw-bold shadow-sm transition-all ${
            loading ? "btn-secondary" : "btn-gradient-purple"
          }`}
          style={{
            background: loading
              ? ""
              : "linear-gradient(45deg, #6f42c1, #0d6efd)",
            color: "white",
            border: "none",
          }}
        >
          {loading ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
              Đang triệu hồi...
            </>
          ) : (
            "🎲 Triệu hồi x20 ngay!"
          )}
        </button>
      </div>

      {/* --- KHU VỰC HIỂN THỊ KẾT QUẢ --- */}

      {/* 1. Trạng thái chưa có dữ liệu */}
      {animes.length === 0 && !loading && (
        <div className="text-center py-5">
          <div
            className="alert alert-light d-inline-block border shadow-sm px-5 py-4"
            role="alert"
          >
            <div className="fs-1 mb-2">👇</div>
            <strong>Bấm nút phía trên để quay 20 bộ ngẫu nhiên!</strong>
          </div>
        </div>
      )}

      {/* 2. Hiển thị Grid 20 bộ - TÁI SỬ DỤNG AnimeCard */}
      {animes.length > 0 && !loading && (
        // Sử dụng Grid của Bootstrap để chia cột
        <div className="row row-cols-2 row-cols-sm-3 row-cols-md-4 g-4 animate-in fade-in">
          {animes.map((anime, index) => (
            <div className="col" key={anime.id || index}>
              {/* ✅ GỌI COMPONENT CARD TẠI ĐÂY */}
              {/* Nó sẽ tự động kế thừa style của AnimeCard bạn đã code */}
              <AnimeCard item={anime} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
