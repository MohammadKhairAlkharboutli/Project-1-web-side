export default function ProfileLayout({ header, nav, children }) {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <div className="rounded-3xl border border-slate-200 bg-white px-6 py-5 shadow-sm sm:px-8 sm:py-6">
        {header}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
        <div className="overflow-x-auto">{nav}</div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        {children}
      </div>
    </section>
  );
}
