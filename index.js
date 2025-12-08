const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const fs = require("fs");

puppeteer.use(StealthPlugin());

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--no-sandbox", "--disable-blink-features=AutomationControlled"],
  });

  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"
  );

  // mở trang chính để tạo session hợp lệ
  await page.goto("https://ihentai.kim", {
    waitUntil: "networkidle2",
    timeout: 60000,
  });

  let allData = [];
  const maxPage = 115;

  for (let p = 1; p <= maxPage; p++) {
    const apiURL = `https://ihentai.kim/api/search?page=${p}&limit=24&orderby=date&order=desc&s=`;

    console.log(`🔍 Fetching page ${p}/${maxPage} ...`);

    try {
      const data = await page.evaluate(async (apiURL) => {
        const res = await fetch(apiURL);
        return res.json();
      }, apiURL);

      if (data?.videos?.length > 0) {
        allData.push(...data.videos);
        console.log(`✅ Page ${p} OK (${data.videos.length} items)`);
      } else {
        console.log(`⚠️ Page ${p} trả về rỗng`);
      }

      // delay nhẹ để tránh bị nhận diện bot
      await new Promise((r) => setTimeout(r, 500));
    } catch (err) {
      console.log(`❌ Lỗi ở page ${p}:`, err.message);
    }
  }

  // ghi file
  fs.writeFileSync(
    "ihentai_all.json",
    JSON.stringify(allData, null, 2),
    "utf8"
  );

  console.log(`🎉 DONE! Tổng cộng: ${allData.length} videos`);
  console.log("💾 File tại: ihentai_all.json");

  await browser.close();
})();
