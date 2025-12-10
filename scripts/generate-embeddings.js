const { pipeline } = require("@xenova/transformers");
const { Client } = require("pg");

// 1. Kết nối DB (Dùng chuỗi kết nối Supabase của bạn)
const client = new Client({
  connectionString:
    "postgresql://postgres.lefsyngexrgbucywhfgq:gacongnghiep123@aws-1-us-east-1.pooler.supabase.com:6543/postgres",
  ssl: { rejectUnauthorized: false },
});

async function generate() {
  await client.connect();

  console.log("📥 Đang tải Model AI miễn phí (all-MiniLM-L6-v2)...");
  const extractor = await pipeline(
    "feature-extraction",
    "Xenova/all-MiniLM-L6-v2"
  );

  const res = await client.query(
    "SELECT id, title, synopsis, genres, studios FROM animes WHERE embedding IS NULL"
  );
  const animes = res.rows;

  console.log(`🚀 Bắt đầu tạo vector cho ${animes.length} bộ anime...`);

  for (let i = 0; i < animes.length; i++) {
    const anime = animes[i];

    const textToEmbed = `
      Title: ${anime.title}
      Genres: ${anime.genres?.map((g) => g.name).join(", ") || ""}
      Studio: ${anime.studios?.map((s) => s.name).join(", ") || ""}
      Synopsis: ${anime.synopsis || ""}
    `;

    const output = await extractor(textToEmbed, {
      pooling: "mean",
      normalize: true,
    });
    const embedding = Array.from(output.data);

    await client.query("UPDATE animes SET embedding = $1 WHERE id = $2", [
      JSON.stringify(embedding),
      anime.id,
    ]);

    // Log tiến độ
    if (i % 50 === 0) process.stdout.write(`.`);
  }

  console.log("\n✅ Xong! Đã tạo vector miễn phí cho toàn bộ Database.");
  await client.end();
}

generate();
