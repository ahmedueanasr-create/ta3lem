import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function TeacherOnboarding() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    health_status: '',
    health_notes: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr(null);
    if (form.newPassword !== form.confirmPassword) {
      return setErr('كلمتا المرور غير متطابقتين');
    }
    if (form.newPassword.length < 8) {
      return setErr('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
    }
    setLoading(true);
    try {
      await api.post('/auth/teacher-onboarding', {
        health_status: form.health_status,
        health_notes: form.health_notes,
        newPassword: form.newPassword,
      });
      navigate('/dashboard');
    } catch (ex) {
      const errs = ex.response?.data?.details;
      if (errs && Array.isArray(errs)) {
        setErr(errs.map((e) => e.msg).join(' · '));
      } else {
        setErr(ex.response?.data?.message || 'فشل الحفظ');
      }
    } finally {
      setLoading(false);
    }
  };

  const skip = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-6 text-center">
          <div className="text-5xl">🩺</div>
          <h1 className="mt-4 text-2xl font-bold">إكمال بيانات المدرس</h1>
          <p className="mt-2 text-sm text-slate-500">
            مرحباً! يجب إكمال بياناتك الصحية وتغيير كلمة المرور قبل البدء.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {err && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{err}</div>}

          <div>
            <label className="text-sm font-medium">الحالة الصحية *</label>
            <select
              required
              value={form.health_status}
              onChange={(e) => setForm({ ...form, health_status: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 p-3 dark:border-slate-700 dark:bg-slate-800"
            >
              <option value="">اختر الحالة الصحية</option>
              <option value="سليم">سليم</option>
              <option value="أمراض مزمنة">أمراض مزمنة</option>
              <option value="حساسية">حساسية</option>
              <option value="إعاقة حركية">إعاقة حركية</option>
              <option value="أخرى">أخرى</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">ملاحظات صحية (اختياري)</label>
            <textarea
              rows="3"
              placeholder="أي معلومات صحية إضافية..."
              value={form.health_notes}
              onChange={(e) => setForm({ ...form, health_notes: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 p-3 dark:border-slate-700 dark:bg-slate-800"
            />
          </div>

          <div className="border-t pt-4">
            <h3 className="mb-3 font-semibold">تغيير كلمة المرور</h3>
            <div className="space-y-3">
              <input
                type="password"
                placeholder="كلمة المرور الجديدة"
                required
                minLength="8"
                value={form.newPassword}
                onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-3 dark:border-slate-700 dark:bg-slate-800"
              />
              <input
                type="password"
                placeholder="تأكيد كلمة المرور"
                required
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-3 dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full rounded-lg bg-brand-600 p-3 font-bold text-white disabled:opacity-50"
          >
            {loading ? 'جارٍ الحفظ...' : 'حفظ ومتابعة'}
          </button>

          <button type="button" onClick={skip} className="w-full text-sm text-slate-500 hover:underline">
            تخطي لاحقاً (تسجيل خروج)
          </button>
        </form>
      </div>
    </div>
  );
}
