import { useState } from 'react';
import api from '../lib/api';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { useAuth } from '../context/AuthContext';

const ROLE_SPECIFIC = {
  student: ['grade'],
  teacher: ['specialization', 'bio'],
};

const GRADE_OPTIONS = [
  'الأول الابتدائي', 'الثاني الابتدائي', 'الثالث الابتدائي',
  'الرابع الابتدائي', 'الخامس الابتدائي', 'السادس الابتدائي',
  'الأول المتوسط', 'الثاني المتوسط', 'الثالث المتوسط',
  'الأول الثانوي', 'الثاني الثانوي', 'الثالث الثانوي',
  'جامعي',
];

export default function Profile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    grade: user?.grade || '',
    specialization: user?.specialization || '',
    bio: user?.bio || '',
  });
  const [pwd, setPwd] = useState({ old: '', password: '', confirm: '' });
  const [msg, setMsg] = useState(null);
  const [saving, setSaving] = useState(false);

  const role = user?.role?.name || user?.role || '';
  const extraFields = ROLE_SPECIFIC[role] || [];

  const initials = (user?.name || '?').charAt(0).toUpperCase();

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { name: form.name, phone: form.phone };
      if (extraFields.includes('grade')) payload.grade = form.grade;
      if (extraFields.includes('specialization')) payload.specialization = form.specialization;
      if (extraFields.includes('bio')) payload.bio = form.bio;
      const { data } = await api.put(`/users/${user.id}`, payload);
      setUser({ ...user, ...data.data });
      setMsg({ type: 'ok', text: 'تم حفظ البيانات' });
    } catch (ex) {
      setMsg({ type: 'err', text: ex.response?.data?.message || 'فشل الحفظ' });
    } finally {
      setSaving(false);
    }
  };

  const changePwd = async (e) => {
    e.preventDefault();
    if (pwd.password !== pwd.confirm) return setMsg({ type: 'err', text: 'كلمتا المرور غير متطابقتين' });
    if (pwd.password.length < 8) return setMsg({ type: 'err', text: 'كلمة المرور قصيرة' });
    try {
      await api.post('/auth/change-password', { oldPassword: pwd.old, newPassword: pwd.password });
      setPwd({ old: '', password: '', confirm: '' });
      setMsg({ type: 'ok', text: 'تم تغيير كلمة المرور' });
    } catch (ex) {
      setMsg({ type: 'err', text: ex.response?.data?.message || 'فشل تغيير كلمة المرور' });
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold">الملف الشخصي</h1>

      {msg && (
        <div className={`mt-4 rounded-lg p-3 text-sm ${msg.type === 'ok' ? 'bg-green-50 text-green-700 dark:bg-green-700/20 dark:text-green-300' : 'bg-red-50 text-red-700 dark:bg-red-700/20 dark:text-red-300'}`}>
          {msg.text}
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-slate-200 p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-600 text-3xl font-bold text-white">
            {initials}
          </div>
          <div>
            <p className="text-lg font-bold">{user?.name}</p>
            <p className="text-sm text-slate-500">{user?.email}</p>
            <button className="mt-1 rounded-lg border border-slate-300 px-3 py-1 text-xs text-slate-500 transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">
              تغيير الصورة
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <form onSubmit={saveProfile} className="rounded-2xl border border-slate-200 p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 text-lg font-bold">البيانات الأساسية</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">👤 الاسم</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800" />
            </div>
            <div>
              <label className="text-sm font-medium">📧 البريد الإلكتروني</label>
              <input value={user?.email} disabled
                className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-100 p-2 dark:border-slate-700 dark:bg-slate-800" />
            </div>
            <div>
              <label className="text-sm font-medium">📞 الهاتف</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800" />
            </div>
            {extraFields.includes('grade') && (
              <div>
                <label className="text-sm font-medium">📚 المرحلة الدراسية</label>
                <select value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800">
                  <option value="">اختر المرحلة</option>
                  {GRADE_OPTIONS.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            )}
            {extraFields.includes('specialization') && (
              <div>
                <label className="text-sm font-medium">🎯 التخصص</label>
                <input value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800" />
              </div>
            )}
            {extraFields.includes('bio') && (
              <div>
                <label className="text-sm font-medium">📝 السيرة الذاتية</label>
                <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3}
                  className="mt-1 w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800" />
              </div>
            )}
            <button disabled={saving} className="w-full rounded-lg bg-brand-600 py-2 font-bold text-white transition hover:bg-brand-700 disabled:opacity-50">
              {saving ? 'جارٍ الحفظ...' : 'حفظ'}
            </button>
          </div>
        </form>

        <form onSubmit={changePwd} className="rounded-2xl border border-slate-200 p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 text-lg font-bold">🔒 تغيير كلمة المرور</h2>
          <div className="space-y-3">
            <input type="password" placeholder="🔑 كلمة المرور الحالية" value={pwd.old}
              onChange={(e) => setPwd({ ...pwd, old: e.target.value })}
              className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800" required />
            <input type="password" placeholder="🔑 كلمة المرور الجديدة" value={pwd.password}
              onChange={(e) => setPwd({ ...pwd, password: e.target.value })}
              className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800" required />
            <input type="password" placeholder="🔑 تأكيد كلمة المرور" value={pwd.confirm}
              onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })}
              className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800" required />
            <button className="w-full rounded-lg bg-brand-600 py-2 font-bold text-white transition hover:bg-brand-700">تغيير</button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
