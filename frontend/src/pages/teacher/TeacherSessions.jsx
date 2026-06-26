import { useEffect, useState } from 'react';
import api from '../../lib/api';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { Link } from 'react-router-dom';

const statusColors = {
  scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-700/20 dark:text-blue-300',
  live: 'bg-red-100 text-red-700 dark:bg-red-700/20 dark:text-red-300',
  ended: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  cancelled: 'bg-amber-100 text-amber-700 dark:bg-amber-700/20 dark:text-amber-300',
};

export default function TeacherSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/sessions').then((r) => setSessions(r.data.data)).finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">حصصي</h1>
        <Link to="/teacher/create" className="rounded-lg bg-brand-600 px-4 py-2 text-sm text-white">+ حصة جديدة</Link>
      </div>

      <div className="mt-6 space-y-3">
        {loading && <p className="text-slate-400">جارٍ التحميل...</p>}
        {!loading && sessions.length === 0 && <p className="text-slate-400">لا توجد حصص</p>}
        {sessions.map((s) => (
          <div key={s.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-4 dark:border-slate-800 dark:bg-slate-900">
            <div>
              <p className="font-semibold">{s.title}</p>
              <div className="mt-1 flex gap-3 text-xs text-slate-500">
                <span>{new Date(s.scheduled_at).toLocaleString('ar-EG')}</span>
                <span>السعر: {s.price}</span>
                <span className={`rounded-full px-2 py-0.5 ${statusColors[s.status]}`}>{s.status}</span>
              </div>
            </div>
            <div className="flex gap-2">
              {s.status === 'scheduled' && (
                <Link to={`/live/${s.id}`} className="rounded-lg bg-green-600 px-3 py-1.5 text-xs text-white">بدء</Link>
              )}
              {s.status === 'live' && (
                <Link to={`/live/${s.id}`} className="rounded-lg bg-red-600 px-3 py-1.5 text-xs text-white">دخول</Link>
              )}
              <Link to={`/teacher/session/${s.id}`} className="rounded-lg bg-slate-600 px-3 py-1.5 text-xs text-white">تفاصيل</Link>
              {s.status !== 'ended' && s.status !== 'cancelled' && (
                <button
                  onClick={() => { if (confirm('إنهاء الحصة؟')) { api.post(`/sessions/${s.id}/end`); window.location.reload(); } }}
                  className="rounded-lg bg-slate-600 px-3 py-1.5 text-xs text-white"
                >إنهاء</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
