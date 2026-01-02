"use client";

import { api } from "@/app/api/baseJsonApi";
import { useState, useEffect, useRef } from "react";

export default function GameSearch({ onGuess, disabled }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const wrapperRef = useRef(null);

  // 1. Xử lý click outside (Giữ nguyên)
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 2. Logic Fetch API rút gọn
  useEffect(() => {
    if (query.length < 2 || disabled) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const result = await api.get(
          `/api/data/search?q=${encodeURIComponent(query)}&limit=5`
        );

        if (result.success) {
          setSuggestions(result.data);
          setShowDropdown(true);
        }
      } catch (error) {
        console.error("Lỗi tìm kiếm:", error);
      } finally {
        setLoading(false);
      }
    }, 400); // Debounce 400ms

    return () => clearTimeout(timer);
  }, [query, disabled]);

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    if (e.target.value.length < 2) setShowDropdown(false);
  };

  const handleSelect = (anime) => {
    onGuess(anime);
    setQuery("");
    setSuggestions([]);
    setShowDropdown(false);
  };

  return (
    <div
      className="position-relative w-100"
      ref={wrapperRef}
      style={{ maxWidth: "600px" }}
    >
      <div className="shadow-sm input-group input-group-lg">
        <input
          type="text"
          className="border-0 form-control focus:ring-2 focus:ring-primary"
          placeholder="Nhập tên để tìm kiếm..."
          value={query}
          onChange={handleInputChange}
          disabled={disabled}
          onFocus={() => {
            if (suggestions.length > 0) setShowDropdown(true);
          }}
        />
        <button
          className="text-white btn fw-bold btn-primary"
          disabled={disabled || loading}
        >
          {loading ? (
            <span
              className="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
            ></span>
          ) : (
            "Đoán"
          )}
        </button>
      </div>

      {/* Dropdown Gợi ý */}
      {showDropdown && suggestions.length > 0 && (
        <ul
          className="mt-1 shadow-lg list-group position-absolute w-100 animate-in fade-in"
          style={{ zIndex: 1000, maxHeight: "300px", overflowY: "auto" }}
        >
          {suggestions.map((item) => (
            <li
              key={item.id}
              className="gap-2 cursor-pointer list-group-item list-group-item-action d-flex align-items-center"
              onClick={() => handleSelect(item)}
            >
              <img
                src={item.thumbnail}
                alt=""
                className="rounded shadow-sm"
                style={{ width: "40px", height: "55px", objectFit: "cover" }}
              />
              <div className="overflow-hidden d-flex flex-column">
                <span className="fw-medium text-dark text-truncate">
                  {item.title}
                </span>
                <span className="gap-1 text-xs text-secondary d-flex align-items-center">
                  {item.release_year ? (
                    <span className="border badge bg-light text-dark">
                      {item.release_year}
                    </span>
                  ) : null}
                  <span>
                    • {new Intl.NumberFormat().format(item.views || 0)} views
                  </span>
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Thông báo không tìm thấy */}
      {showDropdown &&
        !loading &&
        query.length >= 2 &&
        suggestions.length === 0 && (
          <ul className="mt-1 shadow-sm list-group position-absolute w-100">
            <li className="py-3 text-center list-group-item text-muted">
              Không tìm thấy kết quả phù hợp
            </li>
          </ul>
        )}
    </div>
  );
}
