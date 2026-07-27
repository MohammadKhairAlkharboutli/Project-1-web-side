const Pagination = ({
  currentPage,
  totalPages,
  onPrevious,
  onNext,
}) => {
  return (
    <div className="flex items-center justify-between border-t border-blue-100/60 bg-white/60 px-6 py-4 text-sm rounded-b-[28px]">
      <button
        type="button"
        onClick={onPrevious}
        disabled={currentPage === 1}
        className="rounded-2xl border border-blue-100 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition-all hover:bg-blue-50/50 hover:border-blue-200 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Previous
      </button>

      <span className="text-xs text-slate-500 font-medium">
        Page{" "}
        <span className="font-bold text-[#1E88E5]">{currentPage}</span>
        {" "}of{" "}
        <span className="font-bold text-slate-800">{totalPages}</span>
      </span>

      <button
        type="button"
        onClick={onNext}
        disabled={currentPage === totalPages}
        className="rounded-2xl border border-blue-100 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition-all hover:bg-blue-50/50 hover:border-blue-200 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;