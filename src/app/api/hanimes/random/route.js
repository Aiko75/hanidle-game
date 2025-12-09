// src/app/api/random/route.js
import { NextResponse } from "next/server";
import pool from "@/lib/db"; // Import connection pool

export const dynamic = "force-dynamic"; // Bắt buộc dòng này để tránh Next.js cache kết quả random

export async function GET() {
  try {
    const client = await pool.connect();

    // Query lấy 1 dòng ngẫu nhiên từ PostgreSQL (hiệu năng cao)
    const query = "SELECT * FROM animes ORDER BY RANDOM() LIMIT 20";

    const result = await client.query(query);
    client.release();

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Database is empty" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Random API Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
