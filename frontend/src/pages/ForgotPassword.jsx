import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [token, setToken] = useState(null);
  const [err, setErr] = useState(null);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setErr(null);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setSent(true);
      if (data.data?.token) setToken(data.data.token);
    } catch (ex) {
      setErr(ex.response?.data?.message || 'فشل الإرسال');
    }
  };

  if (sent && token) {
    return <ResetPassword initialToken={token} email={email} />;
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold">استعادة كلمة المرور</h1>
      {sent ? (
        <div className="mt-8 rounded-lg bg-green-50 p-4 text-sm text-green-700">
          إذا كان البريد مسجلاً، سيصلك رابط استعادة. {token && <p className="mt-2">رمز الاستعادة (وضع التطوير): <code className="font-mono">{token}</code></p>}
          <button onClick={() => setToken(null)} className="mt-3 text-brand-600 underline">إدخال الرمز</button>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-8 space-y-4">
          {err && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{err}</div>}
          <p className="text-sm text-slate-500">أدخل بريدك الإلكتروني وسنرسل لك رمز استعادة كلمة المرور.</p>
          <input
            type="email"
            placeholder="البريد الإلكتروني"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-slate-300 p-3 dark:border-slate-700 dark:bg-slate-800"
          />
          <button className="w-full rounded-lg bg-brand-600 p-3 font-bold text-white">إرسال</button>
          <p className="text-center text-sm">
            <Link to="/login" className="text-brand-600">رجوع لتسجيل الدخول</Link>
          </p>
        </form>
      )}
      {sent && !token && (
        <ResetPassword />
      )}
    </div>
  );
}

function ResetPassword({ initialToken, email: initialEmail }) {
  const [token, setToken] = useState(initialToken || '');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setErr(null);
    if (password !== confirm) return setErr('كلمتا المرور غير متطابقتين');
    if (password.length < 8) return setErr('كلمة المرور قصيرة جداً');
    try {
      await api.post('/auth/reset-password', { token, password });
      setMsg('تم تغيير كلمة المرور بنجاح');
      setTimeout(() => navigate('/login'), 2000);
    } catch (ex) {
      setErr(ex.response?.data?.message || 'فشل التغيير');
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold">كلمة المرور الجديدة</h1>
      <form onSubmit={submit} className="mt-8 space-y-4">
        {err && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{err}</div>}
        {msg && <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">{msg}</div>}
        {!initialToken && (
          <input
            placeholder="رمز الاستعادة"
            required
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="w-full rounded-lg border border-slate-300 p-3 dark:border-slate-700 dark:bg-slate-800"
          />
        )}
        <input
          type="password"
          placeholder="كلمة المرور الجديدة"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-slate-300 p-3 dark:border-slate-700 dark:bg-slate-800"
        />
        <input
          type="password"
          placeholder="تأكيد كلمة المرور"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full rounded-lg border border-slate-300 p-3 dark:border-slate-700 dark:bg-slate-800"
        />
        <button className="w-full rounded-lg bg-brand-600 p-3 font-bold text-white">تغيير كلمة المرور</button>
      </form>
    </div>
  );
}
