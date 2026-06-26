import { useEffect, useState } from 'react';
import api from '../../lib/api';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import Modal from '../../components/dashboard/Modal';

export default function TeacherHomework() {
  const [hw, setHw] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', due_at: '' });
  const [subs, setSubs] = useState(null);
  const [gradeForm, setGradeForm] = useState({ score: '', feedback: '' });

  const load = () => {
    setLoading(true);
    api.get('/homework').then((r) => setHw(r.data.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    await api.post('/homework', form);
    setOpen(false);
    setForm({ title: '', description: '', due_at: '' });
    load();
  };

  const viewSubs = async (h) => {
    const { data } = await api.get(`/homework/${h.id}`);
    setSubs(data.data);
  };

  const grade = async (subId) => {
    await api.post(`/homework/submissions/${subId}/grade`, gradeForm);
    setSubs(null);
    load();
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">الواجبات</h1>
        <button onClick={() => setOpen(true)} className="rounded-lg bg-brand-600 px-4 py-2 text-sm text-white">+ واجب جديد</button>
      </div>

      <div className="mt-6 space-y-3">
        {loading && <p className="text-slate-400">جارٍ التحميل...</p>}
        {!loading && hw.length === 0 && <p className="text-slate-400">لا توجد واجبات</p>}
        {hw.map((h) => (
          <div key={h.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-4 dark:border-slate-800 dark:bg-slate-900">
            <div>
              <p className="font-semibold">{h.title}</p>
              <p className="text-xs text-slate-500">التسليم: {new Date(h.due_at).toLocaleString('ar-EG')}</p>
            </div>
            <button onClick={() => viewSubs(h)} className="rounded-lg bg-slate-600 px-3 py-1.5 text-xs text-white">
              التسليمات ({h.submissions?.length || 0})
            </button>
          </div>
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="واجب جديد">
        <div className="space-y-3">
          <input placeholder="العنوان" value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800" />
          <textarea placeholder="الوصف" rows="3" value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800" />
          <input type="datetime-local" value={form.due_at}
            onChange={(e) => setForm({ ...form, due_at: e.target.value })}
            className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800" />
          <button onClick={create} className="w-full rounded-lg bg-brand-600 py-2 font-bold text-white">إنشاء</button>
        </div>
      </Modal>

      <Modal open={!!subs} onClose={() => setSubs(null)} title="تسليمات الطلاب">
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {subs?.submissions?.length === 0 && <p className="text-slate-400">لا توجد تسليمات</p>}
          {subs?.submissions?.map((s) => (
            <div key={s.id} className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
              <p className="text-sm font-semibold">طالب #{s.user_id}</p>
              <p className="text-sm text-slate-500">{s.content || 'ملف مرفق'}</p>
              {s.status === 'submitted' ? (
                <div className="mt-2 flex gap-2">
                  <input type="number" placeholder="درجة" min="0" max="100"
                    onChange={(e) => setGradeForm({ ...gradeForm, score: parseFloat(e.target.value) })}
                    className="w-20 rounded border border-slate-300 p-1 text-sm dark:border-slate-700 dark:bg-slate-800" />
                  <input placeholder="ملاحظات"
                    onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })}
                    className="flex-1 rounded border border-slate-300 p-1 text-sm dark:border-slate-700 dark:bg-slate-800" />
                  <button onClick={() => grade(s.id)} className="rounded bg-green-600 px-2 text-xs text-white">تصحيح</button>
                </div>
              ) : (
                <p className="mt-1 text-xs text-green-600">تم التصحيح: {s.score}/100</p>
              )}
            </div>
          ))}
        </div>
      </Modal>
    </DashboardLayout>
  );
}
