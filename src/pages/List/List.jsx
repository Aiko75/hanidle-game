import data from "@/../public/data/ihentai_all.json";

export default function HAnimeList() {
  const NUMBER_OF_HANIME = data.length;
  return (
    <div className="min-h-screen w-full bg-zinc-50 dark:bg-black flex justify-center py-10">
      <main className="w-full max-w-5xl px-4 sm:px-10">
        <h1 className="text-3xl font-semibold text-black dark:text-white mb-6">
          Những bộ HAnime ra mắt gần đây
        </h1>
        <h1 className="text-xl font-semibold text-black dark:text-white mb-6">
          Số lượng: {NUMBER_OF_HANIME}
        </h1>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {data.map((item, index) => (
            <a
              key={index}
              href={item.url}
              target="_blank"
              className="bg-white dark:bg-zinc-900 rounded-lg shadow hover:scale-[1.03] transition p-2"
            >
              {/* Cover */}
              <div className="relative w-full aspect-3/4 overflow-hidden rounded-md">
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Title */}
              <p className="text-sm text-black dark:text-zinc-200 mt-2 line-clamp-2 text-center">
                {item.title}
              </p>

              {/* Views */}
              <p className="text-sm text-black dark:text-zinc-200 line-clamp-2 text-center">
                Views: {item.views}
              </p>

              {/* Release Year */}
              <p className="text-sm text-black dark:text-zinc-200 line-clamp-2 text-center">
                Release Year: {item.releaseYear?.name}
              </p>

              {/* Genres */}
              {item.genres?.length > 0 && (
                <div className="flex flex-wrap justify-center gap-1 mt-2">
                  {item.genres.map((g, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-2px rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                    >
                      {g.name}
                    </span>
                  ))}
                </div>
              )}
            </a>
          ))}
        </div>
      </main>
    </div>
  );
}
