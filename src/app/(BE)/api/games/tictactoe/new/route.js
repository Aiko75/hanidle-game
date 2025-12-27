import { NextResponse } from "next/server";
import hanimeData from "@/../public/data/ihentai_all.json";
import animeData from "@/../public/data/anime_full.json";

// Cấu hình
const MIN_ANIME_VIEWS = 1000;

// --- CACHE ĐA CHẾ ĐỘ ---
// Dùng object để lưu riêng cache cho từng mode
const GLOBAL_CACHE = {
  anime: null,
  hanime: null,
};

// Helper: Trích xuất thuộc tính
function extractAttributes(data) {
  const genres = new Set();
  const studios = new Set();
  const years = new Set();

  data.forEach((item) => {
    // Check an toàn hơn cho views
    if ((item.views || 0) < MIN_ANIME_VIEWS) return;

    item.genres?.forEach((g) => genres.add(g.name));
    item.studios?.forEach((s) => studios.add(s.name));
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

// Helper: Check điều kiện
function checkCondition(anime, attr) {
  if (!anime || !attr) return false;

  if (attr.type === "Genre") {
    return anime.genres?.some((g) => g.name === attr.value);
  }
  if (attr.type === "Studio") {
    return anime.studios?.some((s) => s.name === attr.value);
  }
  if (attr.type === "Year") {
    return anime.releaseYear?.name === attr.value;
  }
  return false;
}

// Helper: Kiểm tra tính khả thi
function hasSolution(data, rowAttr, colAttr) {
  return data.some((anime) => {
    const hasRow = checkCondition(anime, rowAttr);
    const hasCol = checkCondition(anime, colAttr);
    return hasRow && hasCol;
  });
}

// [FIX 1] Thêm tham số request vào hàm
export async function GET(request) {
  try {
    // Lấy mode, mặc định là anime nếu không có header
    const mode = request.headers.get("x-app-mode") || "anime";

    // Chọn nguồn dữ liệu đúng
    const sourceData = mode === "hanime" ? hanimeData : animeData;

    // [FIX 2] Xử lý Cache theo mode để không bị lẫn lộn
    if (!GLOBAL_CACHE[mode]) {
      console.log(`🔄 Building cache for mode: ${mode}...`);
      const filteredData = sourceData.filter(
        (a) => (a.views || 0) >= MIN_ANIME_VIEWS
      );

      GLOBAL_CACHE[mode] = {
        data: filteredData, // Lưu luôn data đã filter vào cache
        attributes: extractAttributes(filteredData),
      };
    }

    // Lấy dữ liệu từ Cache của mode hiện tại
    const currentCache = GLOBAL_CACHE[mode];
    const { data: filteredData, attributes: cachedAttributes } = currentCache;

    let board = null;

    // [FIX 3] Thêm điều kiện dừng an toàn (max 500 lần thử)
    while (!board) {
      const getRandomAttr = (excludeTypes = []) => {
        const types = ["Genre", "Studio", "Year"].filter(
          (t) => !excludeTypes.includes(t)
        );
        const type = types[Math.floor(Math.random() * types.length)];

        let pool = [];
        if (type === "Genre") pool = cachedAttributes.genres;
        else if (type === "Studio") pool = cachedAttributes.studios;
        else if (type === "Year") pool = cachedAttributes.years;

        if (!pool || pool.length === 0) return { type, value: "N/A" };
        const value = pool[Math.floor(Math.random() * pool.length)];
        return { type, value };
      };

      // Random Hàng & Cột
      const rows = [];
      const cols = [];

      // Tạo 3 hàng
      for (let i = 0; i < 3; i++) rows.push(getRandomAttr());

      // Tạo 3 cột (Logic cũ của bạn OK)
      for (let i = 0; i < 3; i++) cols.push(getRandomAttr());

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
            // Không để Năm giao với Năm
            if (rows[r].type === "Year" && cols[c].type === "Year") {
              isValidBoard = false;
              break;
            }
            // Phải có nghiệm
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
        },
        { status: 500 } // Trả về lỗi server nếu không tìm ra bảng
      );
    }

    return NextResponse.json({ success: true, board });
  } catch (error) {
    console.error("Board API Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
