import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../lib/api';

const gradeColors = {
  'ممتاز': 'text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-300',
  'جيد جدا': 'text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300',
  'جيد': 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/30 dark:text-yellow-300',
  'مقبول': 'text-orange-600 bg-orange-50 dark:bg-orange-900/30 dark:text-orange-300',
};

export default function VerifyCertificate() {
  const { code } = useParams();
  const [cert, setCert] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/certificates/verify/${code}`)
      .then((r) => setCert(r.data.data))
      .catch((e) => setError(e.response?.data?.message || 'الشهادة غير صالحة'))
      .finally(() => setLoading(false));
  }, [code]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
        <div className="text-lg text-white/60">جارٍ التحقق...</div>
      </div>
    );
  }

  if (error || !cert) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
        <div className="w-full max-w-md rounded-2xl border border-red-500/30 bg-white/5 p-8 text-center backdrop-blur-xl">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20 text-3xl">✕</div>
          <h1 className="text-xl font-bold text-white">شهادة غير صالحة</h1>
          <p className="mt-2 text-slate-400">{error || 'لم نتمكن من العثور على هذه الشهادة'}</p>
        </div>
      </div>
    );
  }

  const gradeClass = gradeColors[cert.grade] || gradeColors['مقبول'];

  return (
    <div dir="rtl" className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-xl">
        {/* Header */}
        <div className="border-b border-white/10 bg-gradient-to-l from-blue-600/40 to-purple-600/40 px-8 py-6 text-center">
          <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-3xl">🏆</div>
          <h1 className="text-2xl font-bold text-white">شهادة إتمام</h1>
          <p className="mt-1 text-sm text-white/60">منصة تعليم — تعليم</p>
        </div>

        {/* Body */}
        <div className="space-y-5 px-8 py-8">
          {/* Certificate Number */}
          <div className="text-center">
            <span className="rounded-full bg-white/10 px-4 py-1.5 text-sm font-mono text-white/70">
              {cert.certificate_number}
            </span>
          </div>

          {/* Student Name */}
          <div className="text-center">
            <p className="text-sm text-white/50">يشهد المركز بأن</p>
            <h2 className="mt-1 text-3xl font-bold text-white">{cert.student_name}</h2>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-4 rounded-2xl bg-white/5 p-6">
            <div className="text-center">
              <p className="text-sm text-white/50">المادة</p>
              <p className="text-lg font-semibold text-white">{cert.subject}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-white/50">الدرجة</p>
              <p className="text-lg font-semibold text-white">{cert.score} / {cert.total}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-white/50">التقدير</p>
              <span className={`inline-block rounded-lg px-4 py-1 text-lg font-bold ${gradeClass}`}>
                {cert.grade}
              </span>
            </div>
            <div className="text-center">
              <p className="text-sm text-white/50">تاريخ الإصدار</p>
              <p className="text-lg font-semibold text-white">
                {new Date(cert.issue_date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Verification Badge */}
          <div className="flex items-center justify-center gap-2 rounded-xl bg-green-600/20 px-4 py-3 text-green-400">
            <span className="text-xl">✓</span>
            <span className="font-semibold">تم التحقق من صحة الشهادة</span>
          </div>
        </div>
      </div>
    </div>
  );
}
