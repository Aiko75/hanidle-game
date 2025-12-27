"use client"; // Quan trọng: Phải có dòng này để dùng hook
import React from "react";
import { useMode } from "@/context/ModeContext";

export default function ModeToggle() {
  const { mode, toggleMode } = useMode();

  return (
    <button
      onClick={toggleMode}
      className={`px-4 py-2 rounded font-bold transition-colors duration-200 ${
        mode === "anime"
          ? "bg-blue-600 hover:bg-blue-700 text-white" // Style cho Anime Mode
          : "bg-pink-600 hover:bg-pink-700 text-white" // Style cho H-Anime Mode
      }`}
    >
      {/* Hiển thị text tương ứng */}
      {mode === "anime" ? "Chuyển sang H-Anime" : "Quay về Anime"}
    </button>
  );
}
