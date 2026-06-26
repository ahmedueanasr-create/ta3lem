import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

export default function Login() {
  const { login, setUser } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState('credentials'); // 'credentials' | 'otp'
  const [form, setForm] = useState({ email: '', password: '' });
  const [otp, setOtp] = useState('');
  const [tempToken, setTempToken] = useState(null);
  const [devOtp, setDevOtp] = useState(null);
  const [phoneHint, setPhoneHint] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  const submitCredentials = async (e) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      if (data.data.requiresOtp) {
        setTempToken(data.data.tempToken);
        setDevOtp(data.data.devOtp || null);
        setPhoneHint(data.data.phone);
        setStep('otp');
      }
    } catch (ex) {
      setErr(ex.response?.data?.message || 'فشل تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  const submitOtp = async (e) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const { data } = await api.post('/auth/verify-otp', { tempToken, otp });
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      setUser(data.data.user);

      // Teacher first login → onboarding
      if (data.data.mustChangePassword || data.data.firstLogin) {
        navigate('/teacher/onboarding');
      } else {
        navigate('/dashboard');
      }
    } catch (ex) {
      setErr(ex.response?.data?.message || 'رمز التحقق غير صحيح');
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    setErr(null);
    try {
      const { data } = await api.post('/auth/resend-otp', { tempToken });
      setDevOtp(data.data.devOtp || null);
      setErr(null);
    } catch (ex) {
      setErr('فشل إعادة الإرسال');
    }
  };

  if (step === 'otp') {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <h1 className="text-2xl font-bold">رمز التحقق</h1>
        <p className="mt-2 text-sm text-slate-500">
          تم إرسال رمز التحقق إلى رقم هاتفك{phoneHint ? ` ${phoneHint}` : ''} عبر واتساب.
        </p>

        {devOtp && (
          <div className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
            📱 وضع التطوير — رمز التحقق: <span className="font-mono font-bold">{devOtp}</span>
            <br />
            <span className="text-xs">(واتساب غير متصل، الرمز معروض هنا للاختبار)</span>
          </div>
        )}

        <form onSubmit={submitOtp} className="mt-8 space-y-4">
          {err && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{err}</div>}
          <input
            inputMode="numeric"
            maxLength="6"
            placeholder="أدخل الرمز المكوّن من 6 أرقام"
            required
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="w-full rounded-lg border border-slate-300 p-3 text-center text-2xl tracking-widest dark:border-slate-700 dark:bg-slate-800"
          />
          <button disabled={loading} className="w-full rounded-lg bg-brand-600 p-3 font-bold text-white disabled:opacity-50">
            {loading ? 'جارٍ التحقق...' : 'تحقق'}
          </button>
          <div className="flex justify-between text-sm">
            <button type="button" onClick={resendOtp} className="text-brand-600">إعادة إرسال الرمز</button>
            <button type="button" onClick={() => setStep('credentials')} className="text-slate-500">تغيير البيانات</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold">تسجيل الدخول</h1>
      <form onSubmit={submitCredentials} className="mt-8 space-y-4">
        {err && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{err}</div>}
        <input
          type="email"
          placeholder="البريد الإلكتروني"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full rounded-lg border border-slate-300 p-3 dark:border-slate-700 dark:bg-slate-800"
        />
        <input
          type="password"
          placeholder="كلمة المرور"
          required
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full rounded-lg border border-slate-300 p-3 dark:border-slate-700 dark:bg-slate-800"
        />
        <button disabled={loading} className="w-full rounded-lg bg-brand-600 p-3 font-bold text-white disabled:opacity-50">
          {loading ? 'جارٍ الإرسال...' : 'متابعة'}
        </button>
        <div className="flex justify-between text-sm">
          <Link to="/forgot-password" className="text-slate-500 hover:text-brand-600">نسيت كلمة المرور؟</Link>
          <Link to="/register" className="text-brand-600">سجّل الآن</Link>
        </div>
        <p className="mt-4 text-center text-xs text-slate-400">
          هل أنت ولي أمر؟ <Link to="/parent/register" className="text-brand-600 hover:underline">سجل الآن</Link>
        </p>
      </form>
    </div>
  );
}
