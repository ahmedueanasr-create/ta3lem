import { useEffect, useState } from 'react';
import api from '../../lib/api';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { Link } from 'react-router-dom';
import RateSession from '../../components/dashboard/RateSession';

const statusColors = {
  scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-700/20 dark:text-blue-300',
  live: 'bg-red-100 text-red-700 dark:bg-red-700/20 dark:text-red-300',
  ended: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  cancelled: 'bg-amber-100 text-amber-700 dark:bg-amber-700/20 dark:text-amber-300',
};

export default function StudentSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('scheduled');

  const load = () => {
    setLoading(true);
    api.get('/sessions', { params: { status } }).then((r) => setSessions(r.data.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [status]);

  const enroll = async (id) => {
    try {
      await api.post(`/sessions/${id}/enroll`);
      alert('تم التسجيل في الحصة ✓');
    } catch (ex) {
      alert(ex.response?.data?.message || 'فشل التسجيل');
    }
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">الحصص المتاحة</h1>
        <select value={status} onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-slate-300 p-2 text-sm dark:border-slate-700 dark:bg-slate-800">
          <option value="scheduled">مجدولة</option>
          <option value="live">مباشر الآن</option>
          <option value="ended">منتهية</option>
          <option value="">الكل</option>
        </select>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading && <p className="text-slate-400">جارٍ التحميل...</p>}
        {!loading && sessions.length === 0 && <p className="text-slate-400">لا توجد حصص</p>}
        {sessions.map((s) => (
          <div key={s.id} className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between">
              <h3 className="font-bold">{s.title}</h3>
              <span className={`rounded-full px-2 py-0.5 text-xs ${statusColors[s.status]}`}>{s.status}</span>
            </div>
            <p className="mt-2 text-sm text-slate-500">{s.teacher?.user?.name}</p>
            <p className="mt-1 text-sm text-slate-500">{new Date(s.scheduled_at).toLocaleString('ar-EG')}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-lg font-bold text-brand-600">{s.price} ج.م</span>
              <div className="flex gap-2">
                {s.status === 'scheduled' && (
                  <button onClick={() => enroll(s.id)} className="rounded-lg bg-slate-600 px-3 py-1.5 text-xs text-white">تسجيل</button>
                )}
                {(s.status === 'live' || s.status === 'scheduled') && (
                  <Link to={`/live/${s.id}`} className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs text-white">
                    {s.status === 'live' ? 'دخول الآن' : 'دخول'}
                  </Link>
                )}
                {s.status === 'ended' && (
                  <>
                    <Link to={`/student/recordings`} className="rounded-lg bg-slate-600 px-3 py-1.5 text-xs text-white">التسجيل</Link>
                    <RateSession sessionId={s.id} sessionTitle={s.title} />
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
