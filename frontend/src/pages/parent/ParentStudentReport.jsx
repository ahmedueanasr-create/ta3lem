import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import DashboardLayout from '../../components/dashboard/DashboardLayout';

export default function ParentStudentReport() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/parent/students/${studentId}/report`).then((r) => {
      setData(r.data.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [studentId]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="py-20 text-center text-slate-400">جارٍ التحميل...</div>
      </DashboardLayout>
    );
  }

  if (!data) {
    return (
      <DashboardLayout>
        <div className="py-20 text-center text-slate-400">لا توجد بيانات</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <button
        onClick={() => navigate('/parent/dashboard')}
        className="mb-4 flex items-center gap-2 text-sm text-slate-500 hover:text-brand-600"
      >
        → العودة إلى لوحة التحكم
      </button>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-3xl text-brand-700 dark:bg-brand-700/20 dark:text-brand-300">
            🎓
          </span>
          <div>
            <h1 className="text-2xl font-bold">{data.student?.name || 'الطالب'}</h1>
            <p className="text-sm text-slate-500">{data.student?.grade || '—'}</p>
          </div>
        </div>
      </div>

      {data.grades?.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-4 text-lg font-bold">الدرجات</h2>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-4 py-3 font-semibold">المادة</th>
                  <th className="px-4 py-3 font-semibold">الدرجة</th>
                  <th className="px-4 py-3 font-semibold">التاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.grades.map((g, i) => (
                  <tr key={g.id || i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="px-4 py-3">{g.subject || '—'}</td>
                    <td className="px-4 py-3 font-medium">{g.score ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {g.date ? new Date(g.date).toLocaleDateString('ar-EG') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {data.attendance?.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-4 text-lg font-bold">سجل الحضور</h2>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-4 py-3 font-semibold">الجلسة</th>
                  <th className="px-4 py-3 font-semibold">التاريخ</th>
                  <th className="px-4 py-3 font-semibold">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.attendance.map((a, i) => (
                  <tr key={a.id || i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="px-4 py-3">{a.session?.title || '—'}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {a.date ? new Date(a.date).toLocaleDateString('ar-EG') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {a.status === 'present' ? (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-700/20 dark:text-green-300">
                          حاضر
                        </span>
                      ) : (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700 dark:bg-red-700/20 dark:text-red-300">
                          غائب
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {data.sessions?.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-4 text-lg font-bold">سجل الحصص</h2>
          <div className="space-y-3">
            {data.sessions.map((s, i) => (
              <div
                key={s.id || i}
                className="flex items-center justify-between rounded-xl border border-slate-200 p-4 dark:border-slate-800 dark:bg-slate-900"
              >
                <div>
                  <p className="font-semibold">{s.title || 'حصة'}</p>
                  <p className="text-xs text-slate-500">
                    {s.date ? new Date(s.date).toLocaleDateString('ar-EG') : ''}
                    {s.teacher ? ` · ${s.teacher}` : ''}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    s.status === 'completed'
                      ? 'bg-green-100 text-green-700 dark:bg-green-700/20 dark:text-green-300'
                      : s.status === 'scheduled'
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-700/20 dark:text-amber-300'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-700/20 dark:text-slate-300'
                  }`}
                >
                  {s.status === 'completed' ? 'مكتملة' : s.status === 'scheduled' ? 'قادمة' : s.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!data.grades?.length && !data.attendance?.length && !data.sessions?.length && (
        <p className="mt-8 text-center text-slate-400">لا توجد بيانات متاحة بعد</p>
      )}
    </DashboardLayout>
  );
}
