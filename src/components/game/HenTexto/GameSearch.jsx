"use client";

import { useState, useEffect, useRef, useMemo } from "react";
// 1. [CHANGE] Import cả 2 nguồn dữ liệu
import hanimeData from "@/../public/data/ihentai_all.json";
import animeData from "@/../public/data/anime_full.json";
import Cookies from "js-cookie"; // Import thư viện cookie

export default function GameSearch({ onGuess, disabled }) {
  const [query, setQuery] = useState("");

  // 2. [CHANGE] State lưu trữ dữ liệu động theo mode
  const [activeData, setActiveData] = useState([]);
  const [currentMode, setCurrentMode] = useState("anime"); // Để hiển thị placeholder

  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef(null);

  // 3. [CHANGE] Effect đọc Cookie và nạp dữ liệu tương ứng
  useEffect(() => {
    const mode = Cookies.get("app_mode") || "anime";
    setCurrentMode(mode);

    if (mode === "hanime") {
      setActiveData(hanimeData);
    } else {
      setActiveData(animeData);
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 4. [CHANGE] Filter dựa trên activeData
  const suggestions = useMemo(() => {
    if (query.length < 2) return [];

    return activeData
      .filter((a) => a.title?.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5);
  }, [query, activeData]); // Dependency thay đổi thành activeData

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);

    if (val.length >= 2) {
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  };

  const handleSelect = (anime) => {
    onGuess(anime);
    setQuery("");
    setShowDropdown(false);
  };

  // UI Theme nhỏ (Optional)
  const focusColor =
    currentMode === "hanime" ? "focus:ring-pink-500" : "focus:ring-primary";

  return (
    <div
      className="position-relative w-100"
      ref={wrapperRef}
      style={{ maxWidth: "600px" }}
    >
      <div className="shadow-sm input-group input-group-lg">
        <input
          type="text"
          className={`form-control border-0 ${focusColor}`}
          // 5. [CHANGE] Placeholder động
          placeholder={`Nhập tên ${
            currentMode === "hanime" ? "Hentai" : "Anime"
          } để đoán...`}
          value={query}
          onChange={handleInputChange}
          disabled={disabled}
          onFocus={() => query.length >= 2 && setShowDropdown(true)}
        />
        <button
          className={`btn fw-bold text-white ${
            currentMode === "hanime" ? "btn-danger" : "btn-primary"
          }`}
          disabled={disabled}
        >
          Đoán
        </button>
      </div>

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
              style={{ cursor: "pointer" }}
            >
              <img
                src={item.thumbnail}
                alt=""
                className="rounded"
                style={{ width: "40px", height: "40px", objectFit: "cover" }}
              />
              <div className="flex flex-col">
                <span className="fw-medium text-dark">{item.title}</span>
                {/* Hiển thị thêm năm phát hành để dễ phân biệt */}
                <span className="text-xs text-secondary">
                  {item.releaseYear?.name || "N/A"}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
