import { NextResponse } from "next/server";
import pool from "@/lib/db";

export const dynamic = "force-dynamic";

// --- HÀM CHECK LOGIC (Đã sửa truy cập raw_data) ---
const checkMatch = (anime, cell) => {
  if (!anime) return false;
  switch (cell.type) {
    case "year_eq":
      return anime.release_year === cell.value;
    case "year_gt":
      return anime.release_year > cell.value;
    case "year_lt":
      return anime.release_year < cell.value;
    case "views_gt":
      return (anime.views || 0) > cell.value;
    case "views_lt":
      return (anime.views || 0) < cell.value;
    case "genre":
      return Array.isArray(anime.genres) && anime.genres.includes(cell.value);
    case "studio":
      return Array.isArray(anime.studios) && anime.studios.includes(cell.value);

    // SỬA: Chỉ lấy từ raw_data
    case "censorship":
      return anime.raw_data?.censorship === cell.value;

    case "category":
      return anime.raw_data?.category === cell.value;

    default:
      return false;
  }
};

export async function POST(request) {
  let client;
  try {
    const { grid } = await request.json();
    const mode = request.headers.get("app_mode") || "anime";
    const tableName = mode === "hanime" ? "hanimes" : "animes";

    client = await pool.connect();

    // 1. LẤY TOÀN BỘ DATA (FULL SCAN)
    // Đã bỏ cột 'censorship' và 'category' để tránh lỗi SQL
    const query = `
      SELECT id, title, release_year, views, genres, studios, raw_data, tags, thumbnail, slug
      FROM ${tableName}
    `;

    const dbRes = await client.query(query);
    let rawData = dbRes.rows;

    // Shuffle toàn bộ data
    rawData = rawData.sort(() => 0.5 - Math.random());

    const TOTAL_CARDS = 40;

    // 2. PHÂN TÍCH TOÀN BỘ DB (PRE-CALCULATION)
    // Map ngược: CellID -> Danh sách Anime khớp với Cell đó
    const poolByCell = {};
    grid.forEach((cell) => (poolByCell[cell.id] = []));

    // Duyệt qua tất cả bản ghi để phân loại vào từng ô
    const processedAnime = rawData.map((anime) => {
      const matches = [];
      grid.forEach((cell) => {
        if (checkMatch(anime, cell)) matches.push(cell.id);
      });

      // Đẩy anime vào bucket của từng cell nó match
      matches.forEach((cellId) => {
        poolByCell[cellId].push({ ...anime, matchedCellIds: matches });
      });

      return { ...anime, matchedCellIds: matches };
    });

    // 3. THUẬT TOÁN "ROBIN HOOD" (Lấy giàu bù nghèo)
    // Ưu tiên bốc bài cho những ô ĐANG có ít bài nhất trong Deck

    let currentDeck = [];
    const usedAnimeIds = new Set();
    const cellDeckCounts = Array(16).fill(0);

    // Safety loop
    for (let i = 0; i < 2000; i++) {
      if (currentDeck.length >= TOTAL_CARDS) break;

      // BƯỚC A: TÌM Ô ĐANG CẦN ƯU TIÊN NHẤT (Sorted by Scarcity)
      // 1. Ưu tiên ô có ít bài trong Deck nhất.
      // 2. Nếu bằng nhau, ưu tiên ô có ít tài nguyên trong DB nhất (Độ hiếm).
      const sortedCellIds = grid
        .map((c) => c.id)
        .sort((a, b) => {
          if (cellDeckCounts[a] !== cellDeckCounts[b]) {
            return cellDeckCounts[a] - cellDeckCounts[b];
          }
          return poolByCell[a].length - poolByCell[b].length;
        });

      // BƯỚC B: TÌM BÀI CHO Ô ƯU TIÊN
      let cardAdded = false;

      // Duyệt theo thứ tự ưu tiên (từ nghèo nhất lên)
      for (const targetCellId of sortedCellIds) {
        const potentialCandidates = poolByCell[targetCellId];

        // Tìm một bộ chưa dùng
        const candidate = potentialCandidates.find(
          (anime) => !usedAnimeIds.has(anime.id)
        );

        if (candidate) {
          // Thêm vào Deck
          currentDeck.push(candidate);
          usedAnimeIds.add(candidate.id);

          // Cập nhật count cho TẤT CẢ các ô mà anime này match (Một mũi tên trúng nhiều đích)
          candidate.matchedCellIds.forEach((id) => cellDeckCounts[id]++);

          cardAdded = true;
          break; // Xong lượt này, quay lại tính toán lại độ nghèo
        }
      }

      // Nếu quét hết các ô mà không thêm được bài nào (Hết sạch bài khả thi trong DB)
      if (!cardAdded) break;
    }

    // 4. FALLBACK: NẾU VẪN CHƯA ĐỦ 40 (Lấy bài match bất kỳ còn lại)
    if (currentDeck.length < TOTAL_CARDS) {
      for (const anime of processedAnime) {
        if (currentDeck.length >= TOTAL_CARDS) break;
        if (usedAnimeIds.has(anime.id)) continue;

        // Chỉ lấy bài có tác dụng (match > 0)
        if (anime.matchedCellIds.length > 0) {
          currentDeck.push(anime);
          usedAnimeIds.add(anime.id);
          anime.matchedCellIds.forEach((id) => cellDeckCounts[id]++);
        }
      }
    }

    // 5. FALLBACK CUỐI CÙNG: LẤY BÀI RÁC (0 Match)
    if (currentDeck.length < TOTAL_CARDS) {
      for (const anime of processedAnime) {
        if (currentDeck.length >= TOTAL_CARDS) break;
        if (usedAnimeIds.has(anime.id)) {
          currentDeck.push(anime);
          usedAnimeIds.add(anime.id);
        }
      }
    }

    // Shuffle Deck
    const shuffledDeck = currentDeck.sort(() => 0.5 - Math.random());

    // Debug info
    const debugDistribution = {};
    grid.forEach((cell) => {
      debugDistribution[cell.id] = [];
    });
    shuffledDeck.forEach((card, index) => {
      if (card.matchedCellIds) {
        card.matchedCellIds.forEach((cellId) =>
          debugDistribution[cellId].push(index)
        );
      }
    });

    // Thống kê độ hiếm để debug (Xem trong DB có bao nhiêu phim khớp từng ô)
    const scarcityReport = {};
    grid.forEach((cell) => {
      scarcityReport[cell.label] = poolByCell[cell.id].length;
    });

    return NextResponse.json({
      success: true,
      deck: shuffledDeck,
      total: shuffledDeck.length,
      debug_distribution: debugDistribution,
      db_scarcity: scarcityReport,
    });
  } catch (error) {
    console.error("❌ Bingo Deck Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  } finally {
    if (client) client.release();
  }
}
