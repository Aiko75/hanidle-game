import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(request) {
  let client;
  try {
    const body = await request.json();

    const {
      page = 1,
      limit = 20,
      search = "",
      sortBy = "newest",
      mode = "anime",
      filters = {},
    } = body;

    const {
      genre = "All",
      studio = "All",
      tag = "All",
      minYear,
      maxYear,
      minView,
      maxView,
    } = filters;
    const offset = (page - 1) * limit;

    const tableMap = { anime: "animes", hanime: "hanimes" };
    const tableName = tableMap[mode] || "animes";

    client = await pool.connect();

    let whereClauses = [];
    let queryParams = [];

    // -- Search (Title)
    if (search) {
      queryParams.push(`%${search}%`);
      whereClauses.push(`${tableName}.title ILIKE $${queryParams.length}`);
    }

    // --- LOGIC JSONB FILTER ---

    // -- Filter: Genre
    if (genre && genre !== "All") {
      // Tạo một JSON object string để so sánh: '[{"name": "NTR"}]'
      const jsonParam = JSON.stringify([{ name: genre }]);
      queryParams.push(jsonParam);
      // Toán tử @> kiểm tra xem JSONB bên trái có chứa JSON bên phải không
      whereClauses.push(`${tableName}.genres @> $${queryParams.length}::jsonb`);
    }

    // -- Filter: Studio
    if (studio && studio !== "All") {
      const jsonParam = JSON.stringify([{ name: studio }]);
      queryParams.push(jsonParam);
      whereClauses.push(
        `${tableName}.studios @> $${queryParams.length}::jsonb`
      );
    }

    // -- Filter: Tag
    if (tag && tag !== "All") {
      const jsonParam = JSON.stringify([{ name: tag }]);
      queryParams.push(jsonParam);
      whereClauses.push(`${tableName}.tags @> $${queryParams.length}::jsonb`);
    }

    // -- Filter: Year & Views (Giữ nguyên như cũ)
    if (minYear) {
      queryParams.push(parseInt(minYear));
      whereClauses.push(`${tableName}.release_year >= $${queryParams.length}`);
    }
    if (maxYear) {
      queryParams.push(parseInt(maxYear));
      whereClauses.push(`${tableName}.release_year <= $${queryParams.length}`);
    }
    if (minView) {
      queryParams.push(parseInt(minView));
      whereClauses.push(`${tableName}.views >= $${queryParams.length}`);
    }
    if (maxView) {
      queryParams.push(parseInt(maxView));
      whereClauses.push(`${tableName}.views <= $${queryParams.length}`);
    }

    const whereString =
      whereClauses.length > 0 ? whereClauses.join(" AND ") : "1=1";

    // Sorting
    let orderBy = `${tableName}.created_at DESC`;
    switch (sortBy) {
      case "oldest":
        orderBy = `${tableName}.release_year ASC, ${tableName}.created_at ASC`;
        break;
      case "newest":
        orderBy = `${tableName}.release_year DESC, ${tableName}.created_at DESC`;
        break;
      case "most_viewed":
        orderBy = `${tableName}.views DESC`;
        break;
      case "least_viewed":
        orderBy = `${tableName}.views ASC`;
        break;
    }

    // Count Query
    const countQuery = `SELECT COUNT(*) FROM ${tableName} WHERE ${whereString}`;
    const countRes = await client.query(countQuery, queryParams);
    const totalItems = parseInt(countRes.rows[0].count);
    const totalPages = Math.ceil(totalItems / limit);

    // Data Query
    // Lưu ý: Cột genres, studios, tags giờ trả về nguyên cục JSON Object.
    // Frontend của bạn sẽ nhận được [{id:..., name: "NTR"}, ...].
    // Nếu Frontend chỉ muốn hiện tên, bạn map nó ở FE hoặc xử lý SQL ở đây.
    // Để nguyên JSON trả về cho FE là linh hoạt nhất (lấy được cả slug/thumbnail nếu cần).
    const dataQuery = `
      SELECT 
        m.*,
        json_build_object('name', m.release_year) as "releaseYear"
      FROM ${tableName} m
      WHERE ${whereString.replace(new RegExp(tableName, "g"), "m")}
      ORDER BY ${orderBy.replace(new RegExp(tableName, "g"), "m")}
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `;

    const dataRes = await client.query(dataQuery, [
      ...queryParams,
      limit,
      offset,
    ]);

    return NextResponse.json({
      success: true,
      data: dataRes.rows,
      pagination: { page, limit, totalItems, totalPages },
    });
  } catch (error) {
    console.error("❌ API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  } finally {
    if (client) client.release();
  }
}
