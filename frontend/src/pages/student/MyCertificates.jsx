import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import DashboardLayout from '../../components/dashboard/DashboardLayout';

const gradeColors = {
  'ممتاز': 'text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-300',
  'جيد جدا': 'text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300',
  'جيد': 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/30 dark:text-yellow-300',
  'مقبول': 'text-orange-600 bg-orange-50 dark:bg-orange-900/30 dark:text-orange-300',
};

export default function MyCertificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/certificates/my')
      .then((r) => setCertificates(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold">شهاداتي</h1>

      {loading && <p className="mt-6 text-slate-400">جارٍ التحميل...</p>}
      {!loading && certificates.length === 0 && (
        <p className="mt-6 text-slate-400">لا توجد شهادات بعد</p>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {certificates.map((cert) => (
          <Link
            key={cert.id}
            to={`/verify-certificate/${cert.verification_code}`}
            className="group rounded-xl border border-slate-200 bg-white p-5 transition hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="mb-3 flex items-center gap-2">
              <span className="text-2xl">🏆</span>
              <h3 className="font-bold text-slate-800 dark:text-white">{cert.title}</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">الدرجة</span>
                <span className="font-semibold">{cert.score} / {cert.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">التقدير</span>
                <span className={`rounded-lg px-2.5 py-0.5 text-xs font-bold ${gradeColors[cert.grade] || gradeColors['مقبول']}`}>
                  {cert.grade}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">التاريخ</span>
                <span>{new Date(cert.issue_date).toLocaleDateString('ar-EG')}</span>
              </div>
            </div>
            <div className="mt-4 text-left text-xs text-brand-600 opacity-0 transition group-hover:opacity-100">
              عرض الشهادة ←
            </div>
          </Link>
        ))}
      </div>
    </DashboardLayout>
  );
}
