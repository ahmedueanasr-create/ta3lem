import { useEffect, useState } from 'react';
import api from '../../lib/api';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useAuth } from '../../context/AuthContext';

export default function TeacherProfile() {
  const { user, setUser } = useAuth();
  const [teacher, setTeacher] = useState(null);
  const [pricing, setPricing] = useState({ session_price: 0, private_session_price: 0, monthly_price: 0, yearly_price: 0 });
  const [profile, setProfile] = useState({ bio: '', specialization: '' });
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    api.get(`/teachers/${user.id}`).then((r) => {
      setTeacher(r.data.data);
      setProfile({ bio: r.data.data.bio || '', specialization: r.data.data.specialization || '' });
      if (r.data.data.pricing) setPricing(r.data.data.pricing);
    });
  }, [user]);

  const savePricing = async () => {
    try {
      await api.put(`/teachers/${user.id}/pricing`, pricing);
      setMsg({ type: 'ok', text: 'تم حفظ الأسعار' });
    } catch (ex) {
      setMsg({ type: 'err', text: ex.response?.data?.message || 'فشل' });
    }
  };

  const saveProfile = async () => {
    try {
      await api.put(`/teachers/${user.id}/pricing`, pricing); // ensure pricing row exists
      const { data } = await api.put(`/users/${user.id}`, { name: user.name, phone: user.phone });
      setUser(data.data);
      setMsg({ type: 'ok', text: 'تم حفظ البيانات' });
    } catch (ex) {
      setMsg({ type: 'err', text: 'فشل الحفظ' });
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold">ملفي وتسعيري</h1>

      {msg && (
        <div className={`mt-4 rounded-lg p-3 text-sm ${msg.type === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {msg.text}
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Profile */}
        <div className="rounded-2xl border border-slate-200 p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 text-lg font-bold">البيانات المهنية</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">السيرة الذاتية</label>
              <textarea rows="4" value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800" />
            </div>
            <div>
              <label className="text-sm font-medium">التخصص</label>
              <input value={profile.specialization}
                onChange={(e) => setProfile({ ...profile, specialization: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800" />
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
              <span className="text-sm text-slate-500">الحالة:</span>
              <span className={`rounded-full px-3 py-0.5 text-xs font-medium ${teacher?.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                {teacher?.status === 'approved' ? 'معتمد ✓' : teacher?.status || '—'}
              </span>
              <span className="text-sm text-slate-500">التقييم: {teacher?.rating || 0} ★</span>
            </div>
            <button onClick={saveProfile} className="w-full rounded-lg bg-brand-600 py-2 font-bold text-white">حفظ البيانات</button>
          </div>
        </div>

        {/* Pricing */}
        <div className="rounded-2xl border border-slate-200 p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 text-lg font-bold">أسعاري</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">سعر الحصة العادية (ج.م)</label>
              <input type="number" step="0.01" value={pricing.session_price}
                onChange={(e) => setPricing({ ...pricing, session_price: parseFloat(e.target.value) })}
                className="mt-1 w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800" />
            </div>
            <div>
              <label className="text-sm font-medium">سعر الحصة الخاصة (ج.م)</label>
              <input type="number" step="0.01" value={pricing.private_session_price}
                onChange={(e) => setPricing({ ...pricing, private_session_price: parseFloat(e.target.value) })}
                className="mt-1 w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">شهري (ج.م)</label>
                <input type="number" step="0.01" value={pricing.monthly_price}
                  onChange={(e) => setPricing({ ...pricing, monthly_price: parseFloat(e.target.value) })}
                  className="mt-1 w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800" />
              </div>
              <div>
                <label className="text-sm font-medium">سنوي (ج.م)</label>
                <input type="number" step="0.01" value={pricing.yearly_price}
                  onChange={(e) => setPricing({ ...pricing, yearly_price: parseFloat(e.target.value) })}
                  className="mt-1 w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800" />
              </div>
            </div>
            <button onClick={savePricing} className="w-full rounded-lg bg-brand-600 py-2 font-bold text-white">حفظ الأسعار</button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
