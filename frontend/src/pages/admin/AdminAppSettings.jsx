import { useEffect, useState } from 'react';
import api from '../../lib/api';
import DashboardLayout from '../../components/dashboard/DashboardLayout';

export default function AdminAppSettings() {
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get('/settings').then(({ data }) => {
      setForm(data.data || {});
    }).finally(() => setLoading(false));
  }, []);

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/settings', form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {}
    setSaving(false);
  };

  if (loading) return <DashboardLayout><div className="py-20 text-center text-slate-400">جارٍ التحميل...</div></DashboardLayout>;

  const Field = ({ label, name, type = 'text', placeholder, dir }) => (
    <div>
      <label className="mb-1 block text-sm font-semibold">{label}</label>
      {type === 'textarea' ? (
        <textarea name={name} rows={4} value={form[name] || ''} onChange={set(name)} placeholder={placeholder}
          className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800" dir={dir} />
      ) : (
        <input name={name} type={type} value={form[name] || ''} onChange={set(name)} placeholder={placeholder}
          className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800" dir={dir} />
      )}
    </div>
  );

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">إعدادات التطبيق</h1>
        {saved && <span className="rounded-lg bg-green-100 px-4 py-2 text-sm text-green-700">✅ تم الحفظ</span>}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <section className="rounded-2xl border border-slate-200 p-6 dark:border-slate-800">
          <h2 className="mb-4 text-lg font-bold">معلومات المنصة</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="اسم المنصة" name="appName" />
            <Field label="وصف المنصة" name="appDescription" />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 p-6 dark:border-slate-800">
          <h2 className="mb-4 text-lg font-bold">معلومات التواصل</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="البريد الإلكتروني" name="contactEmail" type="email" />
            <Field label="رقم الهاتف" name="contactPhone" type="tel" dir="ltr" />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 p-6 dark:border-slate-800">
          <h2 className="mb-4 text-lg font-bold">روابط التواصل الاجتماعي</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="فيسبوك" name="socialFacebook" placeholder="https://facebook.com/..." />
            <Field label="تويتر" name="socialTwitter" placeholder="https://twitter.com/..." />
            <Field label="إنستغرام" name="socialInstagram" placeholder="https://instagram.com/..." />
            <Field label="واتساب" name="socialWhatsApp" placeholder="https://wa.me/..." />
            <Field label="تيليغرام" name="socialTelegram" placeholder="https://t.me/..." />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 p-6 dark:border-slate-800">
          <h2 className="mb-4 text-lg font-bold">المحتوى</h2>
          <div className="space-y-4">
            <Field label="عن التطبيق" name="aboutText" type="textarea" />
            <Field label="الشروط والأحكام" name="termsText" type="textarea" />
            <Field label="سياسة الخصوصية" name="privacyText" type="textarea" />
          </div>
        </section>

        <div className="flex justify-end">
          <button type="submit" disabled={saving}
            className="rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-brand-700 disabled:opacity-50">
            {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
          </button>
        </div>
      </form>
    </DashboardLayout>
  );
}
