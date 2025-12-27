import { NextResponse } from "next/server";
import hanimeData from "@/../public/data/ihentai_all.json";
import animeData from "@/../public/data/anime_full.json";

function checkCondition(anime, attr) {
  if (!attr || !anime) return false;

  // JSON Structure: genres: [{name: '...'}, ...]
  if (attr.type === "Genre") {
    return anime.genres?.some((g) => g.name === attr.value);
  }

  // JSON Structure: studios: [{name: '...'}, ...]
  if (attr.type === "Studio") {
    return anime.studios?.some((s) => s.name === attr.value);
  }

  // JSON Structure: releaseYear: { name: '2018', ... }
  if (attr.type === "Year") {
    // Dùng == để an toàn nếu JSON là số mà attr là chuỗi hoặc ngược lại
    return anime.releaseYear?.name == attr.value;
  }

  return false;
}

export async function POST(request) {
  try {
    const { animeId, rowAttr, colAttr } = await request.json();
    const mode = request.headers.get("x-app-mode");
    const sourceData = mode === "hanime" ? hanimeData : animeData;

    // Tìm bộ anime theo ID
    const anime = sourceData.find((a) => a.id === animeId);

    if (!anime) {
      return NextResponse.json({ correct: false, message: "Anime not found" });
    }

    // Kiểm tra điều kiện Hàng và Cột
    const isRowCorrect = checkCondition(anime, rowAttr);
    const isColCorrect = checkCondition(anime, colAttr);

    if (isRowCorrect && isColCorrect) {
      return NextResponse.json({ correct: true, anime });
    } else {
      // Logic gợi ý lỗi sai (Optional)
      let message = "Sai rồi!";
      if (!isRowCorrect && !isColCorrect) message = "Sai cả 2 điều kiện!";
      else if (!isRowCorrect)
        message = `Bộ này không thuộc ${rowAttr.type}: ${rowAttr.value}`;
      else if (!isColCorrect)
        message = `Bộ này không thuộc ${colAttr.type}: ${colAttr.value}`;

      return NextResponse.json({ correct: false, message });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
