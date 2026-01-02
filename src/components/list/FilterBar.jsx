"use client";

export default function FilterBar({
  filters,
  options, // { genres: [], studios: [] }
  loading, // Có thể dùng để hiện skeleton hoặc disabled state
  onUpdate,
  onReset,
}) {
  // Helper để thêm "All" vào đầu danh sách nếu chưa có
  const getOptionsWithAll = (list) => {
    if (!list) return ["All"];
    return ["All", ...list];
  };

  return (
    <div className="p-6 mb-8 space-y-4 bg-white shadow-sm rounded-xl">
      {/* Hàng 1: Dropdown cơ bản (Thêm TAG) */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Genre Select */}
        <FilterSelect
          label="Thể loại"
          value={filters.genre}
          onChange={(val) => onUpdate("genre", val)}
          options={getOptionsWithAll(options?.genres)}
          disabled={loading}
        />

        {/* Studio Select */}
        <FilterSelect
          label="Studio"
          value={filters.studio}
          onChange={(val) => onUpdate("studio", val)}
          options={getOptionsWithAll(options?.studios)}
          disabled={loading}
        />

        {/* Sort Select */}
        <div className="flex flex-col flex-1 gap-1">
          <label className="text-xs font-bold uppercase text-zinc-500">
            Sắp xếp
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => onUpdate("sortBy", e.target.value)}
            className="w-full p-2 text-black border rounded-lg outline-none border-zinc-200 bg-zinc-100 focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">Năm (Mới nhất)</option>
            <option value="oldest">Năm (Cũ nhất)</option>
            <option value="most_viewed">Views (Cao nhất)</option>
            <option value="least_viewed">Views (Thấp nhất)</option>
          </select>
        </div>
      </div>

      <hr className="border-zinc-200" />

      {/* Hàng 2: Range Filters */}
      <div className="flex flex-col gap-6 md:flex-row">
        <RangeInput
          label="Năm phát hành"
          minVal={filters.minYear}
          maxVal={filters.maxYear}
          onMinChange={(val) => onUpdate("minYear", val)}
          onMaxChange={(val) => onUpdate("maxYear", val)}
          placeholderMin="Từ (2000)"
          placeholderMax="Đến (2025)"
        />

        <RangeInput
          label="Lượt xem"
          minVal={filters.minView}
          maxVal={filters.maxView}
          onMinChange={(val) => onUpdate("minView", val)}
          onMaxChange={(val) => onUpdate("maxView", val)}
          placeholderMin="Min View"
          placeholderMax="Max View"
        />

        {/* Reset Button */}
        <div className="flex items-end">
          <button
            onClick={onReset}
            className="w-full px-6 py-2 text-sm font-semibold text-white transition bg-red-500 rounded-lg hover:bg-red-600 h-[38px] md:w-auto"
          >
            Reset All
          </button>
        </div>
      </div>
    </div>
  );
}

// Sub-component (Thêm prop disabled)
function FilterSelect({ label, value, onChange, options, disabled }) {
  return (
    <div className="flex flex-col flex-1 gap-1">
      <label className="text-xs font-bold uppercase text-zinc-500">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full p-2 text-black border rounded-lg outline-none border-zinc-200 bg-zinc-100 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

function RangeInput({
  label,
  minVal,
  maxVal,
  onMinChange,
  onMaxChange,
  placeholderMin,
  placeholderMax,
}) {
  return (
    <div className="flex-1">
      <label className="block mb-1 text-xs font-bold uppercase text-zinc-500">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          placeholder={placeholderMin}
          value={minVal}
          onChange={(e) => onMinChange(e.target.value)}
          className="w-full p-2 text-sm text-black border rounded-lg border-zinc-200 bg-zinc-100"
        />
        <span className="text-zinc-400">-</span>
        <input
          type="number"
          placeholder={placeholderMax}
          value={maxVal}
          onChange={(e) => onMaxChange(e.target.value)}
          className="w-full p-2 text-sm text-black border rounded-lg border-zinc-200 bg-zinc-100"
        />
      </div>
    </div>
  );
}
