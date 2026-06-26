import { useEffect, useState } from 'react';
import api from '../../lib/api';
import DashboardLayout from '../../components/dashboard/DashboardLayout';

export default function StudentRecordings() {
  const [sessions, setSessions] = useState([]);
  const [recordings, setRecordings] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/sessions', { params: { status: 'ended' } }).then((r) => {
      setSessions(r.data.data);
      // load recordings for each ended session
      r.data.data.forEach(async (s) => {
        try {
          const { data } = await api.get(`/sessions/${s.id}/recordings`);
          setRecordings((prev) => ({ ...prev, [s.id]: data.data }));
        } catch {}
      });
    }).finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold">تسجيلات الحصص</h1>
      <p className="mt-1 text-slate-500">شاهد تسجيلات الحصص السابقة</p>

      <div className="mt-6 space-y-4">
        {loading && <p className="text-slate-400">جارٍ التحميل...</p>}
        {!loading && sessions.length === 0 && <p className="text-slate-400">لا توجد تسجيلات بعد</p>}
        {sessions.map((s) => (
          <div key={s.id} className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="font-bold">{s.title}</h3>
            <p className="text-sm text-slate-500">{s.teacher?.user?.name} · {new Date(s.scheduled_at).toLocaleString('ar-EG')}</p>
            <div className="mt-3 space-y-2">
              {(recordings[s.id] || []).length === 0 && <p className="text-xs text-slate-400">التسجيل قيد المعالجة...</p>}
              {(recordings[s.id] || []).map((r) => (
                <div key={r.id} className="flex items-center justify-between rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                  <div>
                    <p className="text-sm font-medium">تسجيل {r.status === 'ready' ? '✓ جاهز' : '⏳ معالجة'}</p>
                    <p className="text-xs text-slate-500">المدة: {Math.round(r.duration_sec / 60)} دقيقة</p>
                  </div>
                  {r.url && r.status === 'ready' && (
                    <a href={r.url} target="_blank" rel="noreferrer" className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs text-white">
                      مشاهدة
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
