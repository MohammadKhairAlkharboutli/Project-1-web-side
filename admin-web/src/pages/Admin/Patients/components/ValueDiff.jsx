const EMPTY_VALUE = "Not specified";

function formatStringValue(value) {
  if (!value) {
    return EMPTY_VALUE;
  }

  if (/^[A-Z0-9_]+$/.test(value) && value.includes("_")) {
    return value
      .toLowerCase()
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }

  return value;
}

function formatUnknownValue(value) {
  if (value === null || value === undefined || value === "") {
    return EMPTY_VALUE;
  }

  if (typeof value === "string") {
    return formatStringValue(value);
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  try {
    return JSON.stringify(value);
  } catch {
    return EMPTY_VALUE;
  }
}

function ValueBlock({ label, value }) {
  const isArrayValue = Array.isArray(value);
  const values = isArrayValue ? value.filter(Boolean) : [];

  return (
    <div className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      {isArrayValue && values.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {values.map((item) => (
            <span
              key={item}
              className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700"
            >
              {formatUnknownValue(item)}
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-2 break-words text-sm font-medium text-slate-800">
          {isArrayValue ? EMPTY_VALUE : formatUnknownValue(value)}
        </p>
      )}
    </div>
  );
}

export default function ValueDiff({ oldValue, newValue }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <ValueBlock label="Before" value={oldValue} />
      <ValueBlock label="After" value={newValue} />
    </div>
  );
}
