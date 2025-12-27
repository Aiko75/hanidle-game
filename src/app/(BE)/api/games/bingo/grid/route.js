import { NextResponse } from "next/server";
import hanimeData from "@/../public/data/ihentai_all.json";
import animeData from "@/../public/data/anime_full.json";

const GRID_SIZE = 16;
const CURRENT_YEAR = new Date().getFullYear();

// Helper
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export async function GET(request) {
  try {
    const mode = request.headers.get("x-app-mode");
    const sourceData = mode === "hanime" ? hanimeData : animeData;

    const allGenres = new Set();
    const allStudios = new Set();
    const allYears = new Set();

    sourceData.forEach((anime) => {
      anime.genres?.forEach((g) => allGenres.add(g.name));
      anime.studios?.forEach((s) => allStudios.add(s.name));
      if (anime.releaseYear?.name)
        allYears.add(parseInt(anime.releaseYear.name));
    });

    // Chuyển về Array để random
    const genrePool = Array.from(allGenres);
    const studioPool = Array.from(allStudios);
    const yearPool = Array.from(allYears).filter((y) => y <= CURRENT_YEAR); // Lọc bỏ năm tương lai nếu data rác

    const grid = [];
    const usedLabels = new Set(); // Bộ nhớ chống trùng tuyệt đối

    // Định nghĩa các loại Generator
    // Chúng ta sẽ xoay vòng các loại này để bảng đa dạng
    const types = ["genre", "studio", "year", "view", "meta"];

    let safetyLoop = 0;
    while (grid.length < GRID_SIZE && safetyLoop < 1000) {
      safetyLoop++;

      const type = randomItem(types);
      let cell = null;

      // LOGIC SINH DỮ LIỆU
      if (type === "genre") {
        const val = randomItem(genrePool);
        cell = { type: "genre", label: `Genre: ${val}`, value: val };
      } else if (type === "studio") {
        const val = randomItem(studioPool);
        cell = { type: "studio", label: `Studio: ${val}`, value: val };
      } else if (type === "year") {
        // Random kiểu điều kiện năm
        const subType = randomItem(["eq", "gt", "lt"]);
        const year = randomItem(yearPool);

        if (subType === "eq") {
          cell = { type: "year_eq", label: `Năm ${year}`, value: year };
        } else if (subType === "gt") {
          // Đảm bảo không sinh ra "Sau năm 2025"
          const y = Math.min(year, CURRENT_YEAR - 1);
          cell = { type: "year_gt", label: `Sau năm ${y}`, value: y };
        } else {
          // Đảm bảo không sinh ra "Trước năm 1900"
          const y = Math.max(year, 2000);
          cell = { type: "year_lt", label: `Trước năm ${y}`, value: y };
        }
      } else if (type === "view") {
        const subType = randomItem(["gt", "lt"]);
        const kView = randomInt(1, 50) * 100; // 100k -> 5000k
        if (subType === "gt") {
          cell = {
            type: "views_gt",
            label: `View > ${kView}K`,
            value: kView * 1000,
          };
        } else {
          cell = {
            type: "views_lt",
            label: `View < ${kView}K`,
            value: kView * 1000,
          };
        }
      } else if (type === "meta") {
        const subType = randomItem(["censored", "uncensored", "2d", "3d"]);
        if (subType === "censored")
          cell = {
            type: "censorship",
            label: "Che (Censored)",
            value: "censored",
          };
        if (subType === "uncensored")
          cell = {
            type: "censorship",
            label: "Không Che (Uncen)",
            value: "uncensored",
          };
        if (subType === "2d")
          cell = { type: "category", label: "Anime 2D", value: "hen2d" };
        if (subType === "3d")
          cell = { type: "category", label: "Anime 3D", value: "hen3d" };
      }

      // CHECK TRÙNG LẶP
      if (cell && !usedLabels.has(cell.label)) {
        usedLabels.add(cell.label);
        grid.push({ ...cell, id: grid.length });
      }
    }

    return NextResponse.json({ success: true, grid });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Error" },
      { status: 500 }
    );
  }
}
