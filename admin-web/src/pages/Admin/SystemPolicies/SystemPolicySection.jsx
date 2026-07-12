import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";

export default function SystemPolicySection({
  section,
  values,
  savedValues,
  onChange,
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-50/80 px-5 py-4">
        <h2 className="text-base font-semibold text-slate-900">
          {section.title}
        </h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          {section.description}
        </p>
      </div>

      <div className="divide-y divide-slate-200">
        {section.fields.map((field) => (
          <SystemPolicyField
            key={field.key}
            field={field}
            value={values[field.key]}
            savedValue={savedValues[field.key]}
            onChange={(value) => onChange(field.key, value)}
          />
        ))}
      </div>
    </section>
  );
}

function SystemPolicyField({ field, value, savedValue, onChange }) {
  const isChanged = Number(value) !== Number(savedValue);

  return (
    <div className="grid gap-4 px-5 py-4 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-center">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-semibold text-slate-900">
            {field.label}
          </h3>
          {isChanged && (
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
              Edited
            </span>
          )}
        </div>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          {field.description}
        </p>
        <p className="mt-1 text-xs text-slate-400">{field.hint}</p>
      </div>

      <div className="flex items-center gap-2 lg:justify-end">
        <NativeSelect
          className="w-32"
          value={String(value)}
          onChange={(event) => onChange(Number(event.target.value))}
        >
          {field.options.map((option) => (
            <NativeSelectOption key={option} value={String(option)}>
              {option}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        <span className="min-w-16 text-sm text-slate-500">{field.unit}</span>
      </div>
    </div>
  );
}
