import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    grade: '',
    guardian_name: '',
    guardian_phone: '',
  });
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await register(form);
      navigate('/login');
    } catch (ex) {
      const errs = ex.response?.data?.details;
      if (errs && Array.isArray(errs)) {
        setErr(errs.map((e) => e.msg).join(' · '));
      } else {
        setErr(ex.response?.data?.message || 'فشل التسجيل');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="text-2xl font-bold">تسجيل طالب جديد</h1>
      <p className="mt-2 text-sm text-slate-500">
        التسجيل متاح للطلاب فقط. المدرسون يتم إضافتهم بواسطة إدارة المنصة.
      </p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        {err && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{err}</div>}

        <div>
          <label className="text-sm font-medium">الاسم رباعي (مطلوب) *</label>
          <input
            required
            placeholder="مثال: أحمد محمد علي حسن"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-300 p-3 dark:border-slate-700 dark:bg-slate-800"
          />
          <p className="mt-1 text-xs text-slate-400">يجب أن يكون اسماً صحيحاً ثلاثياً أو رباعياً</p>
        </div>

        <div>
          <label className="text-sm font-medium">البريد الإلكتروني *</label>
          <input
            type="email"
            required
            placeholder="email@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-300 p-3 dark:border-slate-700 dark:bg-slate-800"
          />
        </div>

        <div>
          <label className="text-sm font-medium">كلمة المرور *</label>
          <input
            type="password"
            required
            minLength="8"
            placeholder="8 أحرف على الأقل"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-300 p-3 dark:border-slate-700 dark:bg-slate-800"
          />
        </div>

        <div>
          <label className="text-sm font-medium">رقم الهاتف (مطلوب) *</label>
          <input
            required
            placeholder="01XXXXXXXXX"
            pattern="01[0-9]{9}"
            title="رقم هاتف مصري يبدأ بـ 01"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-300 p-3 dark:border-slate-700 dark:bg-slate-800"
          />
        </div>

        <div>
          <label className="text-sm font-medium">الصف الدراسي</label>
          <input
            placeholder="مثال: الصف الثالث الثانوي"
            value={form.grade}
            onChange={(e) => setForm({ ...form, grade: e.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-300 p-3 dark:border-slate-700 dark:bg-slate-800"
          />
        </div>

        <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800/50">
          <h3 className="mb-3 font-semibold text-sm">بيانات ولي الأمر (إجباري) *</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">اسم ولي الأمر *</label>
              <input
                required
                placeholder="اسم ولي الأمر"
                value={form.guardian_name}
                onChange={(e) => setForm({ ...form, guardian_name: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 p-3 dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="text-sm font-medium">رقم هاتف ولي الأمر *</label>
              <input
                required
                placeholder="01XXXXXXXXX"
                pattern="01[0-9]{9}"
                title="رقم هاتف مصري يبدأ بـ 01"
                value={form.guardian_phone}
                onChange={(e) => setForm({ ...form, guardian_phone: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 p-3 dark:border-slate-700 dark:bg-slate-800"
              />
              <p className="mt-1 text-xs text-slate-400">سيتم استخدام هذا الرقم للتواصل وإرسال الإشعارات</p>
            </div>
          </div>
        </div>

        <button
          disabled={loading}
          className="w-full rounded-lg bg-brand-600 p-3 font-bold text-white disabled:opacity-50"
        >
          {loading ? 'جارٍ التسجيل...' : 'تسجيل'}
        </button>

        <p className="text-center text-sm">
          لديك حساب؟ <Link to="/login" className="text-brand-600">ادخل</Link>
        </p>
      </form>
    </div>
  );
}
