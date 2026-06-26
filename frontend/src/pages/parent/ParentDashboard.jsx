import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import DashboardLayout from '../../components/dashboard/DashboardLayout';

export default function ParentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/parent/dashboard').then((r) => {
      setData(r.data.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="py-20 text-center text-slate-400">جارٍ التحميل...</div>
      </DashboardLayout>
    );
  }

  if (!data || !data.students?.length) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <span className="text-6xl">👨‍👩‍👧‍👦</span>
          <h2 className="mt-6 text-xl font-bold">لم تقم بربط أي طالب بعد</h2>
          <p className="mt-2 text-slate-500">قم بربط طالب لمتابعة أدائه وحضوره ونتائجه</p>
          <Link
            to="/parent/link-student"
            className="mt-6 rounded-lg bg-brand-600 px-6 py-3 font-bold text-white"
          >
            ربط طالب
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">لوحة تحكم ولي الأمر</h1>
          <p className="mt-1 text-slate-500">مرحباً بعودتك</p>
        </div>
        <Link
          to="/parent/link-student"
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-bold text-white"
        >
          + ربط طالب جديد
        </Link>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {data.students.map((student) => (
          <div
            key={student.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-2xl text-brand-700 dark:bg-brand-700/20 dark:text-brand-300">
                  🎓
                </span>
                <div>
                  <h3 className="font-bold">{student.name}</h3>
                  <p className="text-xs text-slate-500">{student.grade || '—'}</p>
                </div>
              </div>
              <Link
                to={`/parent/students/${student.id}/report`}
                className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs text-white"
              >
                تقرير كامل
              </Link>
            </div>

            {student.recentExams?.length > 0 && (
              <div className="mt-4">
                <h4 className="mb-2 text-xs font-semibold text-slate-500">آخر نتائج الاختبارات</h4>
                <div className="space-y-2">
                  {student.recentExams.map((exam, i) => (
                    <div
                      key={exam.id || i}
                      className="flex items-center justify-between rounded-xl border border-slate-100 p-3 dark:border-slate-800"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{exam.title || 'اختبار'}</p>
                        <p className="text-xs text-slate-400">
                          {exam.date ? new Date(exam.date).toLocaleDateString('ar-EG') : ''}
                        </p>
                      </div>
                      <div className="mr-3 flex items-center gap-2">
                        <span className="text-sm font-bold">{exam.score ?? 0}%</span>
                        {exam.passed ? (
                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-700/20 dark:text-green-300">
                            ناجح
                          </span>
                        ) : (
                          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700 dark:bg-red-700/20 dark:text-red-300">
                            راسب
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 p-3 text-center dark:bg-slate-800/50">
                <p className="text-xs text-slate-500">الحصص القادمة</p>
                <p className="text-lg font-bold">{student.upcomingSessions ?? 0}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 text-center dark:bg-slate-800/50">
                <p className="text-xs text-slate-500">رصيد المحفظة</p>
                <p className="text-lg font-bold">{student.walletBalance ?? 0} ج.م</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
