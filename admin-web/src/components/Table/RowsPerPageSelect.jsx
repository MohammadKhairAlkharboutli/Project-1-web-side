const RowsPerPageSelect = ({
  value,
  onChange,
  options = [5, 10, 25],
}) => {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-600">
      <span>Rows:</span>

      <select
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-[var(--color-primary)]"
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