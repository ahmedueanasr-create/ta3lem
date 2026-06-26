import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import StatCard from '../../components/dashboard/StatCard';

export default function StudentDashboard() {
  const [wallet, setWallet] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [report, setReport] = useState(null);
  const [examAttempts, setExamAttempts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    api.get('/wallet').then((r) => setWallet(r.data.data)).catch(() => {});
    api.get('/sessions', { params: { status: 'scheduled' } }).then((r) => setSessions(r.data.data)).catch(() => {});
    api.get('/auth/me').then((r) => {
      api.get(`/reports/student/${r.data.data.id}`).then((rr) => setReport(rr.data.data)).catch(() => {});
    });
    api.get('/exams/attempts/history').then((r) => setExamAttempts((r.data.data || []).slice(0, 3))).catch(() => {});
    api.get('/notifications').then((r) => {
      const unread = (r.data.data || []).filter(n => !n.read_at).length;
      setUnreadCount(unread);
    }).catch(() => {});
  }, []);

  const attendedPct = report?.attendancePct ?? 0;
  const absentPct = 100 - attendedPct;

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">لوحة الطالب</h1>
          <p className="mt-1 text-slate-500">مرحباً بعودتك</p>
        </div>
        {unreadCount > 0 && (
          <Link to="/notifications" className="relative rounded-full bg-brand-100 p-2 dark:bg-brand-900/30">
            <span className="text-lg">🔔</span>
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">{unreadCount}</span>
          </Link>
        )}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💳</span>
            <div>
              <p className="text-xs text-slate-500">رصيد المحفظة</p>
              <p className="text-xl font-bold">{wallet?.balance ?? 0} {wallet?.currency || ''}</p>
            </div>
          </div>
          <Link to="/wallet" className="mt-3 block rounded-lg bg-brand-600 py-1.5 text-center text-xs font-bold text-white">شحن</Link>
        </div>
        <StatCard label="حصص حضرتها" value={report?.attended ?? '—'} icon="✅" color="green" />
        <StatCard label="نسبة الحضور" value={`${attendedPct}%`} icon="📊" color="amber" />
        <StatCard label="غياب" value={report?.absent ?? '—'} icon="❌" color="red" />
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 p-5 dark:border-slate-800 dark:bg-slate-900">
        <h3 className="mb-3 text-sm font-bold text-slate-500">ملخص الحضور</h3>
        <div className="space-y-2">
          <div>
            <div className="mb-1 flex justify-between text-xs">
              <span>حاضر</span>
              <span>{attendedPct}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div className="h-2 rounded-full bg-green-500" style={{ width: `${attendedPct}%` }} />
            </div>
          </div>
          <div>
            <div className="mb-1 flex justify-between text-xs">
              <span>غائب</span>
              <span>{absentPct}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div className="h-2 rounded-full bg-red-500" style={{ width: `${absentPct}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-lg font-bold">آخر نتائج الاختبارات</h2>
        <div className="space-y-3">
          {examAttempts.length === 0 && <p className="text-slate-400">لا توجد نتائج بعد</p>}
          {examAttempts.map((a, i) => (
            <div key={a.id || i} className="flex items-center justify-between rounded-xl border border-slate-200 p-4 dark:border-slate-800 dark:bg-slate-900">
              <div>
                <p className="font-semibold">{a.exam?.title || 'اختبار'}</p>
                <p className="text-xs text-slate-500">{new Date(a.completed_at || a.created_at).toLocaleString('ar-EG')}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold">{a.score ?? 0}%</span>
                {a.passed ? (
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-700/20 dark:text-green-300">ناجح</span>
                ) : (
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700 dark:bg-red-700/20 dark:text-red-300">راسب</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-lg font-bold">الحصص القادمة</h2>
        <Link to="/student/sessions" className="text-sm text-brand-600 hover:underline">عرض الكل</Link>
      </div>

      <div className="mt-4 space-y-3">
        {sessions.length === 0 && <p className="text-slate-400">لا توجد حصص قادمة</p>}
        {sessions.slice(0, 5).map((s) => (
          <div key={s.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-4 dark:border-slate-800 dark:bg-slate-900">
            <div>
              <p className="font-semibold">{s.title}</p>
              <p className="text-xs text-slate-500">
                {s.teacher?.user?.name} · {new Date(s.scheduled_at).toLocaleString('ar-EG')} · السعر: {s.price}
              </p>
            </div>
            <Link to={`/live/${s.id}`} className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs text-white">دخول</Link>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
