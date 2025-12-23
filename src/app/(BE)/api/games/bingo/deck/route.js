import { NextResponse } from "next/server";
import animeData from "@/../public/data/ihentai_all.json";

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
    const { grid } = await request.json();

    const matchedAnimes = [];
    const unMatchedAnimes = [];
    const usedIds = new Set();

    // Tạo bộ đếm tạm thời để giới hạn mỗi ô tối đa 3 card phù hợp
    const tempDistributionCount = Array(16).fill(0);

    const shuffledRawData = [...animeData].sort(() => 0.5 - Math.random());

    // --- BƯỚC 1: QUÉT DATA ĐỂ TÌM CARD PHÙ HỢP (MATCH 1-3 Ô) ---
    for (const anime of shuffledRawData) {
      const matchedIds = [];
      grid.forEach((cell) => {
        if (checkMatch(anime, cell)) {
          // Chỉ tính là match nếu ô này chưa có quá 3 card trong danh sách matchedAnimes
          if (tempDistributionCount[cell.id] < 3) {
            matchedIds.push(cell.id);
          }
        }
      });

      if (matchedIds.length > 0 && matchedIds.length <= 3) {
        if (matchedAnimes.length < 35) {
          matchedIds.forEach((id) => tempDistributionCount[id]++);
          matchedAnimes.push({ ...anime, matchedCellIds: matchedIds });
          usedIds.add(anime.id);
        }
      } else if (matchedIds.length === 0 && unMatchedAnimes.length < 15) {
        unMatchedAnimes.push({ ...anime, matchedCellIds: [] });
        usedIds.add(anime.id);
      }

      if (matchedAnimes.length === 35 && unMatchedAnimes.length === 15) break;
    }

    // --- BƯỚC 2: BỐC BÙ NẾU CHƯA ĐỦ 50 CARD ---
    let currentDeck = [...matchedAnimes, ...unMatchedAnimes];

    if (currentDeck.length < 50) {
      for (const anime of shuffledRawData) {
        if (currentDeck.length >= 50) break;
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
    // Trộn bộ bài lần cuối
    const shuffledDeck = currentDeck.sort(() => 0.5 - Math.random());

    // Khởi tạo object debug: { cellId: [vị trí index trong deck] }
    const debugDistribution = {};
    grid.forEach((cell) => {
      debugDistribution[cell.id] = [];
    });

    // Duyệt qua deck đã trộn để lấy vị trí (index)
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
    console.error(error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
