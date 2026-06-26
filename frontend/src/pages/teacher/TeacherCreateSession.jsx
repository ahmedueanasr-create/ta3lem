import { useEffect, useState } from 'react';
import api from '../../lib/api';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useNavigate } from 'react-router-dom';

export default function TeacherCreateSession() {
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState({
    title: '', subject_id: '', scheduled_at: '', duration_min: 60, price: 0, description: '', is_private: false,
  });
  const [err, setErr] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/subjects').then((r) => setSubjects(r.data.data));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setErr(null);
    try {
      await api.post('/sessions', form);
      navigate('/teacher/sessions');
    } catch (ex) {
      setErr(ex.response?.data?.message || 'فشل الإنشاء');
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold">إنشاء حصة جديدة</h1>

      <form onSubmit={submit} className="mt-6 max-w-2xl space-y-4">
        {err && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{err}</div>}
        <div>
          <label className="text-sm font-medium">عنوان الحصة</label>
          <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800" />
        </div>
        <div>
          <label className="text-sm font-medium">المادة</label>
          <select required value={form.subject_id} onChange={(e) => setForm({ ...form, subject_id: parseInt(e.target.value) })}
            className="mt-1 w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800">
            <option value="">اختر مادة</option>
            {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">موعد الحصة</label>
          <input type="datetime-local" required value={form.scheduled_at}
            onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">المدة (دقيقة)</label>
            <input type="number" min="15" value={form.duration_min}
              onChange={(e) => setForm({ ...form, duration_min: parseInt(e.target.value) })}
              className="mt-1 w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800" />
          </div>
          <div>
            <label className="text-sm font-medium">السعر</label>
            <input type="number" step="0.01" min="0" value={form.price}
              onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) })}
              className="mt-1 w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800" />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">الوصف</label>
          <textarea rows="3" value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800" />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.is_private}
            onChange={(e) => setForm({ ...form, is_private: e.target.checked })} />
          حصة خاصة
        </label>
        <button className="rounded-lg bg-brand-600 px-6 py-2.5 font-bold text-white">إنشاء الحصة</button>
      </form>
    </DashboardLayout>
  );
}
