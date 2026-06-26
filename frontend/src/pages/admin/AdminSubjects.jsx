import { useEffect, useState } from 'react';
import api from '../../lib/api';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import Modal from '../../components/dashboard/Modal';

export default function AdminSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', icon: '' });

  const load = () => {
    setLoading(true);
    api.get('/subjects').then((r) => setSubjects(r.data.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    await api.post('/subjects', form);
    setOpen(false);
    setForm({ name: '', description: '', icon: '' });
    load();
  };

  const toggle = async (s) => {
    await api.put(`/subjects/${s.id}`, { is_active: !s.is_active });
    load();
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">إدارة المواد</h1>
        <button onClick={() => setOpen(true)} className="rounded-lg bg-brand-600 px-4 py-2 text-sm text-white">+ مادة جديدة</button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading && <p className="text-slate-400">جارٍ التحميل...</p>}
        {!loading && subjects.length === 0 && <p className="text-slate-400">لا توجد مواد</p>}
        {subjects.map((s) => (
          <div key={s.id} className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="text-3xl">{s.icon || '📚'}</div>
            <h3 className="mt-2 font-bold">{s.name}</h3>
            <p className="mt-1 text-sm text-slate-500 line-clamp-2">{s.description}</p>
            <div className="mt-3 flex items-center justify-between">
              <span className={`rounded-full px-2 py-0.5 text-xs ${s.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                {s.is_active ? 'نشط' : 'متوقف'}
              </span>
              <button onClick={() => toggle(s)} className="text-xs text-brand-600 hover:underline">
                {s.is_active ? 'إيقاف' : 'تفعيل'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="إضافة مادة">
        <div className="space-y-3">
          <input placeholder="اسم المادة" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800" />
          <textarea placeholder="الوصف" value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800" />
          <input placeholder="أيقونة (إيموجي)" value={form.icon}
            onChange={(e) => setForm({ ...form, icon: e.target.value })}
            className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800" />
          <button onClick={create} className="w-full rounded-lg bg-brand-600 py-2 font-bold text-white">إضافة</button>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
