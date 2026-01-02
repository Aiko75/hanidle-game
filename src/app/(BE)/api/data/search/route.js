import { NextResponse } from "next/server";
import pool from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request) {
  let client;
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const limit = parseInt(searchParams.get("limit") || "5");

    // [QUAN TRỌNG] Lấy mode từ Header do BaseJsonApi gửi lên
    const mode = request.headers.get("app_mode") || "anime";
    const tableName = mode === "hanime" ? "hanimes" : "animes";

    if (query.length < 2) {
      return NextResponse.json({ success: true, data: [] });
    }

    client = await pool.connect();

    // Query tối ưu: Chỉ SELECT các cột cần thiết cho Dropdown
    const sql = `
      SELECT id, title, thumbnail, release_year, views
      FROM ${tableName}
      WHERE title ILIKE $1
      ORDER BY views DESC
      LIMIT $2
    `;

    const res = await client.query(sql, [`%${query}%`, limit]);

    return NextResponse.json({
      success: true,
      data: res.rows,
    });
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  } finally {
    if (client) client.release();
  }
}
