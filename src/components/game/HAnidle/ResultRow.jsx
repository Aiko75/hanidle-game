import InfoBox from "./InfoBox";

export default function ResultRow({ guess, target }) {
  // --- LOGIC HÀNG KẾT QUẢ ---
  // 1. Studio
  const guessStudio = guess.studios?.[0];
  const targetStudio = target.studios?.[0];
  const isStudioCorrect = guessStudio?.id === targetStudio?.id;

  // 2. Năm (Xử lý mũi tên)
  const guessYear = parseInt(guess.releaseYear?.name || "0");
  const targetYear = parseInt(target.releaseYear?.name || "0");
  const isYearCorrect = guessYear === targetYear;
  let yearArrow = null;
  if (!isYearCorrect) {
    yearArrow = guessYear < targetYear ? "↑" : "↓"; // Nếu đoán thấp hơn thì mũi tên lên (cần tăng)
  }

  // 3. Views (Xử lý mũi tên)
  const isViewCorrect = guess.views === target.views;
  let viewArrow = null;
  if (!isViewCorrect) {
    viewArrow = guess.views < target.views ? "↑" : "↓";
  }

  // 4. Censorship
  const isCensorCorrect = guess.censorship === target.censorship;

  // 5. Title
  const isTitleCorrect = guess.id === target.id;

  // 6. View
  const formatViewCount = (num) => {
    if (!num) return "0";

    // Sử dụng chuẩn formatter của JS
    return new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 1, // Chỉ lấy 1 số thập phân (vd: 3.6m thay vì 3.62m)
    }).format(num);
  };

  return (
    <div className="bg-zinc-800 rounded-lg p-4 md:p-0 md:bg-transparent flex flex-col md:grid md:grid-cols-7 gap-2 animate-in fade-in slide-in-from-top-4 duration-500">
      {/* Cột 1: Info (Chiếm 3 cột để hiển thị đủ tags) */}
      <div
        className={`col-span-3 relative group rounded-md overflow-hidden flex p-2 md:h-auto border-2 ${
          isTitleCorrect ? "border-green-500" : "border-zinc-700"
        }`}
      >
        <div className="flex gap-3 w-full">
          <img
            src={guess.thumbnail}
            alt="thumb"
            className="w-20 h-28 object-cover rounded shadow-md shrink-0"
          />
          <div className="flex flex-col w-full">
            <p
              className="font-bold text-sm line-clamp-2 text-black"
              title={guess.title}
            >
              {guess.title}
            </p>
            {/* Logic Genres: Hiển thị TOÀN BỘ tag */}
            <div className="flex flex-wrap gap-1 mt-2 content-start">
              {guess.genres.map((g) => {
                const isGenreMatch = target.genres.some((tg) => tg.id === g.id);
                return (
                  <span
                    key={g.id}
                    className={`text-[10px] px-1.5 py-0.5 rounded border ${
                      isGenreMatch
                        ? "bg-green-600/90 border-green-500 text-white"
                        : "bg-zinc-700/50 border-zinc-600 text-zinc-400"
                    }`}
                  >
                    {g.name}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Cột 2: Studio */}
      <InfoBox
        label="Studio"
        value={guessStudio?.name || "N/A"}
        isCorrect={isStudioCorrect}
      />

      {/* Cột 3: Năm (Có mũi tên) */}
      <InfoBox
        label="Năm"
        value={guess.releaseYear?.name || "N/A"}
        isCorrect={isYearCorrect}
        arrow={yearArrow}
      />

      {/* Cột 4: Views (Có mũi tên) */}
      <InfoBox
        label="Views"
        value={formatViewCount(guess.views)}
        isCorrect={isViewCorrect}
        arrow={viewArrow}
      />

      {/* Cột 5: Censorship */}
      <InfoBox
        label="Censorship"
        value={guess.censorship}
        isCorrect={isCensorCorrect}
        className="capitalize"
      />
    </div>
  );
}
