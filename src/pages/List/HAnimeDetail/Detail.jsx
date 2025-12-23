// src/app/list/[id]/page.jsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation"; // Hook lấy param từ URL

export default function AnimeDetailPage() {
  const params = useParams(); // Lấy ID từ URL (/list/123 -> slugId = 123)
  const slugId = params?.slugId;

  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slugId) return;

    const fetchDetail = async () => {
      try {
        const res = await fetch(`/api/hanimes/detail/${slugId}`);
        const json = await res.json();

        if (json.success) {
          setAnime(json.data);
        } else {
          setError(json.message || "Không tìm thấy anime này.");
        }
      } catch (err) {
        setError("Lỗi kết nối server.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [slugId]);

  // --- TRẠNG THÁI LOADING / ERROR ---
  if (loading) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center bg-white text-white">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error || !anime) {
    return (
      <div className="min-vh-100 d-flex flex-col justify-content-center align-items-center bg-white text-white">
        <h2 className="text-danger mb-3">⚠️ {error}</h2>
        <Link href="/" className="btn btn-outline-light">
          ← Quay lại trang chủ
        </Link>
      </div>
    );
  }

  // --- GIAO DIỆN CHÍNH ---
  return (
    <div className="bg-zinc-50 min-vh-100 py-5 text-black">
      <div className="container">
        {/* Breadcrumb / Back Button */}
        <div className="mb-4">
          <Link href="/list" className="btn btn-outline-secondary rounded-pill">
            &larr; Thư viện
          </Link>
        </div>

        <div className="row g-5">
          {/* CỘT TRÁI: ẢNH & NÚT HÀNH ĐỘNG */}
          <div className="col-md-4 col-lg-3">
            <div className="card border-0 shadow-lg overflow-hidden rounded-4">
              <img
                src={anime.thumbnail}
                alt={anime.title}
                className="card-img-top w-100 object-fit-cover"
                style={{ height: "auto", minHeight: "400px" }}
              />
            </div>

            <div className="d-grid gap-2 mt-4">
              <a
                href={anime.url}
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary btn-lg fw-bold rounded-pill shadow"
              >
                ▶ Xem Phim Ngay
              </a>
              <div className="text-center mt-2 text-muted small">
                *Chuyển hướng sang ihentai.kim
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: THÔNG TIN CHI TIẾT */}
          <div className="col-md-8 col-lg-9">
            <h1 className="display-5 fw-bold mb-3">{anime.title}</h1>

            {/* Metadata Badges */}
            <div className="d-flex flex-wrap gap-2 mb-4">
              {anime.release_year && (
                <span className="badge bg-secondary fs-6">
                  📅 {anime.release_year}
                </span>
              )}
              <span className="badge bg-success fs-6">
                👁️ {new Intl.NumberFormat().format(anime.views)} Views
              </span>
              <span className="badge bg-warning text-dark fs-6">
                🆔 ID: {anime.id}
              </span>
            </div>

            {/* Synopsis */}
            <div className="mb-5">
              <h4 className="border-bottom pb-2 mb-3 border-secondary">
                Nội dung
              </h4>
              <p
                className="lead fs-6 text-secondary"
                style={{ lineHeight: "1.8" }}
              >
                {anime.synopsis || "Chưa có mô tả cho bộ này."}
              </p>
            </div>

            {/* Thông tin bảng */}
            <div className="row g-4">
              <div className="col-12">
                <h5 className="text-muted mb-3 text-uppercase fw-bold text-sm">
                  Thông tin khác
                </h5>
                <div className="bg-white rounded-3 p-4 shadow-sm">
                  <table className="table table-borderless mb-0 ">
                    <tbody>
                      <tr>
                        <td className="fw-bold text-muted w-25">Studio:</td>
                        <td>
                          {anime.studios?.map((s, i) => (
                            <span
                              key={i}
                              className="badge bg-info text-dark me-1"
                            >
                              {s.name}
                            </span>
                          ))}
                        </td>
                      </tr>
                      <tr>
                        <td className="fw-bold text-muted">Thể loại:</td>
                        <td>
                          <div className="d-flex flex-wrap gap-1">
                            {anime.genres?.map((g, i) => (
                              <span
                                key={i}
                                className="badge bg-light text-dark border fw-normal"
                              >
                                {g.name}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="fw-bold text-muted">Censorship:</td>
                        <td className="text-capitalize">
                          {anime.raw_data.censorship || "Unknown"}
                        </td>
                      </tr>
                      <tr>
                        <td className="fw-bold text-muted">Ngày cập nhật:</td>
                        <td>
                          {new Date(
                            anime.updated_at || anime.created_at
                          ).toLocaleDateString("vi-VN")}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
