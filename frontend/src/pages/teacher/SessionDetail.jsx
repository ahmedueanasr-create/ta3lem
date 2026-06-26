import { useEffect, useState } from 'react';
import api from '../../lib/api';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useParams, Link } from 'react-router-dom';

const statusColors = {
  present: 'bg-green-100 text-green-700 dark:bg-green-700/20 dark:text-green-300',
  absent: 'bg-red-100 text-red-700 dark:bg-red-700/20 dark:text-red-300',
  late: 'bg-amber-100 text-amber-700 dark:bg-amber-700/20 dark:text-amber-300',
};

function fmtDuration(sec) {
  if (!sec) return '—';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}m ${s}s`;
}

export default function SessionDetail() {
  const { id } = useParams();
  const [session, setSession] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/sessions/${id}`),
      api.get(`/reports/session/${id}/attendance`).catch(() => ({ data: { data: null } })),
    ]).then(([s, r]) => {
      setSession(s.data.data);
      setReport(r.data.data);
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <DashboardLayout><p className="text-slate-400">جارٍ التحميل...</p></DashboardLayout>;
  if (!session) return <DashboardLayout><p className="text-slate-400">الحصة غير موجودة</p></DashboardLayout>;

  const records = report?.records || [];

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between">
        <div>
          <Link to="/teacher/sessions" className="text-sm text-brand-600 hover:underline">← رجوع</Link>
          <h1 className="mt-2 text-2xl font-bold">{session.title}</h1>
          <p className="text-sm text-slate-500">{new Date(session.scheduled_at).toLocaleString('ar-EG')} · {session.duration_min} دقيقة</p>
        </div>
        <div className="flex gap-2">
          {session.status === 'live' && (
            <Link to={`/live/${id}`} className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white">دخول البث</Link>
          )}
          {session.status === 'scheduled' && (
            <Link to={`/live/${id}`} className="rounded-lg bg-green-600 px-4 py-2 text-sm text-white">بدء الحصة</Link>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500">الحالة</p>
          <p className="mt-1 font-bold">{session.status}</p>
        </div>
        <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500">المسجلين</p>
          <p className="mt-1 text-2xl font-bold">{session.enrollments?.length || 0}</p>
        </div>
        <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500">الحاضرون</p>
          <p className="mt-1 text-2xl font-bold text-green-600">{records.filter(r => r.status === 'present').length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500">السعر</p>
          <p className="mt-1 text-xl font-bold">{session.price} ج.م</p>
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">سجل الحضور</h2>
          <a
            href={`/api/v1/sessions/${id}/attendance/export`}
            onClick={(e) => { e.preventDefault(); window.open(`/api/v1/sessions/${id}/attendance/export?token=${localStorage.getItem('accessToken')}`); }}
            className="rounded-lg bg-green-600 px-3 py-1.5 text-xs text-white"
          >
            📥 تصدير CSV
          </a>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="p-3 text-right">#</th>
                <th className="p-3 text-right">الطالب</th>
                <th className="p-3 text-right">دخول</th>
                <th className="p-3 text-right">خروج</th>
                <th className="p-3 text-right">المدة</th>
                <th className="p-3 text-right">النسبة</th>
                <th className="p-3 text-right">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 && (
                <tr><td colSpan="7" className="p-6 text-center text-slate-400">لا يوجد سجل حضور بعد</td></tr>
              )}
              {records.map((r) => (
                <tr key={r.id} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="p-3">{r.user_id}</td>
                  <td className="p-3 font-medium">{r.user?.name || '—'}</td>
                  <td className="p-3 text-slate-500">{r.joined_at ? new Date(r.joined_at).toLocaleTimeString('ar-EG') : '—'}</td>
                  <td className="p-3 text-slate-500">{r.left_at ? new Date(r.left_at).toLocaleTimeString('ar-EG') : '—'}</td>
                  <td className="p-3 text-slate-500">{fmtDuration(r.duration_sec)}</td>
                  <td className="p-3">{r.attendance_pct}%</td>
                  <td className="p-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[r.status]}`}>{r.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {session.recordings?.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-4 text-lg font-bold">التسجيلات</h2>
          <div className="space-y-2">
            {session.recordings.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3 dark:border-slate-800">
                <div>
                  <p className="text-sm font-medium">تسجيل {r.status === 'ready' ? '✓ جاهز' : '⏳ معالجة'}</p>
                  <p className="text-xs text-slate-500">المدة: {Math.round(r.duration_sec / 60)} دقيقة</p>
                </div>
                {r.url && r.status === 'ready' && (
                  <a href={r.url} target="_blank" rel="noreferrer" className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs text-white">مشاهدة</a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
