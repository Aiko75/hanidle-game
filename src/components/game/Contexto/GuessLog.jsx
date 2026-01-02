"use client";

export default function GuessLog({ guesses }) {
  // Hàm tính màu dựa trên Rank (Rank 1 là xanh lá, Rank cao là đỏ)
  const getColor = (rank) => {
    if (rank === 1) return "bg-success"; // Win
    if (rank <= 10) return "bg-warning"; // Rất gần
    if (rank <= 100) return "bg-warning bg-opacity-75"; // Gần
    return "bg-danger"; // Xa
  };

  // Hàm tính độ rộng thanh bar (Rank càng nhỏ thanh càng dài)
  // Giả sử rank tối đa là 3000
  const getWidth = (rank) => {
    const maxRank = 3000;
    const percentage = Math.max(5, ((maxRank - rank) / maxRank) * 100);
    return `${percentage}%`;
  };

  return (
    <div
      className="w-100 mt-4 d-flex flex-column gap-2"
      style={{ maxWidth: "600px" }}
    >
      {guesses.map((guess, index) => (
        <div
          key={index}
          className="card border-0 shadow-sm overflow-hidden"
          style={{ background: "rgba(255,255,255,0.9)" }}
        >
          <div
            className="position-relative p-3 d-flex justify-content-between align-items-center"
            style={{ zIndex: 1 }}
          >
            <span className="fw-bold text-dark text-truncate me-2">
              {guess.title}
            </span>
            <span
              className={`badge ${
                guess.rank === 1 ? "bg-success" : "bg-secondary"
              }`}
            >
              #{guess.rank}
            </span>
          </div>

          {/* Thanh màu nền thể hiện độ gần */}
          <div
            className={`position-absolute top-0 start-0 h-100 ${getColor(
              guess.rank
            )}`}
            style={{
              width: getWidth(guess.rank),
              opacity: 0.3,
              transition: "width 1s ease",
            }}
          ></div>
        </div>
      ))}
    </div>
  );
}
