// src/app/list/[id]/page.jsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation"; // Hook lấy param từ URL
import { api } from "@/app/api/baseJsonApi";
import AnimeDetailSkeleton from "@/components/ui/AnimeDetailSkeleton";

export default function Detail() {
  const params = useParams(); // Lấy ID từ URL (/list/123 -> slugId = 123)
  const slugId = params?.slugId;

  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slugId) return;

    const fetchDetail = async () => {
      try {
        const json = await api.get(`/api/data/detail/${slugId}`);
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
    return <AnimeDetailSkeleton />;
  }

  if (error || !anime) {
    return (
      <div className="flex-col text-white bg-white min-vh-100 d-flex justify-content-center align-items-center">
        <h2 className="mb-3 text-danger">⚠️ {error}</h2>
        <Link href="/" className="btn btn-outline-light">
          ← Quay lại trang chủ
        </Link>
      </div>
    );
  }

  // --- GIAO DIỆN CHÍNH ---
  return (
    <div className="py-5 text-black bg-zinc-50 min-vh-100">
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
            <div className="overflow-hidden border-0 shadow-lg card rounded-4">
              <img
                src={anime.thumbnail}
                alt={anime.title}
                className="card-img-top w-100 object-fit-cover"
                style={{ height: "auto", minHeight: "400px" }}
              />
            </div>

            <div className="gap-2 mt-4 d-grid">
              <a
                href={anime.url}
                target="_blank"
                rel="noreferrer"
                className="shadow btn btn-primary btn-lg fw-bold rounded-pill"
              >
                Xem Phim Ngay
              </a>
            </div>
          </div>

          {/* CỘT PHẢI: THÔNG TIN CHI TIẾT */}
          <div className="col-md-8 col-lg-9">
            <h1 className="mb-3 display-5 fw-bold">{anime.title}</h1>

            {/* Metadata Badges */}
            <div className="flex-wrap gap-2 mb-4 d-flex">
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
              <h4 className="pb-2 mb-3 border-bottom border-secondary">
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
                <h5 className="mb-3 text-sm text-muted text-uppercase fw-bold">
                  Thông tin khác
                </h5>
                <div className="p-4 bg-white shadow-sm rounded-3">
                  <table className="table mb-0 table-borderless ">
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
                          <div className="flex-wrap gap-1 d-flex">
                            {anime.genres?.map((g, i) => (
                              <span
                                key={i}
                                className="border badge bg-light text-dark fw-normal"
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
