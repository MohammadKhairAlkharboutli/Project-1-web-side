import { boxBase } from "../SurfaceStyles";

const DataTable = ({
  columns,
  data,
  onRowClick,
  toolbar,
  globalFilter,
  setGlobalFilter,
}) => {
  return (
    <div className="space-y-4">
      {/* شريط الأدوات (البحث والفلاتر) */}
      {typeof toolbar === "function"
        ? toolbar({ globalFilter, setGlobalFilter })
        : toolbar}

      <div className={`overflow-hidden bg-transparent ${boxBase}`}>
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-y-3.5 text-left text-sm">
            {/* الهيدر العلوي النظيف بدون حدود */}
            <thead>
              <tr className="text-xs uppercase tracking-wider text-slate-400 font-extrabold">
                {columns.map((column, index) => (
                  <th
                    key={column.accessorKey || column.id || index}
                    className="whitespace-nowrap px-6 py-2 font-extrabold text-slate-400"
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>

            {/* صفوف الجدول بتصميم كاردات منفصلة ناعمة وفاخرة */}
            <tbody>
              {data && data.length > 0 ? (
                data.map((row, rowIndex) => (
                  <tr
                    key={row.id || rowIndex}
                    onClick={() => onRowClick?.(row)}
                    className={`transition-all duration-300 bg-white hover:bg-blue-50/30 shadow-[0_4px_25px_-5px_rgba(30,136,229,0.07)] border border-blue-100/80 hover:border-blue-200 group ${
                      onRowClick ? "cursor-pointer" : ""
                    }`}
                  >
                    {columns.map((column, colIndex) => {
                      const cellValue = column.cell
                        ? column.cell({ row: { original: row } })
                        : column.render
                        ? column.render(row)
                        : row[column.accessorKey || column.key];

                      return (
                        <td
                          key={column.accessorKey || column.id || colIndex}
                          className={`whitespace-nowrap px-6 py-4.5 text-slate-700 font-medium ${
                            colIndex === 0 ? "rounded-l-[22px]" : ""
                          } ${
                            colIndex === columns.length - 1
                              ? "rounded-r-[22px]"
                              : ""
                          }`}
                        >
                          {cellValue}
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="text-center py-10 text-slate-400 font-medium bg-white/80 rounded-[22px] border border-blue-100/60 shadow-sm"
                  >
                    No appointments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DataTable;