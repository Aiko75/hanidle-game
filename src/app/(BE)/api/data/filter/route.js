import { NextResponse } from "next/server";
import pool from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request) {
  let client;
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode") || "hanime";
    const tableName = mode === "hanime" ? "hanimes" : "animes";

    client = await pool.connect();

    // Query JSONB: Tách mảng -> Lấy value ở key 'name' -> Distinct
    const queries = {
      studios: `
        SELECT DISTINCT elem->>'name' as name
        FROM ${tableName}, jsonb_array_elements(studios) elem
        ORDER BY name ASC
      `,
      genres: `
        SELECT DISTINCT elem->>'name' as name
        FROM ${tableName}, jsonb_array_elements(genres) elem
        ORDER BY name ASC
      `,
      tags: `
        SELECT DISTINCT elem->>'name' as name
        FROM ${tableName}, jsonb_array_elements(tags) elem
        ORDER BY name ASC
      `,
    };

    const [studiosRes, genresRes, tagsRes] = await Promise.all([
      client.query(queries.studios),
      client.query(queries.genres),
      client.query(queries.tags),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        studios: studiosRes.rows.map((row) => row.name),
        genres: genresRes.rows.map((row) => row.name),
        tags: tagsRes.rows.map((row) => row.name),
      },
    });
  } catch (error) {
    console.error("❌ Filter API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  } finally {
    if (client) client.release();
  }
}
