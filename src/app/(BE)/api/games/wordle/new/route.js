import { NextResponse } from "next/server";
import pool from "@/lib/db";

export const dynamic = "force-dynamic";

// --- CACHE LAYER (In-Memory) ---
// Lưu danh sách ID vào RAM để random cực nhanh, giảm tải query cho DB
const ID_CACHE = {
  anime: null,
  hanime: null,
  lastUpdated: { anime: 0, hanime: 0 },
};

const CACHE_DURATION = 1000 * 60 * 60; // Refresh cache mỗi 1 tiếng

// Hàm helper: Lấy danh sách ID từ DB và Cache lại
async function getCachedIds(mode) {
  const now = Date.now();

  // 1. Hit Cache
  if (ID_CACHE[mode] && now - ID_CACHE.lastUpdated[mode] < CACHE_DURATION) {
    return ID_CACHE[mode];
  }

  console.log(`🔄 [Wordle] Refreshing ID cache for: ${mode}...`);
  const client = await pool.connect();
  const tableName = mode === "hanime" ? "hanimes" : "animes";

  try {
    // 2. Query DB: Chỉ lấy ID của những bộ có > 1000 views để tránh bộ quá lạ
    const query = `SELECT id FROM ${tableName} WHERE views > 1000`;
    const res = await client.query(query);

    // 3. Save Cache
    const ids = res.rows.map((r) => r.id);
    ID_CACHE[mode] = ids;
    ID_CACHE.lastUpdated[mode] = now;

    console.log(`✅ [Wordle] Cached ${ids.length} IDs for ${mode}`);
    return ids;
  } catch (err) {
    console.error("❌ Cache ID Error:", err);
    return [];
  } finally {
    client.release();
  }
}

export async function GET(request) {
  let client;
  try {
    // Lấy mode từ header (client gửi lên: { app_mode: mode })
    const mode = request.headers.get("app_mode") || "anime";
    const tableName = mode === "hanime" ? "hanimes" : "animes";

    // 1. Lấy danh sách ID từ Cache
    const availableIds = await getCachedIds(mode);

    if (!availableIds || availableIds.length === 0) {
      return NextResponse.json(
        { success: false, message: "No data available (Cache Empty)" },
        { status: 500 }
      );
    }

    // 2. Chọn ngẫu nhiên 1 ID (CPU xử lý)
    const randomId =
      availableIds[Math.floor(Math.random() * availableIds.length)];

    // 3. Fetch chi tiết từ DB
    client = await pool.connect();

    // Lưu ý: release_year trong DB là int4, genres/studios là jsonb
    const query = `
      SELECT id, title, slug, thumbnail, release_year, views, genres, studios
      FROM ${tableName}
      WHERE id = $1
    `;

    const res = await client.query(query, [randomId]);

    if (res.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Target ID not found in DB" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: res.rows[0],
    });
  } catch (error) {
    console.error("❌ Wordle New Game Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  } finally {
    if (client) client.release();
  }
}
