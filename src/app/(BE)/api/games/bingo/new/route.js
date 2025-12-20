import { NextResponse } from "next/server";
import animeData from "@/../public/data/ihentai_all.json";

// Cấu hình
const GRID_SIZE = 16; // 4x4
const TARGET_TRUE_RATIO = 0.4; // Khoảng 40% ô là đúng để dễ Bingo

// Helper lấy random
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

// --- CÁC LOẠI ĐIỀU KIỆN ---
const GENERATORS = [
  {
    type: "year_eq",
    label: (val) => `Năm ${val}`,
    check: (anime, val) => parseInt(anime.releaseYear?.name) === val,
    genValue: (anime, isTrue) =>
      isTrue
        ? parseInt(anime.releaseYear?.name)
        : parseInt(anime.releaseYear?.name) +
          randomInt(1, 5) * (Math.random() > 0.5 ? 1 : -1),
  },
  {
    type: "year_gt",
    label: (val) => `Sau năm ${val}`,
    check: (anime, val) => parseInt(anime.releaseYear?.name) > val,
    genValue: (anime, isTrue) =>
      isTrue
        ? parseInt(anime.releaseYear?.name) - randomInt(1, 5)
        : parseInt(anime.releaseYear?.name) + randomInt(1, 3),
  },
  {
    type: "year_lt",
    label: (val) => `Trước năm ${val}`,
    check: (anime, val) => parseInt(anime.releaseYear?.name) < val,
    genValue: (anime, isTrue) =>
      isTrue
        ? parseInt(anime.releaseYear?.name) + randomInt(1, 5)
        : parseInt(anime.releaseYear?.name) - randomInt(1, 3),
  },
  {
    type: "views_gt",
    label: (val) => `View > ${(val / 1000).toFixed(0)}K`,
    check: (anime, val) => (anime.views || 0) > val,
    genValue: (anime, isTrue) => {
      const v = anime.views || 0;
      return isTrue ? Math.max(0, v - 50000) : v + 50000;
    },
  },
  {
    type: "genre",
    label: (val) => `Genre: ${val}`,
    check: (anime, val) => anime.genres?.some((g) => g.name === val),
    genValue: (anime, isTrue, allData) => {
      if (isTrue) return randomItem(anime.genres || []).name;
      // Lấy random genre từ DB mà bộ này KHÔNG CÓ
      let g = "Vanilla";
      let attempts = 0;
      do {
        const rAnime = randomItem(allData);
        if (rAnime.genres?.length) g = rAnime.genres[0].name;
        attempts++;
      } while (anime.genres?.some((x) => x.name === g) && attempts < 10);
      return g;
    },
  },
  {
    type: "studio",
    label: (val) => `Studio: ${val}`,
    check: (anime, val) => anime.studios?.some((s) => s.name === val),
    genValue: (anime, isTrue, allData) => {
      if (isTrue && anime.studios?.length) return anime.studios[0].name;
      // Studio khác
      let s = "Pink Pineapple";
      let attempts = 0;
      do {
        const rAnime = randomItem(allData);
        if (rAnime.studios?.length) s = rAnime.studios[0].name;
        attempts++;
      } while (anime.studios?.some((x) => x.name === s) && attempts < 10);
      return s;
    },
  },
  {
    type: "censorship",
    label: (val) =>
      val === "censored" ? "Che (Censored)" : "Không Che (Uncen)",
    check: (anime, val) => anime.censorship === val,
    genValue: (anime, isTrue) =>
      isTrue
        ? anime.censorship
        : anime.censorship === "censored"
        ? "uncensored"
        : "censored",
  },
  {
    type: "category",
    label: (val) => (val === "hen2d" ? "Anime 2D" : "Anime 3D"),
    check: (anime, val) => anime.category === val,
    genValue: (anime, isTrue) =>
      isTrue ? anime.category : anime.category === "hen2d" ? "hen3d" : "hen2d",
  },
];

export async function GET() {
  try {
    // 1. Chọn Target Anime (Lọc bộ có đủ thông tin cơ bản)
    let target = null;
    let attempts = 0;
    while (!target && attempts < 20) {
      const candidate = randomItem(animeData);
      if (
        candidate.releaseYear &&
        candidate.genres?.length > 0 &&
        candidate.views > 1000
      ) {
        target = candidate;
      }
      attempts++;
    }
    if (!target) target = animeData[0]; // Fallback

    // 2. Tạo Grid
    const grid = [];
    for (let i = 0; i < GRID_SIZE; i++) {
      // Quyết định xem ô này sẽ là Đúng hay Sai dựa trên tỷ lệ
      const wantTrue = Math.random() < TARGET_TRUE_RATIO;

      // Chọn loại câu hỏi ngẫu nhiên
      const generator = randomItem(GENERATORS);

      // Sinh giá trị cho câu hỏi đó
      const val = generator.genValue(target, wantTrue, animeData);

      grid.push({
        id: i,
        type: generator.type,
        label: generator.label(val),
        value: val,
        isTrue: wantTrue, // Frontend sẽ không biết cái này, nhưng logic check cần (hoặc check server)
        // Để an toàn tuyệt đối thì isTrue không nên gửi về Client, nhưng đây là game vui nên gửi luôn cho dễ code FE.
      });
    }

    // Shuffle grid một chút để phân phối ngẫu nhiên
    for (let i = grid.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [grid[i], grid[j]] = [grid[j], grid[i]];
    }

    // Re-assign ID theo vị trí mới (0-15)
    grid.forEach((cell, idx) => (cell.id = idx));

    // Xóa field isTrue trước khi gửi về client (Security)
    // Client sẽ gọi API check, hoặc chúng ta gửi target về để client tự so sánh (Game client-side rendering)
    // Để tối ưu trải nghiệm, ta gửi Target Anime về, Client tự check logic hiển thị.

    return NextResponse.json({
      success: true,
      target: target,
      grid: grid,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: "Server Error" },
      { status: 500 }
    );
  }
}
