"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import animeData from "@/../public/data/ihentai_all.json";

export default function GameSearch({ onGuess, disabled }) {
  const [query, setQuery] = useState("");

  // 2. KHỞI TẠO STATE TỪ FILE IMPORT
  // Vì file JSON đã được load vào RAM trình duyệt, ta dùng luôn
  const [allAnimes] = useState(animeData);

  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef(null);

  // 3. BỎ ĐOẠN FETCH API TRONG USEEFFECT
  useEffect(() => {
    // Logic click ra ngoài để đóng dropdown giữ nguyên
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 4. USEMEMO ĐỂ LỌC (Giữ nguyên logic cũ, rất tối ưu)
  const suggestions = useMemo(() => {
    if (query.length < 2) return [];

    return allAnimes
      .filter((a) => a.title.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5);
  }, [query, allAnimes]);

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

  return (
    <div
      className="position-relative w-100"
      ref={wrapperRef}
      style={{ maxWidth: "600px" }}
    >
      <div className="input-group input-group-lg shadow-sm">
        <input
          type="text"
          className="form-control border-0"
          placeholder="Nhập tên Anime để đoán..."
          value={query}
          onChange={handleInputChange}
          disabled={disabled}
          onFocus={() => query.length >= 2 && setShowDropdown(true)}
        />
        <button className="btn btn-primary fw-bold" disabled={disabled}>
          Đoán
        </button>
      </div>

      {showDropdown && suggestions.length > 0 && (
        <ul
          className="list-group position-absolute w-100 mt-1 shadow-lg animate-in fade-in"
          style={{ zIndex: 1000, maxHeight: "300px", overflowY: "auto" }}
        >
          {suggestions.map((item) => (
            <li
              key={item.id}
              className="list-group-item list-group-item-action cursor-pointer d-flex align-items-center gap-2"
              onClick={() => handleSelect(item)}
              style={{ cursor: "pointer" }}
            >
              <img
                src={item.thumbnail}
                alt=""
                className="rounded"
                style={{ width: "40px", height: "40px", objectFit: "cover" }}
              />
              <span className="fw-medium text-dark">{item.title}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
