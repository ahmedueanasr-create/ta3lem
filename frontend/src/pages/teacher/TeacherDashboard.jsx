import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import StatCard from '../../components/dashboard/StatCard';

export default function TeacherDashboard() {
  const [sessions, setSessions] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    api.get('/sessions').then((r) => setSessions(r.data.data)).catch(() => {});
    api.get('/auth/me').then((r) => {
      api.get(`/reports/teacher/${r.data.data.id}`).then((rr) => setEarnings(rr.data.data)).catch(() => {});
    });
    api.get('/homework').then((r) => {
      const all = r.data.data || [];
      const ungraded = all.filter(h => (h.submissions || []).some(sub => sub.status === 'submitted'));
      setSubmissions(ungraded);
    }).catch(() => {});
  }, []);

  const upcoming = (sessions || []).filter(s => s.status === 'scheduled');

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold">لوحة المدرس</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        <StatCard label="إجمالي الحصص" value={earnings?.totalSessions ?? '—'} icon="🎥" color="brand" />
        <StatCard label="إجمالي الطلاب" value={earnings?.totalStudents ?? '—'} icon="🎓" color="green" />
        <StatCard label="إجمالي الأرباح" value={earnings?.earnings ?? '—'} icon="💰" color="amber" />
        <StatCard label="إجمالي التقييمات" value="قريباً" icon="⭐" color="purple" />
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-lg font-bold">حصصي القادمة</h2>
        <div className="flex items-center gap-3">
          <Link to="/teacher/sessions" className="text-sm text-brand-600 hover:underline">عرض الكل</Link>
          <Link to="/teacher/create" className="rounded-lg bg-brand-600 px-4 py-2 text-sm text-white">+ إنشاء حصة</Link>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {upcoming.length === 0 && <p className="text-slate-400">لا توجد حصص قادمة</p>}
        {upcoming.slice(0, 5).map((s) => (
          <div key={s.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-4 dark:border-slate-800 dark:bg-slate-900">
            <div>
              <p className="font-semibold">{s.title}</p>
              <p className="text-xs text-slate-500">{new Date(s.scheduled_at).toLocaleString('ar-EG')}</p>
            </div>
            <Link to={`/live/${s.id}`} className="rounded-lg bg-green-600 px-3 py-1.5 text-xs text-white">
              {s.status === 'live' ? 'دخول' : 'بدء'}
            </Link>
          </div>
        ))}
      </div>

      {submissions.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-bold">الواجبات بانتظار التصحيح</h2>
          <div className="space-y-3">
            {submissions.slice(0, 5).map((h) => {
              const sub = (h.submissions || []).find(sub => sub.status === 'submitted');
              return (
                <div key={h.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-4 dark:border-slate-800 dark:bg-slate-900">
                  <div>
                    <p className="font-semibold">{h.title}</p>
                    <p className="text-xs text-slate-500">{sub?.student?.user?.name || 'طالب'}</p>
                  </div>
                  <Link to={`/teacher/homework/${h.id}`} className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs text-white">تصحيح</Link>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
