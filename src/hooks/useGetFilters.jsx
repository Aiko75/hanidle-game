// src/hooks/useGetFilters.js
"use client";

import { useState, useEffect } from "react";
import axios from "axios";

export function useGetFilters(mode) {
  // Khởi tạo state mặc định rỗng
  const [filterOptions, setFilterOptions] = useState({
    studios: [],
    genres: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFilters() {
      setLoading(true);
      try {
        // Gọi API bạn vừa tạo
        const res = await axios.get(`/api/data/filter?mode=${mode}`);
        if (res.data.success) {
          setFilterOptions(res.data.data);
        }
      } catch (error) {
        console.error("❌ Failed to load filters:", error);
      } finally {
        setLoading(false);
      }
    }

    if (mode) fetchFilters();
  }, [mode]);

  return { filterOptions, loading };
}
