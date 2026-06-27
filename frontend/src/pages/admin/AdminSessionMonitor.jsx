import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import DashboardLayout from '../../components/dashboard/DashboardLayout';

export default function AdminSessionMonitor() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetch = async () => {
    try {
      const { data } = await api.get('/sessions/monitoring');
      setSessions(data.data || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetch(); const iv = setInterval(fetch, 10000); return () => clearInterval(iv); }, []);

  const handleForceEnd = async (id) => {
    if (!confirm('هل أنت متأكد من إنهاء الحصة forcément؟')) return;
    try {
      await api.post(`/sessions/${id}/force-end`);
      fetch();
    } catch {}
  };

  const handleSuspendTeacher = async (id) => {
    if (!confirm('سيتم تعليق المدرس وإنهاء الحصة. متأكد؟')) return;
    try {
      await api.post(`/sessions/${id}/suspend-teacher`);
      fetch();
    } catch {}
  };

  const duration = (startedAt) => {
    if (!startedAt) return '-';
    const diff = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
    const h = Math.floor(diff / 3600);
    const m = Math.floor((diff % 3600) / 60);
    return h > 0 ? `${h}s ${m}d` : `${m}d`;
  };

  if (loading) return <DashboardLayout><div className="py-20 text-center text-slate-400">جارٍ التحميل...</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">متابعة الحصص المباشرة</h1>
          <p className="mt-1 text-sm text-slate-500">{sessions.length} حصة مباشرة حالياً</p>
        </div>
        <button onClick={fetch} className="rounded-xl border border-slate-300 px-4 py-2 text-sm transition hover:bg-slate-50">تحديث</button>
      </div>

      {sessions.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 p-12 text-center text-slate-400 dark:border-slate-800">
          لا توجد حصص مباشرة حالياً
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sessions.map((s) => (
            <div key={s.id} className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-3 flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-bold">{s.title}</h3>
                  <p className="mt-0.5 text-xs text-slate-500">{s.teacher?.user?.name || '—'}</p>
                </div>
                <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">مباشر</span>
              </div>

              <div className="mb-3 flex items-center gap-4 text-sm text-slate-500">
                {s.subject && <span>{s.subject.name}</span>}
                <span>🕒 {duration(s.started_at)}</span>
              </div>

              <div className="mb-4 grid grid-cols-2 gap-3 text-center text-sm">
                <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
                  <div className="text-lg font-bold text-brand-600">{s.liveParticipants || 0}</div>
                  <div className="text-xs text-slate-500">حضور</div>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
                  <div className="text-lg font-bold text-brand-600">{s.totalEnrolled || 0}</div>
                  <div className="text-xs text-slate-500">مسجلين</div>
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => navigate(`/admin/sessions`)}
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-xs transition hover:bg-slate-50">تفاصيل</button>
                <button onClick={() => handleForceEnd(s.id)}
                  className="flex-1 rounded-lg bg-red-500 px-3 py-2 text-xs text-white transition hover:bg-red-600">إنهاء</button>
                <button onClick={() => handleSuspendTeacher(s.id)}
                  className="flex-1 rounded-lg bg-orange-500 px-3 py-2 text-xs text-white transition hover:bg-orange-600">تعليق المدرس</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
