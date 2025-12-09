const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

// 👇 1. Dán chuỗi kết nối Supabase của bạn vào đây
// Nhớ thay [YOUR-PASSWORD] bằng mật khẩu mới bạn vừa đặt
const connectionString =
  "postgresql://postgres.lefsyngexrgbucywhfgq:gacongnghiep123@aws-1-us-east-1.pooler.supabase.com:6543/postgres";

const client = new Client({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false, // Bắt buộc để kết nối Cloud DB
  },
});

// Hàm format ngày tháng
function parseDate(dateStr) {
  if (!dateStr || dateStr.length < 15) return null;
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
    console.log("⏳ Đang kết nối tới Supabase...");
    await client.connect();
    console.log("🔥 Kết nối thành công!");

    // 2. Đọc file JSON (Đảm bảo đường dẫn đúng)
    // Nếu file json nằm trong folder public/data:
    const jsonPath = path.join(__dirname, "../public/data/ihentai_all.json");
    // Hoặc nếu file json nằm cùng cấp với seed.js thì dùng: path.join(__dirname, 'ihentai_all.json')

    if (!fs.existsSync(jsonPath)) {
      throw new Error(`Không tìm thấy file tại: ${jsonPath}`);
    }

    const rawData = fs.readFileSync(jsonPath, "utf-8");
    const animes = JSON.parse(rawData);

    console.log(
      `📦 Tìm thấy ${animes.length} bộ anime. Đang bắt đầu import...`
    );

    // 3. Loop và Insert
    await client.query("BEGIN"); // Bắt đầu transaction

    for (const anime of animes) {
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
        JSON.stringify(anime.genres),
        JSON.stringify(anime.studios),
        JSON.stringify(anime.tags),
        JSON.stringify(anime),
      ];

      await client.query(query, values);
      // Log nhẹ để biết tiến độ (cứ 100 bộ log 1 lần)
      if (anime.id % 50 === 0) process.stdout.write(".");
    }

    await client.query("COMMIT"); // Lưu thay đổi
    console.log("\n✅ Import thành công toàn bộ dữ liệu lên Supabase!");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("\n❌ Lỗi khi import:", err);
  } finally {
    await client.end();
  }
}

importData();
