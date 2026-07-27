const RowsPerPageSelect = ({
  value,
  onChange,
  options = [5, 10, 25],
}) => {
  return (
    <div className="flex items-center gap-2.5 text-xs text-slate-500 font-medium">
      <span>Rows per page:</span>

      <select
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-9 rounded-2xl border border-blue-100 bg-white px-3 text-xs text-slate-700 font-bold shadow-sm outline-none transition-all focus:border-[#1E88E5] focus:ring-2 focus:ring-[#1E88E5]/20 cursor-pointer"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

export default RowsPerPageSelect;