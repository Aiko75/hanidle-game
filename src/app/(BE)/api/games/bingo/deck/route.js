import { NextResponse } from "next/server";
import animeData from "@/../public/data/ihentai_all.json";

// Hàm check logic (Giống hệt FE)
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
    const { grid } = await request.json(); // Nhận 16 ô từ FE

    const matchedAnimes = []; // Chứa các bộ thỏa mãn 1-3 điều kiện
    const unMatchedAnimes = []; // Chứa các bộ không thỏa mãn (hoặc rất ít)

    // 1. Phân loại Anime
    animeData.forEach((anime) => {
      // Đếm xem anime này thỏa mãn bao nhiêu ô trong grid
      let matchCount = 0;
      grid.forEach((cell) => {
        if (checkMatch(anime, cell)) matchCount++;
      });

      if (matchCount >= 1 && matchCount <= 3) {
        matchedAnimes.push(anime);
      } else if (matchCount === 0) {
        unMatchedAnimes.push(anime);
      }
    });

    // 2. Chọn lọc (Sampling)
    // Cần 35 bộ trúng + 15 bộ trượt = 50 bộ
    const shuffle = (arr) => arr.sort(() => 0.5 - Math.random());

    const finalDeck = [
      ...shuffle(matchedAnimes).slice(0, 35),
      ...shuffle(unMatchedAnimes).slice(0, 15),
    ];

    // Shuffle lần cuối để trộn lẫn đúng sai
    const shuffledDeck = shuffle(finalDeck);

    return NextResponse.json({
      success: true,
      deck: shuffledDeck,
      total: shuffledDeck.length,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
