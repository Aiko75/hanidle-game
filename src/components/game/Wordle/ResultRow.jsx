import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import InfoBox from "./InfoBox";

export default function ResultRow({ guess, target }) {
  const [mode, setMode] = useState("anime");

  useEffect(() => {
    const currentMode = Cookies.get("app_mode") || "anime";
    setMode(currentMode);
  }, []);

  const {
    isStudioCorrect,
    yearStatus,
    viewStatus,
    isCensorCorrect, // Flag mới
  } = guess.result || {};

  const yearArrow =
    yearStatus === "higher" ? "↑" : yearStatus === "lower" ? "↓" : null;
  const viewArrow =
    viewStatus === "higher" ? "↑" : viewStatus === "lower" ? "↓" : null;

  const formatViewCount = (num) => {
    if (!num) return "0";
    return new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(num);
  };

  const getFirstStudioName = (studios) => {
    if (!studios || studios.length === 0) return "N/A";
    const first = studios[0];
    return typeof first === "object" ? first.name : first;
  };

  const renderGenres = () => {
    const genres = guess.genres || [];
    const matching = guess.result?.matchingGenres || [];
    return genres.map((g, idx) => {
      const name = typeof g === "object" ? g.name : g;
      const isMatch = matching.includes(name);
      return (
        <span
          key={idx}
          className={`text-[10px] px-1.5 py-0.5 rounded border ${
            isMatch
              ? "bg-green-600/90 border-green-500 text-white"
              : "bg-zinc-700/50 border-zinc-600 text-zinc-400"
          }`}
        >
          {name}
        </span>
      );
    });
  };

  return (
    <div
      className={`flex flex-col gap-2 p-4 duration-500 rounded-lg bg-zinc-800 md:p-0 md:bg-transparent md:grid animate-in fade-in slide-in-from-top-4 ${
        mode === "hanime" ? "md:grid-cols-7" : "md:grid-cols-6"
      }`}
    >
      {/* Cột 1: Info */}
      <div
        className={`col-span-3 relative group rounded-md overflow-hidden flex p-2 md:h-auto border-2 ${
          guess.id === target.id ? "border-green-500" : "border-zinc-700"
        }`}
      >
        <div className="flex w-full gap-3">
          <img
            src={guess.thumbnail}
            alt="thumb"
            className="object-cover w-20 rounded shadow-md h-28 shrink-0"
          />
          <div className="flex flex-col w-full">
            <p
              className="text-sm font-bold text-black line-clamp-2"
              title={guess.title}
            >
              {guess.title}
            </p>
            <div className="flex flex-wrap content-start gap-1 mt-2">
              {renderGenres()}
            </div>
          </div>
        </div>
      </div>

      <InfoBox
        label="Studio"
        value={getFirstStudioName(guess.studios)}
        isCorrect={isStudioCorrect}
      />
      <InfoBox
        label="Năm"
        value={guess.release_year || "N/A"}
        isCorrect={yearStatus === "correct"}
        arrow={yearArrow}
      />
      <InfoBox
        label="Views"
        value={formatViewCount(guess.views)}
        isCorrect={viewStatus === "correct"}
        arrow={viewArrow}
      />

      {/* Cột 5: Censorship - Lấy từ root level vì API đã map nó ra */}
      {mode === "hanime" && (
        <InfoBox
          label="Censorship"
          value={guess.censorship || "N/A"} // Giá trị này đã được API lấy từ raw_data->>'censorship'
          isCorrect={isCensorCorrect}
          className="capitalize"
        />
      )}
    </div>
  );
}
