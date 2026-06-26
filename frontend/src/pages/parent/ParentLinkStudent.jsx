import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import DashboardLayout from '../../components/dashboard/DashboardLayout';

export default function ParentLinkStudent() {
  const navigate = useNavigate();
  const [studentCode, setStudentCode] = useState('');
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setErr(null);
    setSuccess(null);

    if (studentCode.trim().length !== 8) {
      setErr('كود الطالب يجب أن يتكون من 8 أحرف');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/parent/link-student', { studentCode: studentCode.trim() });
      setSuccess(data.data || data.message || 'تم ربط الطالب بنجاح');
      setTimeout(() => navigate('/parent/dashboard'), 2000);
    } catch (ex) {
      setErr(ex.response?.data?.message || 'فشل ربط الطالب');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-md">
        <h1 className="text-2xl font-bold">ربط طالب</h1>
        <p className="mt-2 text-sm text-slate-500">
          أدخل كود الطالب المكون من 8 أحرف لربطه بحسابك
        </p>

        <form onSubmit={submit} className="mt-8 space-y-4">
          {err && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{err}</div>}
          {success && (
            <div className="rounded-lg bg-green-50 p-3 text-sm text-green-600">
              {typeof success === 'string' ? success : 'تم ربط الطالب بنجاح'}
            </div>
          )}

          <div>
            <label className="text-sm font-medium">كود الطالب *</label>
            <input
              required
              dir="ltr"
              maxLength={8}
              placeholder="أدخل الكود المكون من 8 أحرف"
              value={studentCode}
              onChange={(e) => setStudentCode(e.target.value.toUpperCase().slice(0, 8))}
              className="mt-1 w-full rounded-lg border border-slate-300 p-3 text-center text-lg tracking-widest dark:border-slate-700 dark:bg-slate-800"
            />
          </div>

          <button
            disabled={loading || success}
            className="w-full rounded-lg bg-brand-600 p-3 font-bold text-white disabled:opacity-50"
          >
            {loading ? 'جارٍ الربط...' : 'ربط'}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
