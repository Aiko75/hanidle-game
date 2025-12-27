// src/app/api/hanimes/route.js
import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    // Lấy tham số từ URL
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "24");
    const search = searchParams.get("search") || "";
    const offset = (page - 1) * limit;

    const mode = request.headers.get("x-app-mode");
    const tableName = mode === "hanime" ? "hanimes" : "animes";

    const client = await pool.connect();

    // 1. Query đếm tổng số (để tính số trang)
    // ILIKE là cú pháp tìm kiếm không phân biệt hoa thường của Postgres
    const countQuery = `
        SELECT COUNT(*) FROM ${tableName}
        WHERE title ILIKE $1
    `;
    const countRes = await client.query(countQuery, [`%${search}%`]);
    const totalItems = parseInt(countRes.rows[0].count);
    const totalPages = Math.ceil(totalItems / limit);

    // 2. Query lấy dữ liệu phân trang
    const dataQuery = `
        SELECT * FROM ${tableName} 
        WHERE title ILIKE $1 
        ORDER BY created_at DESC 
        LIMIT $2 OFFSET $3
    `;
    const dataRes = await client.query(dataQuery, [
      `%${search}%`,
      limit,
      offset,
    ]);

    client.release();

    return NextResponse.json({
      success: true,
      data: dataRes.rows,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
      },
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
