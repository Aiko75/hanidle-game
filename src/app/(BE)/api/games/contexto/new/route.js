import { NextResponse } from "next/server";
import pool from "@/lib/db";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

// Cache danh sách ID vào RAM
const ID_CACHE = {
  anime: null,
  hanime: null,
};

export async function GET(request) {
  let client;
  try {
    const mode = request.headers.get("app_mode") || "anime";
    const tableName = mode === "hanime" ? "hanimes" : "animes";
    const fileName =
      mode === "hanime" ? "hembeddings.json" : "aembeddings.json";

    // 1. ĐỌC FILE JSON ĐỂ LẤY LIST ID (Chỉ làm 1 lần)
    if (!ID_CACHE[mode]) {
      const filePath = path.join(process.cwd(), "public", "data", fileName);

      if (!fs.existsSync(filePath)) {
        return NextResponse.json(
          { success: false, message: `File ${fileName} not found` },
          { status: 404 }
        );
      }

      const fileContent = fs.readFileSync(filePath, "utf-8");
      const jsonData = JSON.parse(fileContent);

      // Map ra danh sách ID (dữ liệu của bạn là mảng object {id, vector})
      ID_CACHE[mode] = jsonData.map((item) => item.id);
    }

    const availableIds = ID_CACHE[mode];

    if (!availableIds || availableIds.length === 0) {
      return NextResponse.json(
        { success: false, message: "No IDs found in embedding file" },
        { status: 500 }
      );
    }

    // 2. CHỌN NGẪU NHIÊN 1 ID
    const randomId =
      availableIds[Math.floor(Math.random() * availableIds.length)];

    // 3. LẤY INFO TỪ DB
    client = await pool.connect();

    // Lấy các trường cần thiết để hiển thị hint/kết quả
    const query = `
      SELECT id, title, slug, thumbnail, genres, studios, release_year, views 
      FROM ${tableName} 
      WHERE id = $1
    `;
    const res = await client.query(query, [randomId]);

    if (res.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Anime found in JSON but not in DB" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: res.rows[0],
    });
  } catch (error) {
    console.error("❌ Contexto Random Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  } finally {
    if (client) client.release();
  }
}
