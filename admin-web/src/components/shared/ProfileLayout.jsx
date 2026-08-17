export default function ProfileLayout({ header, nav, children }) {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <div className="rounded-lg border border-slate-200 bg-card px-6 py-5 shadow-surface sm:px-8 sm:py-6">
        {header}
      </div>

      <div className="rounded-lg border border-slate-200 bg-card p-1 shadow-surface">
        <div className="overflow-x-auto">{nav}</div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-card p-6 shadow-surface sm:p-8">
        {children}
      </div>
    </section>
  );
}
