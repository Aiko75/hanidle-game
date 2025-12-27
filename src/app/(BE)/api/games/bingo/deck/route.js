import { NextResponse } from "next/server";
import hanimeData from "@/../public/data/ihentai_all.json";
import animeData from "@/../public/data/anime_full.json";

// Hàm kiểm tra logic khớp điều kiện
const checkMatch = (anime, cell) => {
  if (!anime) return false;
  switch (cell.type) {
    case "year_eq":
      return parseInt(anime.releaseYear?.name) === cell.value;
    case "year_gt":
      return parseInt(anime.releaseYear?.name) > cell.value;
    case "year_lt":
      return parseInt(anime.releaseYear?.name) < cell.value;
    case "views_gt":
      return (anime.views || 0) > cell.value;
    case "views_lt":
      return (anime.views || 0) < cell.value;
    case "genre":
      return anime.genres?.some((g) => g.name === cell.value);
    case "studio":
      return anime.studios?.some((s) => s.name === cell.value);
    case "censorship":
      return anime.censorship === cell.value;
    case "category":
      return anime.category === cell.value;
    default:
      return false;
  }
};

export async function POST(request) {
  try {
    // Nhận thêm tham số goal từ request
    const { grid, goal } = await request.json();

    // --- BƯỚC 0: TÍNH TOÁN SỐ LƯỢNG THEO GOAL ---
    // 1 line -> 30 cards, 2 lines -> 40 cards, 3 lines -> 50 cards
    const totalCards = goal === 1 ? 30 : goal === 2 ? 40 : 50;
    const targetMatched = Math.floor(totalCards * 0.7); // Tỷ lệ 70% trúng (21, 28, 35)
    const targetUnmatched = totalCards - targetMatched; // Tỷ lệ 30% trượt (9, 12, 15)

    const matchedAnimes = [];
    const unMatchedAnimes = [];
    const usedIds = new Set();

    // Bộ đếm giới hạn mỗi ô tối đa 3 card phù hợp để dàn trải đáp án
    const tempDistributionCount = Array(16).fill(0);

    const mode = request.headers.get("x-app-mode");
    const sourceData = mode === "hanime" ? hanimeData : animeData;
    const shuffledRawData = [...sourceData].sort(() => 0.5 - Math.random());

    // --- BƯỚC 1: QUÉT DATA ĐỂ TÌM CARD PHÙ HỢP (MATCH 1-3 Ô) ---
    for (const anime of shuffledRawData) {
      const matchedIds = [];
      grid.forEach((cell) => {
        if (checkMatch(anime, cell)) {
          // Chỉ tính là match nếu ô này chưa có quá 3 card
          if (tempDistributionCount[cell.id] < 3) {
            matchedIds.push(cell.id);
          }
        }
      });

      if (matchedIds.length > 0 && matchedIds.length <= 3) {
        if (matchedAnimes.length < targetMatched) {
          matchedIds.forEach((id) => tempDistributionCount[id]++);
          matchedAnimes.push({ ...anime, matchedCellIds: matchedIds });
          usedIds.add(anime.id);
        }
      } else if (
        matchedIds.length === 0 &&
        unMatchedAnimes.length < targetUnmatched
      ) {
        unMatchedAnimes.push({ ...anime, matchedCellIds: [] });
        usedIds.add(anime.id);
      }

      // Thoát vòng lặp khi đã đủ số lượng mục tiêu theo goal
      if (
        matchedAnimes.length === targetMatched &&
        unMatchedAnimes.length === targetUnmatched
      )
        break;
    }

    // --- BƯỚC 2: BỐC BÙ NẾU CHƯA ĐỦ CARD THEO GOAL ---
    let currentDeck = [...matchedAnimes, ...unMatchedAnimes];

    if (currentDeck.length < totalCards) {
      for (const anime of shuffledRawData) {
        if (currentDeck.length >= totalCards) break;
        if (!usedIds.has(anime.id)) {
          const extraMatchedIds = [];
          grid.forEach((cell) => {
            if (checkMatch(anime, cell)) extraMatchedIds.push(cell.id);
          });
          currentDeck.push({ ...anime, matchedCellIds: extraMatchedIds });
          usedIds.add(anime.id);
        }
      }
    }

    // --- BƯỚC 3: SHUFFLE CUỐI CÙNG VÀ TẠO DEBUG DISTRIBUTION ---
    const shuffledDeck = currentDeck.sort(() => 0.5 - Math.random());

    const debugDistribution = {};
    grid.forEach((cell) => {
      debugDistribution[cell.id] = [];
    });

    shuffledDeck.forEach((card, index) => {
      if (card.matchedCellIds && card.matchedCellIds.length > 0) {
        card.matchedCellIds.forEach((cellId) => {
          debugDistribution[cellId].push(index);
        });
      }
    });

    return NextResponse.json({
      success: true,
      deck: shuffledDeck,
      total: shuffledDeck.length,
      debug_distribution: debugDistribution,
    });
  } catch (error) {
    console.error("Lỗi API Deck:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
