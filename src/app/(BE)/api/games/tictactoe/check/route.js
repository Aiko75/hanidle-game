import { NextResponse } from "next/server";
import pool from "@/lib/db";

export const dynamic = "force-dynamic";

// Helper: Kiểm tra điều kiện (Đã sửa cho khớp DB)
function checkCondition(anime, attr) {
  if (!attr || !anime) return false;

  // DB: Column 'genres' là mảng JSONB: [{name: 'Action'}, ...]
  if (attr.type === "Genre") {
    return (
      Array.isArray(anime.genres) &&
      anime.genres.some((g) => g.name === attr.value)
    );
  }

  // DB: Column 'studios' là mảng JSONB: [{name: 'Mappa'}, ...]
  if (attr.type === "Studio") {
    return (
      Array.isArray(anime.studios) &&
      anime.studios.some((s) => s.name === attr.value)
    );
  }

  // DB: Column 'release_year' là số hoặc chuỗi (VD: 2018)
  // Khác với file JSON cũ là object { name: '2018' }
  if (attr.type === "Year") {
    // Dùng == để so sánh lỏng (string "2018" == number 2018)
    return anime.release_year == attr.value;
  }

  return false;
}

export async function POST(request) {
  let client;
  try {
    const { animeId, rowAttr, colAttr } = await request.json();
    const mode = request.headers.get("app_mode") || "anime";
    const tableName = mode === "hanime" ? "hanimes" : "animes";

    client = await pool.connect();

    // 1. Tìm bộ anime trong DB theo ID
    // Chỉ lấy các cột cần thiết để tối ưu, hoặc lấy * nếu cần trả về full info
    const query = `
      SELECT id, title, genres, studios, release_year, thumbnail, slug 
      FROM ${tableName} 
      WHERE id = $1
    `;
    const res = await client.query(query, [animeId]);
    const anime = res.rows[0];

    if (!anime) {
      return NextResponse.json({ correct: false, message: "Anime not found" });
    }

    // 2. Kiểm tra điều kiện Hàng và Cột
    const isRowCorrect = checkCondition(anime, rowAttr);
    const isColCorrect = checkCondition(anime, colAttr);

    if (isRowCorrect && isColCorrect) {
      return NextResponse.json({ correct: true, anime });
    } else {
      // Trả lời sai -> Tạo thông báo lỗi chi tiết
      let message = "Sai rồi!";
      if (!isRowCorrect && !isColCorrect) {
        message = "Sai cả 2 điều kiện!";
      } else if (!isRowCorrect) {
        message = `Bộ này không thuộc ${rowAttr.type}: ${rowAttr.value}`;
      } else if (!isColCorrect) {
        message = `Bộ này không thuộc ${colAttr.type}: ${colAttr.value}`;
      }

      return NextResponse.json({ correct: false, message });
    }
  } catch (error) {
    console.error("Sudoku Check Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    if (client) client.release();
  }
}
