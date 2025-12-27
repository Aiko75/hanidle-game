const fs = require("fs");
const path = require("path");

async function generate() {
  console.log("📥 Đang tải Model AI...");
  const { pipeline } = await import("@xenova/transformers");
  const extractor = await pipeline(
    "feature-extraction",
    "Xenova/all-MiniLM-L6-v2"
  );

  // 1. Đọc dữ liệu gốc
  const dataPath = path.join(__dirname, "../public/data/anime_full.json");
  const rawData = fs.readFileSync(dataPath, "utf-8");
  const animes = JSON.parse(rawData);

  console.log(`🚀 Bắt đầu tạo vector cho ${animes.length} bộ anime...`);

  const embeddingsData = []; // Mảng chứa kết quả

  for (let i = 0; i < animes.length; i++) {
    const anime = animes[i];

    // Chuẩn bị text
    const textToEmbed = `
      Title: ${anime.title}
      Genres: ${anime.genres?.map((g) => g.name).join(", ") || ""}
      Studio: ${anime.studios?.map((s) => s.name).join(", ") || ""}
      Synopsis: ${anime.synopsis || ""}
    `;

    // Tạo vector
    const output = await extractor(textToEmbed, {
      pooling: "mean",
      normalize: true, // Quan trọng: Đã chuẩn hóa thì tính khoảng cách cực nhanh
    });

    // Lưu gọn nhẹ: Chỉ cần ID và Vector
    embeddingsData.push({
      id: anime.id,
      vector: Array.from(output.data),
    });

    if (i % 50 === 0) process.stdout.write(`.`);
  }

  // 2. Ghi ra file riêng
  const outputPath = path.join(__dirname, "../public/data/aembeddings.json");
  fs.writeFileSync(outputPath, JSON.stringify(embeddingsData));

  console.log(`\n✅ Xong! File vector lưu tại: ${outputPath}`);
  console.log(
    `dung lượng file khoảng: ${(
      fs.statSync(outputPath).size /
      1024 /
      1024
    ).toFixed(2)} MB`
  );
}

generate();
