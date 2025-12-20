const fs = require("fs");
const path = require("path");

async function updateDomain() {
  const filePath = path.join(__dirname, "../public/data/ihentai_all.json");

  console.log(`📂 Đang đọc file dữ liệu: ${filePath}`);

  if (!fs.existsSync(filePath)) {
    console.error("❌ Không tìm thấy file dữ liệu!");
    return;
  }

  try {
    // 1. Đọc dữ liệu
    const rawData = fs.readFileSync(filePath, "utf-8");
    let animes = JSON.parse(rawData);

    console.log(`🔍 Tìm thấy ${animes.length} bộ. Đang xử lý thay thế URL...`);

    let count = 0;

    // 2. Duyệt và thay thế (Map)
    const updatedAnimes = animes.map((anime) => {
      if (anime.url && anime.url.includes("ihentai.kim")) {
        // Thay thế chuỗi
        anime.url = anime.url.replace("ihentai.kim", "ihentai.to");
        count++;
      }
      return anime;
    });

    // 3. Ghi đè lại file cũ
    fs.writeFileSync(filePath, JSON.stringify(updatedAnimes, null, 2), "utf-8");

    console.log(`✅ Hoàn tất! Đã cập nhật URL cho ${count} bộ anime.`);
    console.log(`👉 Domain mới: ihentai.to`);
  } catch (error) {
    console.error("❌ Có lỗi xảy ra:", error);
  }
}

updateDomain();
