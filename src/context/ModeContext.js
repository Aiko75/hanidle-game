// src/context/ModeContext.jsx
"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie"; // Đảm bảo đã chạy: npm i js-cookie

const ModeContext = createContext(null);

export const ModeProvider = ({ children }) => {
  // 1. Khởi tạo state
  const [mode, setMode] = useState("anime");

  useEffect(() => {
    const savedMode = Cookies.get("app_mode");

    if (savedMode) {
      setMode(savedMode);
    }
  }, []);

  const toggleMode = () => {
    const newMode = mode === "anime" ? "hanime" : "anime";

    // 3. Cập nhật state và Cookie
    setMode(newMode);
    Cookies.set("app_mode", newMode, { expires: 365 });

    // 4. Reload để áp dụng mode mới cho toàn bộ Server Component (nếu dùng Next.js App Router)
    window.location.reload();
  };

  return (
    <ModeContext.Provider value={{ mode, toggleMode }}>
      {children}
    </ModeContext.Provider>
  );
};

// Hook tùy chỉnh để sử dụng context nhanh hơn
export const useMode = () => {
  const context = useContext(ModeContext);
  if (!context) {
    throw new Error("useMode must be used within a ModeProvider");
  }
  return context;
};
