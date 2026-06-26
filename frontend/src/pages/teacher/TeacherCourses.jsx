import { useEffect, useState } from 'react';
import api from '../../lib/api';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import Modal from '../../components/dashboard/Modal';

export default function TeacherCourses() {
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', subject_id: '', description: '', price: 0, is_private: false });

  const load = () => {
    setLoading(true);
    api.get('/courses').then((r) => setCourses(r.data.data)).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    api.get('/subjects').then((r) => setSubjects(r.data.data));
  }, []);

  const create = async () => {
    await api.post('/courses', form);
    setOpen(false);
    setForm({ title: '', subject_id: '', description: '', price: 0, is_private: false });
    load();
  };

  const remove = async (id) => {
    if (!confirm('حذف الكورس؟')) return;
    await api.delete(`/courses/${id}`);
    load();
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">كورساتي</h1>
        <button onClick={() => setOpen(true)} className="rounded-lg bg-brand-600 px-4 py-2 text-sm text-white">+ كورس جديد</button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading && <p className="text-slate-400">جارٍ التحميل...</p>}
        {!loading && courses.length === 0 && <p className="text-slate-400">لا توجد كورسات</p>}
        {courses.map((c) => (
          <div key={c.id} className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between">
              <h3 className="font-bold">{c.title}</h3>
              {c.is_private && <span className="rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-700">خاص</span>}
            </div>
            <p className="mt-1 text-sm text-slate-500">{c.subject?.name}</p>
            <p className="mt-2 text-sm text-slate-500 line-clamp-2">{c.description}</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="font-bold text-brand-600">{c.price} ج.م</span>
              <button onClick={() => remove(c.id)} className="text-xs text-red-600 hover:underline">حذف</button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="كورس جديد">
        <div className="space-y-3">
          <input placeholder="عنوان الكورس" value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800" />
          <select value={form.subject_id} onChange={(e) => setForm({ ...form, subject_id: parseInt(e.target.value) })}
            className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800">
            <option value="">اختر مادة</option>
            {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <textarea placeholder="الوصف" rows="3" value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800" />
          <input type="number" step="0.01" placeholder="السعر" value={form.price}
            onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) })}
            className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800" />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.is_private}
              onChange={(e) => setForm({ ...form, is_private: e.target.checked })} /> كورس خاص
          </label>
          <button onClick={create} className="w-full rounded-lg bg-brand-600 py-2 font-bold text-white">إنشاء</button>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
