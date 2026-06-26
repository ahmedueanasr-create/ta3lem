import { useEffect, useState } from 'react';
import api from '../../lib/api';
import DashboardLayout from '../../components/dashboard/DashboardLayout';

export default function ParentPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/parent/payments').then((r) => {
      setPayments(r.data.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="py-20 text-center text-slate-400">جارٍ التحميل...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold">المدفوعات</h1>
      <p className="mt-1 text-sm text-slate-500">سجل جميع المدفوعات لأبنائك الطلاب</p>

      {payments.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-slate-200 p-8 text-center dark:border-slate-800">
          <span className="text-4xl">💳</span>
          <p className="mt-4 text-slate-500">لا توجد مدفوعات مسجلة</p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {payments.map((studentPmts, i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
            >
              <h3 className="mb-3 font-bold">
                {studentPmts.studentName || `طالب ${i + 1}`}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/50">
                    <tr>
                      <th className="px-4 py-3 font-semibold">التاريخ</th>
                      <th className="px-4 py-3 font-semibold">النوع</th>
                      <th className="px-4 py-3 font-semibold">المبلغ</th>
                      <th className="px-4 py-3 font-semibold">الوصف</th>
                      <th className="px-4 py-3 font-semibold">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {(studentPmts.transactions || []).map((tx, j) => (
                      <tr key={tx.id || j} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                        <td className="px-4 py-3 text-slate-500">
                          {tx.date ? new Date(tx.date).toLocaleDateString('ar-EG') : '—'}
                        </td>
                        <td className="px-4 py-3">{tx.type || '—'}</td>
                        <td className="px-4 py-3 font-medium">{tx.amount ?? '—'} ج.م</td>
                        <td className="px-4 py-3 text-slate-500">{tx.description || '—'}</td>
                        <td className="px-4 py-3">
                          {tx.status === 'completed' || tx.status === 'paid' ? (
                            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-700/20 dark:text-green-300">
                              مدفوع
                            </span>
                          ) : tx.status === 'pending' ? (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700 dark:bg-amber-700/20 dark:text-amber-300">
                              معلق
                            </span>
                          ) : (
                            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700 dark:bg-red-700/20 dark:text-red-300">
                              {tx.status || '—'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {(!studentPmts.transactions || studentPmts.transactions.length === 0) && (
                <p className="py-4 text-center text-slate-400">لا توجد معاملات</p>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
