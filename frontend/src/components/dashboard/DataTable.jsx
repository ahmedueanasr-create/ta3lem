export default function DataTable({ columns, data, loading, emptyText = 'لا توجد بيانات' }) {
  if (loading) return <div className="py-10 text-center text-slate-400">جارٍ التحميل...</div>;
  if (!data || data.length === 0)
    return <div className="py-10 text-center text-slate-400">{emptyText}</div>;
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 dark:bg-slate-800">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className="whitespace-nowrap p-3 text-right font-semibold">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={row.id || i} className="border-t border-slate-100 dark:border-slate-800">
              {columns.map((c) => (
                <td key={c.key} className="whitespace-nowrap p-3">
                  {c.render ? c.render(row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
