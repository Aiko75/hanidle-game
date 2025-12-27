// src/app/api/hanimes/[id]/route.js
import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(request, { params }) {
  try {
    // 1. Lấy id từ URL (ví dụ: /api/hanimes/23778 -> id = 23778)
    const { id } = await params;

    // Validate id
    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { success: false, message: "Invalid id" + id },
        { status: 400 }
      );
    }

    const mode = request.headers.get("x-app-mode");
    const tableName = mode === "hanime" ? "hanimes" : "animes";

    const client = await pool.connect();

    // 2. Query Database tìm bộ anime theo id
    const query = `SELECT * FROM ${tableName} WHERE id = $1`;
    const result = await client.query(query, [id]);

    client.release();

    // 3. Xử lý kết quả
    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Anime not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Detail API Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
