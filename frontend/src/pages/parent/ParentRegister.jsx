import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../lib/api';

export default function ParentRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    password: '',
    confirmPassword: '',
    relationType: '',
    studentCode: '',
  });
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  const relationOptions = [
    { value: '', label: 'اختر صلة القرابة' },
    { value: 'father', label: 'أب' },
    { value: 'mother', label: 'أم' },
    { value: 'guardian', label: 'وصي' },
    { value: 'other', label: 'غيره' },
  ];

  const validatePhone = (phone) => /^01[0-9]{9}$/.test(phone);

  const submit = async (e) => {
    e.preventDefault();
    setErr(null);
    setSuccess(null);

    if (!validatePhone(form.phone)) {
      setErr('رقم الهاتف يجب أن يبدأ بـ 01 ويتكون من 11 رقمًا');
      return;
    }
    if (form.password.length < 8) {
      setErr('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setErr('كلمة المرور غير متطابقة');
      return;
    }
    if (!form.relationType) {
      setErr('يرجى اختيار صلة القرابة');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        fullName: form.fullName,
        phone: form.phone,
        password: form.password,
        relationType: form.relationType,
      };
      if (form.studentCode.trim()) payload.studentCode = form.studentCode.trim();

      const { data } = await api.post('/parent/register', payload);
      setSuccess(data.data);
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

  if (success) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12">
        <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center dark:border-green-800 dark:bg-green-900/20">
          <span className="text-4xl">✅</span>
          <h2 className="mt-4 text-xl font-bold text-green-700 dark:text-green-300">تم التسجيل بنجاح</h2>
          <p className="mt-2 text-green-600 dark:text-green-400">
            تم إنشاء حساب ولي الأمر الخاص بك. يمكنك تسجيل الدخول باستخدام:
          </p>
          <div className="mt-4 rounded-xl bg-white p-4 text-right dark:bg-slate-800">
            <p className="text-sm">
              <span className="font-semibold">البريد الإلكتروني:</span> {success.email}
            </p>
            <p className="text-sm">
              <span className="font-semibold">كلمة المرور:</span> (التي أدخلتها)
            </p>
          </div>
          <Link
            to="/login"
            className="mt-6 inline-block rounded-lg bg-brand-600 px-6 py-3 font-bold text-white"
          >
            تسجيل الدخول
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="text-2xl font-bold">تسجيل ولي أمر</h1>
      <p className="mt-2 text-sm text-slate-500">أنشئ حساب ولي أمر لمتابعة أداء الطلاب</p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        {err && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{err}</div>}

        <div>
          <label className="text-sm font-medium">الاسم بالكامل *</label>
          <input
            required
            placeholder="مثال: أحمد محمد علي"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-300 p-3 dark:border-slate-700 dark:bg-slate-800"
          />
        </div>

        <div>
          <label className="text-sm font-medium">رقم الهاتف *</label>
          <input
            required
            dir="ltr"
            placeholder="01XXXXXXXXX"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 11) })}
            className="mt-1 w-full rounded-lg border border-slate-300 p-3 dark:border-slate-700 dark:bg-slate-800"
          />
          <p className="mt-1 text-xs text-slate-400">رقم هاتف مصري يبدأ بـ 01</p>
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
          <label className="text-sm font-medium">تأكيد كلمة المرور *</label>
          <input
            type="password"
            required
            minLength="8"
            placeholder="أعد إدخال كلمة المرور"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-300 p-3 dark:border-slate-700 dark:bg-slate-800"
          />
        </div>

        <div>
          <label className="text-sm font-medium">صلة القرابة *</label>
          <select
            required
            value={form.relationType}
            onChange={(e) => setForm({ ...form, relationType: e.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-300 p-3 dark:border-slate-700 dark:bg-slate-800"
          >
            {relationOptions.map((o) => (
              <option key={o.value} value={o.value} disabled={!o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">كود الطالب (اختياري)</label>
          <input
            placeholder="كود الطالب المكون من 8 أحرف"
            value={form.studentCode}
            onChange={(e) => setForm({ ...form, studentCode: e.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-300 p-3 dark:border-slate-700 dark:bg-slate-800"
          />
          <p className="mt-1 text-xs text-slate-400">يمكنك ربط طالب لاحقاً من لوحة التحكم</p>
        </div>

        <button
          disabled={loading}
          className="w-full rounded-lg bg-brand-600 p-3 font-bold text-white disabled:opacity-50"
        >
          {loading ? 'جارٍ التسجيل...' : 'تسجيل'}
        </button>

        <p className="text-center text-sm">
          لديك حساب؟ <Link to="/login" className="text-brand-600">تسجيل الدخول</Link>
        </p>
      </form>
    </div>
  );
}
