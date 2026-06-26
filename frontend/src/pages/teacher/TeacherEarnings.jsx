import { useEffect, useState } from 'react';
import api from '../../lib/api';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import StatCard from '../../components/dashboard/StatCard';

export default function TeacherEarnings() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/auth/me').then((r) => {
      api.get(`/reports/teacher/${r.data.data.id}`).then((rr) => setData(rr.data.data));
    });
  }, []);

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold">أرباحي</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="إجمالي الحصص" value={data?.totalSessions ?? '—'} icon="🎥" color="brand" />
        <StatCard label="إجمالي الطلاب" value={data?.totalStudents ?? '—'} icon="🎓" color="green" />
        <StatCard label="إجمالي الأرباح" value={`${data?.earnings ?? '—'} ج.م`} icon="💰" color="amber" />
      </div>
      <div className="mt-8 rounded-2xl border border-slate-200 p-6 dark:border-slate-800 dark:bg-slate-900">
        <p className="text-slate-500">تفاصيل أكثر قريباً مع تقارير يومية وشهرية مفصلة.</p>
      </div>
    </DashboardLayout>
  );
}
