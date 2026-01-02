import { NextResponse } from "next/server";
import pool from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    // 1. Lấy tham số limit từ URL
    const { searchParams } = new URL(request.url);
    // Nếu không truyền limit thì mặc định là 20, tối đa cho phép 50
    let limit = parseInt(searchParams.get("limit") || "20");

    // Validate limit để tránh user truyền số quá lớn
    if (limit < 1) limit = 1;
    if (limit > 50) limit = 50;

    const mode = request.headers.get("app_mode");
    const tableName = mode === "hanime" ? "hanimes" : "animes";

    const client = await pool.connect();

    // 2. Query Database với LIMIT động
    const query = `SELECT * FROM ${tableName} ORDER BY RANDOM() LIMIT $1`;
    const result = await client.query(query, [limit]);

    client.release();

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Database is empty" },
        { status: 404 }
      );
    }

    // 3. Xử lý dữ liệu trả về linh hoạt
    // Nếu client xin 1 bộ -> Trả về Object (tiện cho Game)
    // Nếu client xin nhiều bộ -> Trả về Array (tiện cho Gacha)
    const responseData = limit === 1 ? result.rows[0] : result.rows;

    return NextResponse.json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error("Random API Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
