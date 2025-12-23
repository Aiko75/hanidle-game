import { NextResponse } from "next/server";
import animeData from "@/../public/data/ihentai_all.json";

// Cấu hình
const MIN_ANIME_VIEWS = 1000; // Lọc bỏ bộ ít view

// Helper: Trích xuất thuộc tính từ JSON của bạn
function extractAttributes(data) {
  const genres = new Set();
  const studios = new Set();
  const years = new Set();

  data.forEach((item) => {
    if ((item.views || 0) < MIN_ANIME_VIEWS) return;

    // JSON của bạn: item.genres là mảng object -> lấy g.name
    item.genres?.forEach((g) => genres.add(g.name));

    // JSON của bạn: item.studios là mảng object -> lấy s.name
    item.studios?.forEach((s) => studios.add(s.name));

    // JSON của bạn: item.releaseYear là object -> lấy releaseYear.name
    if (item.releaseYear?.name) {
      years.add(item.releaseYear.name);
    }
  });

  return {
    genres: Array.from(genres),
    studios: Array.from(studios),
    years: Array.from(years),
  };
}

// Helper: Check điều kiện (Quan trọng: Phải khớp field name)
function checkCondition(anime, attr) {
  if (!anime || !attr) return false;

  if (attr.type === "Genre") {
    // Tìm xem trong mảng genres có cái nào tên trùng không
    return anime.genres?.some((g) => g.name === attr.value);
  }

  if (attr.type === "Studio") {
    return anime.studios?.some((s) => s.name === attr.value);
  }

  if (attr.type === "Year") {
    // So sánh string "2018" với "2018"
    return anime.releaseYear?.name === attr.value;
  }

  return false;
}

// Helper: Kiểm tra tính khả thi (Có bộ nào thỏa mãn giao điểm không)
function hasSolution(data, rowAttr, colAttr) {
  return data.some((anime) => {
    const hasRow = checkCondition(anime, rowAttr);
    const hasCol = checkCondition(anime, colAttr);
    return hasRow && hasCol;
  });
}

// Cache dữ liệu để không phải loop lại mỗi lần gọi API
let cachedAttributes = null;
let filteredData = null;

export async function GET() {
  try {
    if (!cachedAttributes) {
      filteredData = animeData.filter((a) => (a.views || 0) >= MIN_ANIME_VIEWS);
      cachedAttributes = extractAttributes(filteredData);
    }

    let board = null;
    let attempts = 0;

    while (!board) {
      attempts++;

      const getRandomAttr = (excludeTypes = []) => {
        const types = ["Genre", "Studio", "Year"].filter(
          (t) => !excludeTypes.includes(t)
        );
        const type = types[Math.floor(Math.random() * types.length)];

        let pool = [];
        if (type === "Genre") pool = cachedAttributes.genres;
        else if (type === "Studio") pool = cachedAttributes.studios;
        else if (type === "Year") pool = cachedAttributes.years;

        // Random 1 giá trị từ pool
        if (pool.length === 0) return { type, value: "N/A" }; // Fallback
        const value = pool[Math.floor(Math.random() * pool.length)];
        return { type, value };
      };

      const r1 = getRandomAttr();
      const r2 = getRandomAttr();
      const r3 = getRandomAttr();
      const rows = [r1, r2, r3];
      const cols = [];

      // Tạo cột, cố gắng tránh trùng loại với hàng để game đa dạng
      for (let i = 0; i < 3; i++) {
        cols.push(getRandomAttr());
      }

      // Validate Board
      let isValidBoard = true;

      // 1. Check trùng lặp label
      const usedLabels = new Set([
        ...rows.map((r) => r.value),
        ...cols.map((c) => c.value),
      ]);
      if (usedLabels.size < 6) isValidBoard = false;

      // 2. Check Logic & Solvability
      if (isValidBoard) {
        for (let r = 0; r < 3; r++) {
          for (let c = 0; c < 3; c++) {
            // Constraint: Không bao giờ để Năm giao với Năm (Vì 1 bộ phim không thể ra mắt ở 2 năm khác nhau)
            if (rows[r].type === "Year" && cols[c].type === "Year") {
              isValidBoard = false;
              break;
            }
            // Constraint: Phải có ít nhất 1 bộ thỏa mãn ô này
            if (!hasSolution(filteredData, rows[r], cols[c])) {
              isValidBoard = false;
              break;
            }
          }
          if (!isValidBoard) break;
        }
      }

      if (isValidBoard) {
        board = { rows, cols };
      }
    }

    if (!board) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to generate board, try again",
          att: attempts,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, board, att: attempts });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: "Server Error" },
      { status: 500 }
    );
  }
}
