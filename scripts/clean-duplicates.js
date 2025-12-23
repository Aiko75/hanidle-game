const fs = require("fs");
const path = require("path");

async function cleanData() {
  const filePath = path.join(__dirname, "../public/data/ihentai_all.json");

  console.log(`⏳ Đang bắt đầu quét dữ liệu tại: ${filePath}`);

  if (!fs.existsSync(filePath)) {
    console.error("❌ Lỗi: Không tìm thấy file ihentai_all.json!");
    return;
  }

  try {
    // 1. Đọc dữ liệu thô
    const rawData = fs.readFileSync(filePath, "utf-8");
    const animes = JSON.parse(rawData);
    const totalBefore = animes.length;

    console.log(`🔍 Tổng số bản ghi ban đầu: ${totalBefore}`);

    // 2. Sử dụng Map để lọc trùng theo ID
    // Map sẽ ghi đè giá trị nếu key (id) đã tồn tại, đảm bảo chỉ giữ lại 1 bản ghi duy nhất
    const uniqueMap = new Map();

    animes.forEach((item) => {
      if (item.id) {
        uniqueMap.set(item.id, item);
      }
    });

    // 3. Chuyển Map ngược lại thành Array
    const cleanedAnimes = Array.from(uniqueMap.values());
    const totalAfter = cleanedAnimes.length;
    const deletedCount = totalBefore - totalAfter;

    // 4. Ghi lại vào file
    fs.writeFileSync(filePath, JSON.stringify(cleanedAnimes, null, 2), "utf-8");

    console.log("------------------------------------------");
    console.log(`✅ Hoàn tất làm sạch dữ liệu!`);
    console.log(`📊 Số bản ghi bị trùng đã xóa: ${deletedCount}`);
    console.log(`🚀 Số bản ghi còn lại: ${totalAfter}`);
    console.log("------------------------------------------");
  } catch (error) {
    console.error("❌ Có lỗi xảy ra trong quá trình xử lý:", error);
  }
}

cleanData();
