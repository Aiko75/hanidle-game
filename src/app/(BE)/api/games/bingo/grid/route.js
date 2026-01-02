import { NextResponse } from "next/server";
import pool from "@/lib/db";

export const dynamic = "force-dynamic";

const GRID_SIZE = 16;
const CURRENT_YEAR = new Date().getFullYear();

// Helper functions
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export async function GET(request) {
  let client;
  try {
    const mode = request.headers.get("app_mode") || "anime";
    const tableName = mode === "hanime" ? "hanimes" : "animes";

    client = await pool.connect();

    // 1. Lấy dữ liệu mẫu từ DB (Subquery để distinct trước khi random)
    const queries = {
      genres: `
        SELECT val FROM (
            SELECT DISTINCT elem->>'name' as val 
            FROM ${tableName}, jsonb_array_elements(genres) elem
        ) sub_query
        ORDER BY RANDOM() LIMIT 20
      `,
      studios: `
        SELECT val FROM (
            SELECT DISTINCT elem->>'name' as val 
            FROM ${tableName}, jsonb_array_elements(studios) elem
        ) sub_query
        ORDER BY RANDOM() LIMIT 20
      `,
      years: `
        SELECT val FROM (
            SELECT DISTINCT release_year as val 
            FROM ${tableName} 
            WHERE release_year <= ${CURRENT_YEAR}
        ) sub_query
        ORDER BY RANDOM() LIMIT 15
      `,
    };

    const [genreRes, studioRes, yearRes] = await Promise.all([
      client.query(queries.genres),
      client.query(queries.studios),
      client.query(queries.years),
    ]);

    const genrePool = genreRes.rows.map((r) => r.val);
    const studioPool = studioRes.rows.map((r) => r.val);
    const yearPool = yearRes.rows.map((r) => r.val);

    const grid = [];
    const usedLabels = new Set();

    const types = ["genre", "studio", "year", "view", "meta"];

    let safetyLoop = 0;
    while (grid.length < GRID_SIZE && safetyLoop < 1000) {
      safetyLoop++;
      const type = randomItem(types);
      let cell = null;

      // Logic sinh ô
      if (type === "genre" && genrePool.length > 0) {
        const val = randomItem(genrePool);
        cell = { type: "genre", label: `Genre: ${val}`, value: val };
      } else if (type === "studio" && studioPool.length > 0) {
        const val = randomItem(studioPool);
        cell = { type: "studio", label: `Studio: ${val}`, value: val };
      } else if (type === "year" && yearPool.length > 0) {
        const subType = randomItem(["eq", "gt", "lt"]);
        const year = randomItem(yearPool);

        if (subType === "eq") {
          cell = { type: "year_eq", label: `Năm ${year}`, value: year };
        } else if (subType === "gt") {
          const y = Math.min(year, CURRENT_YEAR - 1);
          cell = { type: "year_gt", label: `Sau năm ${y}`, value: y };
        } else {
          const y = Math.max(year, 2000);
          cell = { type: "year_lt", label: `Trước năm ${y}`, value: y };
        }
      } else if (type === "view") {
        const subType = randomItem(["gt", "lt"]);
        const kView = randomInt(1, 50) * 100;
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

      if (cell && !usedLabels.has(cell.label)) {
        usedLabels.add(cell.label);
        grid.push({ ...cell, id: grid.length });
      }
    }

    return NextResponse.json({ success: true, grid });
  } catch (error) {
    console.error("❌ Bingo Grid Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  } finally {
    if (client) client.release();
  }
}
