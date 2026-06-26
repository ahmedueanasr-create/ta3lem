export default function StatCard({ label, value, icon, color = 'brand' }) {
  const colors = {
    brand: 'bg-brand-50 text-brand-700 dark:bg-brand-700/20 dark:text-brand-300',
    green: 'bg-green-50 text-green-700 dark:bg-green-700/20 dark:text-green-300',
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-700/20 dark:text-amber-300',
    red: 'bg-red-50 text-red-700 dark:bg-red-700/20 dark:text-red-300',
    purple: 'bg-purple-50 text-purple-700 dark:bg-purple-700/20 dark:text-purple-300',
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-1 text-2xl font-bold">{value}</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl ${colors[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
