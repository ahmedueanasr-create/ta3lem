import { useEffect, useState } from 'react';
import api from '../../lib/api';
import DashboardLayout from '../../components/dashboard/DashboardLayout';

export default function ExamHistory() {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/exams/attempts/history').then((r) => setAttempts(r.data.data)).finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold">سجل اختباراتي</h1>

      <div className="mt-6 space-y-3">
        {loading && <p className="text-slate-400">جارٍ التحميل...</p>}
        {!loading && attempts.length === 0 && <p className="text-slate-400">لم تخض أي اختبار بعد</p>}
        {attempts.map((a) => (
          <div key={a.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-4 dark:border-slate-800 dark:bg-slate-900">
            <div>
              <p className="font-semibold">{a.exam?.title || 'اختبار'}</p>
              <p className="text-xs text-slate-500">{new Date(a.submitted_at || a.created_at).toLocaleString('ar-EG')}</p>
            </div>
            <div className="flex items-center gap-4">
              {a.certificate_id && (
                <span className="rounded-lg bg-green-50 px-3 py-1 text-xs text-green-700">🏆 {a.certificate_id}</span>
              )}
              <div className="text-center">
                <p className={`text-2xl font-bold ${a.status === 'graded' ? (a.score >= 50 ? 'text-green-600' : 'text-red-600') : 'text-slate-400'}`}>
                  {a.score != null ? `${a.score}%` : '—'}
                </p>
                <p className="text-xs text-slate-500">
                  {a.status === 'graded' ? (a.score >= 50 ? 'ناجح' : 'راسب') : a.status}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
