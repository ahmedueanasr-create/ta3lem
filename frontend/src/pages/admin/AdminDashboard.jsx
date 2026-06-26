import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import StatCard from '../../components/dashboard/StatCard';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [topSubjects, setTopSubjects] = useState([]);
  const [pendingTeachers, setPendingTeachers] = useState(0);
  const [revenueBreakdown, setRevenueBreakdown] = useState([]);

  useEffect(() => {
    api.get('/reports/platform').then((r) => setStats(r.data.data)).catch(() => {});
    api.get('/reports/top-subjects').then((r) => setTopSubjects(r.data.data)).catch(() => {});
    api.get('/teachers').then((r) => {
      const pending = (r.data.data || []).filter(t => t.status === 'pending').length;
      setPendingTeachers(pending);
    }).catch(() => {});
    api.get('/reports/revenue').then((r) => setRevenueBreakdown(r.data.data || [])).catch(() => {});
  }, []);

  const maxRevenue = Math.max(...(revenueBreakdown.map(r => r.amount || 0)), 1);

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold">لوحة التحكم</h1>
      <p className="mt-1 text-slate-500">إحصائيات عامة للمنصة</p>

      {pendingTeachers > 0 && (
        <Link to="/admin/teachers" className="mt-4 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
          <span className="text-xl">⚠️</span>
          <span className="flex-1">المدرسون بانتظار الاعتماد</span>
          <span className="rounded-full bg-amber-500 px-2.5 py-0.5 text-sm font-bold text-white">{pendingTeachers}</span>
        </Link>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="المستخدمون" value={stats?.users ?? '—'} icon="👥" color="brand" />
        <StatCard label="المدرسون" value={stats?.teachers ?? '—'} icon="🧑‍🏫" color="purple" />
        <StatCard label="الطلاب" value={stats?.students ?? '—'} icon="🎓" color="green" />
        <StatCard label="الحصص" value={stats?.sessions ?? '—'} icon="🎥" color="amber" />
        <StatCard label="إجمالي الشحن" value={stats?.totalCharged ?? '—'} icon="💰" color="green" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 text-lg font-bold">توزيع الإيرادات</h2>
          {revenueBreakdown.length === 0 && <p className="text-slate-400">لا توجد بيانات</p>}
          <div className="space-y-3">
            {revenueBreakdown.map((r, i) => (
              <div key={i}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{r.reason || r._id || '—'}</span>
                  <span className="font-medium">{(r.amount || 0).toLocaleString('ar-EG')}</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-3 rounded-full bg-brand-500"
                    style={{ width: `${Math.min(100, ((r.amount || 0) / maxRevenue) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 text-lg font-bold">أكثر المواد نشاطاً</h2>
          <div className="space-y-3">
            {topSubjects.length === 0 && <p className="text-slate-400">لا توجد بيانات</p>}
            {topSubjects.map((s, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="w-6 text-slate-400">{i + 1}</span>
                <span className="flex-1 font-medium">{s.subject?.name || '—'}</span>
                <div className="flex-1">
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-2 rounded-full bg-brand-500"
                      style={{ width: `${Math.min(100, (s.sessions / (topSubjects[0]?.sessions || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
                <span className="w-12 text-left text-sm text-slate-500">{s.sessions}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-lg font-bold">إجراءات سريعة</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link to="/admin/users" className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 p-4 text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
            إدارة المستخدمين
          </Link>
          <Link to="/admin/subjects" className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 p-4 text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
            إدارة المواد
          </Link>
          <Link to="/admin/sessions" className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 p-4 text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
            إدارة الحصص
          </Link>
          <Link to="/admin/reports" className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 p-4 text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
            التقارير
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
