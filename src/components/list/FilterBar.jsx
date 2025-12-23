// src/components/HAnime/FilterBar.jsx
"use client";

export default function FilterBar({
  filters, // Object chứa toàn bộ giá trị state (filterGenre, minYear...)
  options, // Object chứa danh sách uniqueGenres, uniqueStudios
  onUpdate, // Hàm xử lý chung khi input thay đổi
  onReset, // Hàm reset
}) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm mb-8 space-y-4">
      {/* Hàng 1: Dropdown cơ bản */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Genre Select */}
        <FilterSelect
          label="Thể loại"
          value={filters.genre}
          onChange={(val) => onUpdate("genre", val)}
          options={options.genres}
        />

        {/* Studio Select */}
        <FilterSelect
          label="Studio"
          value={filters.studio}
          onChange={(val) => onUpdate("studio", val)}
          options={options.studios}
        />

        {/* Sort Select */}
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-xs font-bold uppercase text-zinc-500">
            Sắp xếp
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => onUpdate("sortBy", e.target.value)}
            className="w-full p-2 rounded-lg bg-zinc-100 text-black border border-zinc-200 outline-none focus:ring-2 focus:ring-blue-500"
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
      <div className="flex flex-col md:flex-row gap-6">
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
            className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition text-sm font-semibold h-[38px] w-full md:w-auto"
          >
            Reset All
          </button>
        </div>
      </div>
    </div>
  );
}

// Sub-component nhỏ để tái sử dụng trong FilterBar cho gọn
function FilterSelect({ label, value, onChange, options }) {
  return (
    <div className="flex flex-col gap-1 flex-1">
      <label className="text-xs font-bold uppercase text-zinc-500">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 rounded-lg bg-zinc-100 text-black border-zinc-200 outline-none focus:ring-2 focus:ring-blue-500"
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
      <label className="text-xs font-bold uppercase text-zinc-500 mb-1 block">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          placeholder={placeholderMin}
          value={minVal}
          onChange={(e) => onMinChange(e.target.value)}
          className="w-full p-2 rounded-lg bg-zinc-100 text-black border-zinc-200 text-sm"
        />
        <span className="text-zinc-400">-</span>
        <input
          type="number"
          placeholder={placeholderMax}
          value={maxVal}
          onChange={(e) => onMaxChange(e.target.value)}
          className="w-full p-2 rounded-lg bg-zinc-100 text-black border-zinc-200 text-sm"
        />
      </div>
    </div>
  );
}
