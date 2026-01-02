const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");

// --- CẤU HÌNH ---
const CONFIG = {
  BASE_URL: "https://animevietsub.show/anime-bo/trang-",
  DOMAIN: "https://animevietsub.show",
  MAX_PAGES: 1000,
  TIMEOUT: 15000,
  DELAY_MS: 500,
  OUTPUT_DIR: "public/data",
  FILES: {
    LIST: "anime_list.json",
    DETAIL: "anime_full.json",
  },
};

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
  Referer: "https://animevietsub.show/",
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function ensureDirectoryExistence(filePath) {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }
}

function extractIdFromUrl(url) {
  if (!url) return null;
  const match = url.match(/-a(\d+)(\/|$)/);
  return match ? parseInt(match[1]) : null;
}

// --- STAGE 1: CRAWL DANH SÁCH ---
async function crawlList() {
  console.log(
    `\n🚀 [STAGE 1] BẮT ĐẦU QUÉT DANH SÁCH (Max Pages: ${CONFIG.MAX_PAGES})...`
  );
  let animeList = [];
  let idSet = new Set();

  for (let page = 1; page <= CONFIG.MAX_PAGES; page++) {
    const url = `${CONFIG.BASE_URL}${page}.html`;
    try {
      const { data: html } = await axios.get(url, {
        headers: HEADERS,
        timeout: CONFIG.TIMEOUT,
      });
      const $ = cheerio.load(html);
      let count = 0;

      $("article.TPost").each((_, el) => {
        const title = $(el).find("h2.Title").text().trim();
        const link = $(el).find("a").attr("href");
        const id = extractIdFromUrl(link);

        if (id && title && !idSet.has(id)) {
          idSet.add(id);
          animeList.push({ id, title, url: link });
          count++;
        }
      });

      console.log(`   ✅ Trang ${page}: Tìm thấy ${count} bộ.`);
      if (count === 0) break;
      await sleep(CONFIG.DELAY_MS);
    } catch (err) {
      console.error(`   ❌ Lỗi trang ${page}: ${err.message}`);
      if (err.response?.status === 404) break;
    }
  }

  const outputPath = path.join(CONFIG.OUTPUT_DIR, CONFIG.FILES.LIST);
  ensureDirectoryExistence(outputPath);
  fs.writeFileSync(outputPath, JSON.stringify(animeList, null, 2), "utf-8");
  return animeList;
}

// --- STAGE 2: CRAWL CHI TIẾT ---
async function crawlDetails(animeList) {
  if (!animeList || animeList.length === 0) return;

  console.log(
    `\n🚀 [STAGE 2] BẮT ĐẦU FETCH CHI TIẾT CHO ${animeList.length} BỘ...`
  );
  const fullData = [];

  for (const [index, item] of animeList.entries()) {
    try {
      process.stdout.write(
        `   ⏳ [${index + 1}/${animeList.length}] Đang tải: ${item.title}... `
      );

      const { data: html } = await axios.get(item.url, {
        headers: HEADERS,
        timeout: CONFIG.TIMEOUT,
      });
      const $ = cheerio.load(html);

      // 1. Genres
      const genres = $(".InfoList li:contains('Thể loại') a")
        .map((_, el) => ({
          id: null,
          name: $(el).text().trim(),
          slug: $(el).attr("href")?.split("/").filter(Boolean).pop() || "",
          thumbnail: "",
          taxonomy: "category",
          description: "",
          count: 0,
        }))
        .get();

      let category = "anime"; // Mặc định
      const genreSlugs = genres.map((g) => g.slug);

      if (genreSlugs.includes("hoat-hinh-trung-quoc")) {
        category = "donghua"; // Hoạt hình Trung Quốc
      } else if (genreSlugs.includes("live-action")) {
        category = "live-action"; // Phim người đóng
      } else if (genreSlugs.includes("tokusatsu")) {
        category = "tokusatsu"; // Kamen Rider, Sentai...
      } else if (genreSlugs.includes("cartoon")) {
        category = "cartoon"; // Hoạt hình phương Tây
      }

      // 2. Tags
      const tags = $("#mv-keywords a")
        .map((_, el) => ({
          id: null,
          name: $(el).text().trim(),
          slug: $(el).attr("href")?.split("/").filter(Boolean).pop() || "",
          thumbnail: "",
          taxonomy: "post_tag",
          description: "",
          count: 0,
        }))
        .get();

      // 3. Studios
      const studios = $(".InfoList li:contains('Studio') a")
        .map((_, el) => ({
          id: null,
          name: $(el).text().trim(),
          slug: $(el).attr("href")?.split("/").filter(Boolean).pop() || "",
          thumbnail: "",
          taxonomy: "studio",
          description: "",
          count: 0,
        }))
        .get();

      // 4. Country
      const countryEl = $(".InfoList li:contains('Quốc gia') a").first();
      const countryName = countryEl.text().trim();
      const countrySlug =
        countryEl.attr("href")?.split("/").filter(Boolean).pop() || "";

      // 5. Views & Year
      const viewText = $(".View").text().replace(/,/g, "");
      const views = parseInt(viewText.match(/\d+/)?.[0]) || 0;
      const yearText = $(".Date a").first().text().trim();

      // --- TẠO OBJECT ---
      const animeDetail = {
        id: item.id,
        title: item.title,
        slug: item.url.replace(CONFIG.DOMAIN, ""),
        synopsis: $(".Description").first().text().trim(),
        createdAt: "",
        updatedAt: "",
        url: item.url,
        commentUrl: "",
        genres: genres,
        tags: tags,
        studios: studios,
        country: {
          id: null,
          name: countryName,
          slug: countrySlug,
          thumbnail: "",
          taxonomy: "nation",
          description: "",
          count: 0,
        },
        releaseYear: {
          id: null,
          name: yearText,
          slug: yearText,
          thumbnail: "",
          taxonomy: "pubyear",
          description: "",
          count: 0,
        },
        views: views,
        likes: 0,
        dislikes: 0,
        alternativeTitles: [$(".SubTitle").text().trim()],
        thumbnail: $(".Image img").attr("src") || "",
        poster: $(".TPostBg img").attr("src") || "",
        notes: "",
        censorship: "censored",
        category: category,
        languages: ["vi"],
        isTrailer: false,
        links: [$(".watch_button_more").attr("href") || ""],
      };

      fullData.push(animeDetail);
      console.log(`OK [${category.toUpperCase()}] ✅`);
      await sleep(CONFIG.DELAY_MS);
    } catch (err) {
      console.log(`FAILED ❌ (${err.message})`);
    }
  }

  const outputPath = path.join(CONFIG.OUTPUT_DIR, CONFIG.FILES.DETAIL);
  fs.writeFileSync(outputPath, JSON.stringify(fullData, null, 2), "utf-8");
  console.log(`\n🏁 HOÀN TẤT! Dữ liệu đã lưu tại: ${outputPath}`);
}

(async () => {
  const animeList = await crawlList();
  await crawlDetails(animeList);
})();
