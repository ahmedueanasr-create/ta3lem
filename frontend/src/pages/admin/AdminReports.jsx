import { useEffect, useState } from 'react';
import api from '../../lib/api';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import StatCard from '../../components/dashboard/StatCard';

export default function AdminReports() {
  const [stats, setStats] = useState(null);
  const [revenue, setRevenue] = useState([]);
  const [topSubjects, setTopSubjects] = useState([]);

  useEffect(() => {
    api.get('/reports/platform').then((r) => setStats(r.data.data));
    api.get('/reports/revenue').then((r) => setRevenue(r.data.data));
    api.get('/reports/top-subjects').then((r) => setTopSubjects(r.data.data));
  }, []);

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold">التقارير والإحصائيات</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="المستخدمون" value={stats?.users ?? '—'} icon="👥" />
        <StatCard label="المدرسون" value={stats?.teachers ?? '—'} icon="🧑‍🏫" color="purple" />
        <StatCard label="الطلاب" value={stats?.students ?? '—'} icon="🎓" color="green" />
        <StatCard label="الحصص" value={stats?.sessions ?? '—'} icon="🎥" color="amber" />
        <StatCard label="إجمالي الشحن" value={stats?.totalCharged ?? '—'} icon="💰" color="green" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 text-lg font-bold">الإيرادات حسب السبب</h2>
          <div className="space-y-3">
            {revenue.length === 0 && <p className="text-slate-400">لا توجد بيانات</p>}
            {revenue.map((r, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm">{r.reason || 'غير محدد'}</span>
                <span className="font-bold text-green-600">{Number(r.total).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 text-lg font-bold">أكثر المواد نشاطاً</h2>
          <div className="space-y-3">
            {topSubjects.length === 0 && <p className="text-slate-400">لا توجد بيانات</p>}
            {topSubjects.map((s, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm">{s.subject?.name || '—'}</span>
                <span className="font-bold">{s.sessions} حصة</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
