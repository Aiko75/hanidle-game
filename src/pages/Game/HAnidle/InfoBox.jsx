// Component ô thông tin (Đã update để nhận prop arrow)
export default function InfoBox({
  label,
  value,
  isCorrect,
  arrow,
  className = "",
}) {
  return (
    <div
      className={`
        flex flex-col justify-center items-center p-2 rounded-md border text-center h-full min-h-[60px] relative
        ${
          isCorrect
            ? "bg-green-600 border-green-500 text-white"
            : "bg-zinc-800 border-zinc-700 text-gray-300"
          /* Nếu sai thì để màu tối cho đỡ rối mắt, hoặc để red tùy bạn */
        }
        ${!isCorrect && arrow ? "border-red-500/50" : ""} 
        transition-colors duration-300
      `}
    >
      <span className="md:hidden text-[10px] opacity-70 mb-1">{label}</span>

      <div className="flex flex-col items-center">
        <span
          className={`font-semibold text-sm md:text-base shadow-sm ${className}`}
        >
          {value}
        </span>

        {/* Mũi tên chỉ dẫn */}
        {arrow && !isCorrect && (
          <span className="text-xl font-bold text-yellow-400 animate-pulse mt-1">
            {arrow}
          </span>
        )}
      </div>

      {/* Background hint màu đỏ mờ nếu sai hoàn toàn */}
      {!isCorrect && !arrow && (
        <div className="absolute inset-0 bg-red-500/10 rounded-md pointer-events-none"></div>
      )}
    </div>
  );
}
