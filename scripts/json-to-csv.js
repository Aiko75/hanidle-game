const fs = require("fs");
const path = require("path");

// Hàm xử lý Escape CSV (Quan trọng để không bị vỡ cột)
function toCsvField(text) {
  if (text === null || text === undefined) return "";
  const str = String(text);

  // Nếu có dấu phẩy, ngoặc kép hoặc xuống dòng -> Phải bọc trong ngoặc kép
  // Và nhân đôi ngoặc kép bên trong (Escape quote)
  if (
    str.includes(",") ||
    str.includes('"') ||
    str.includes("\n") ||
    str.includes("\r")
  ) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

async function convert() {
  console.log("📂 Đang đọc file JSON...");

  const inputPath = path.join(__dirname, "../public/data/ihentai_all.json");
  const outputPath = path.join(__dirname, "../public/data/ihentai_all.csv");
  // const inputPath = path.join(__dirname, "../public/data/anime_full.json");
  // const outputPath = path.join(__dirname, "../public/data/anime_full.csv");

  if (!fs.existsSync(inputPath)) {
    console.error(`❌ Không tìm thấy file tại: ${inputPath}`);
    return;
  }

  const rawData = fs.readFileSync(inputPath, "utf-8");
  const animes = JSON.parse(rawData);

  console.log(
    `🚀 Bắt đầu chuyển đổi ${animes.length} dòng sang CSV (Chuẩn Excel)...`
  );

  const writeStream = fs.createWriteStream(outputPath, {
    flags: "w",
    encoding: "utf8",
  });

  // 🔥 QUAN TRỌNG NHẤT: Thêm BOM (Byte Order Mark) ở đầu file
  // Ký tự này báo cho Excel biết đây là file UTF-8
  writeStream.write("\uFEFF");

  // Định nghĩa Header
  const headers = [
    "ID",
    "Title",
    "Slug",
    "Release Year",
    "Views",
    "Genres",
    "Studios",
    "Tags",
    "URL",
    "Thumbnail",
    "Synopsis",
  ];

  writeStream.write(headers.join(",") + "\n");

  for (const anime of animes) {
    // Làm phẳng dữ liệu
    const genresStr = anime.genres?.map((g) => g.name).join(", ") || "";
    const studiosStr = anime.studios?.map((s) => s.name).join(", ") || "";
    const tagsStr = anime.tags?.map((t) => t.name).join(", ") || "";
    const releaseYearStr = anime.releaseYear?.name || "";

    const row = [
      anime.id,
      toCsvField(anime.title),
      toCsvField(anime.slug),
      toCsvField(releaseYearStr),
      anime.views || 0,
      toCsvField(genresStr),
      toCsvField(studiosStr),
      toCsvField(tagsStr),
      toCsvField(anime.url),
      toCsvField(anime.thumbnail),
      toCsvField(anime.synopsis),
    ];

    const rowString = row.join(",") + "\n";

    if (!writeStream.write(rowString)) {
      await new Promise((resolve) => writeStream.once("drain", resolve));
    }
  }

  writeStream.end();

  writeStream.on("finish", () => {
    const stats = fs.statSync(outputPath);
    console.log(
      `\n✅ Xong! File CSV chuẩn Excel đã được tạo tại: ${outputPath}`
    );
    console.log(`📦 Dung lượng: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  });
}

convert();
