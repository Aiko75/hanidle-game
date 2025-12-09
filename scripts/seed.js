const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

// 1. Cấu hình kết nối DB (Sửa lại cho đúng pass của bạn)
const client = new Client({
  connectionString: "postgresql://postgres:nhandz123@localhost:5432/hanime_db",
});

// Hàm format ngày tháng từ dạng "20251207 171042" sang ISO cho Postgres
function parseDate(dateStr) {
  if (!dateStr || dateStr.length < 15) return null;
  // Cắt chuỗi thủ công: YYYY-MM-DD HH:mm:ss
  const year = dateStr.substring(0, 4);
  const month = dateStr.substring(4, 6);
  const day = dateStr.substring(6, 8);
  const time = dateStr
    .substring(9)
    .replace(/(\d{2})(\d{2})(\d{2})/, "$1:$2:$3");
  return `${year}-${month}-${day} ${time}`;
}

async function importData() {
  try {
    await client.connect();
    console.log("🔥 Đã kết nối DB, đang đọc file JSON...");

    // 2. Đọc file JSON
    const jsonPath = path.join(__dirname, "public/data/ihentai_all.json"); // Sửa đường dẫn nếu cần
    const rawData = fs.readFileSync(jsonPath, "utf-8");
    const animes = JSON.parse(rawData);

    console.log(`📦 Tìm thấy ${animes.length} bộ anime. Bắt đầu import...`);

    // 3. Loop và Insert
    // Sử dụng transaction để đảm bảo an toàn dữ liệu
    await client.query("BEGIN");

    for (const anime of animes) {
      // Xử lý dữ liệu trước khi insert (Transform)
      const releaseYearInt = anime.releaseYear?.name
        ? parseInt(anime.releaseYear.name)
        : null;
      const createdAtISO = parseDate(anime.createdAt);
      const updatedAtISO = parseDate(anime.updatedAt);

      const query = `
                INSERT INTO animes (
                    id, title, slug, synopsis, views, 
                    release_year, thumbnail, poster, url, 
                    created_at, updated_at, 
                    genres, studios, tags, raw_data
                ) VALUES (
                    $1, $2, $3, $4, $5, 
                    $6, $7, $8, $9, 
                    $10, $11, 
                    $12, $13, $14, $15
                )
                ON CONFLICT (id) DO UPDATE SET
                    views = EXCLUDED.views,
                    updated_at = EXCLUDED.updated_at; 
            `;

      // Mapping giá trị vào params ($1, $2...)
      const values = [
        anime.id,
        anime.title,
        anime.slug,
        anime.synopsis,
        anime.views || 0,
        releaseYearInt,
        anime.thumbnail,
        anime.poster,
        anime.url,
        createdAtISO,
        updatedAtISO,
        JSON.stringify(anime.genres), // Convert array sang JSON string
        JSON.stringify(anime.studios),
        JSON.stringify(anime.tags),
        JSON.stringify(anime), // Lưu toàn bộ object
      ];

      await client.query(query, values);
    }

    await client.query("COMMIT");
    console.log("✅ Import thành công toàn bộ dữ liệu!");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Lỗi khi import:", err);
  } finally {
    await client.end();
  }
}

importData();
