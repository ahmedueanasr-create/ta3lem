import { useEffect, useState } from 'react';
import api from '../../lib/api';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import Modal from '../../components/dashboard/Modal';

export default function TeacherExams() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', duration_min: 60, pass_score: 50, questions: [] });

  const load = () => {
    setLoading(true);
    api.get('/exams').then((r) => setExams(r.data.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    await api.post('/exams', form);
    setOpen(false);
    setForm({ title: '', description: '', duration_min: 60, pass_score: 50, questions: [] });
    load();
  };

  const publish = async (id) => {
    await api.post(`/exams/${id}/publish`);
    load();
  };

  const addQuestion = () => {
    setForm({
      ...form,
      questions: [...form.questions, { type: 'mcq', text: '', options: ['', '', '', ''], correct_answer: '0', points: 1 }],
    });
  };

  const updateQ = (i, field, val) => {
    const qs = [...form.questions];
    qs[i] = { ...qs[i], [field]: val };
    setForm({ ...form, questions: qs });
  };

  const updateOpt = (qi, oi, val) => {
    const qs = [...form.questions];
    const opts = [...qs[qi].options];
    opts[oi] = val;
    qs[qi] = { ...qs[qi], options: opts };
    setForm({ ...form, questions: qs });
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">الاختبارات</h1>
        <button onClick={() => setOpen(true)} className="rounded-lg bg-brand-600 px-4 py-2 text-sm text-white">+ اختبار جديد</button>
      </div>

      <div className="mt-6 space-y-3">
        {loading && <p className="text-slate-400">جارٍ التحميل...</p>}
        {!loading && exams.length === 0 && <p className="text-slate-400">لا توجد اختبارات</p>}
        {exams.map((e) => (
          <div key={e.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-4 dark:border-slate-800 dark:bg-slate-900">
            <div>
              <p className="font-semibold">{e.title}</p>
              <p className="text-xs text-slate-500">{e.questions?.length || 0} سؤال · مدة {e.duration_min} دقيقة</p>
            </div>
            <div className="flex gap-2">
              {e.is_published ? (
                <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-700">منشور</span>
              ) : (
                <button onClick={() => publish(e.id)} className="rounded bg-green-600 px-3 py-1 text-xs text-white">نشر</button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="إنشاء اختبار">
        <div className="max-h-[70vh] space-y-3 overflow-y-auto">
          <input placeholder="عنوان الاختبار" value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800" />
          <textarea placeholder="الوصف" rows="2" value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800" />
          <div className="grid grid-cols-2 gap-3">
            <input type="number" placeholder="المدة (دقيقة)" value={form.duration_min}
              onChange={(e) => setForm({ ...form, duration_min: parseInt(e.target.value) })}
              className="rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800" />
            <input type="number" placeholder="درجة النجاح %" value={form.pass_score}
              onChange={(e) => setForm({ ...form, pass_score: parseFloat(e.target.value) })}
              className="rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800" />
          </div>

          <div className="border-t pt-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">الأسئلة ({form.questions.length})</h4>
              <button onClick={addQuestion} className="rounded bg-slate-600 px-2 py-1 text-xs text-white">+ سؤال</button>
            </div>
            {form.questions.map((q, i) => (
              <div key={i} className="mt-3 space-y-2 rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                <input placeholder={`نص السؤال ${i + 1}`} value={q.text}
                  onChange={(e) => updateQ(i, 'text', e.target.value)}
                  className="w-full rounded border border-slate-300 p-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
                <select value={q.type} onChange={(e) => updateQ(i, 'type', e.target.value)}
                  className="w-full rounded border border-slate-300 p-1 text-sm dark:border-slate-700 dark:bg-slate-800">
                  <option value="mcq">اختيار من متعدد</option>
                  <option value="truefalse">صح / خطأ</option>
                </select>
                {q.type === 'mcq' && q.options.map((opt, oi) => (
                  <input key={oi} placeholder={`خيار ${oi + 1}`} value={opt}
                    onChange={(e) => updateOpt(i, oi, e.target.value)}
                    className="w-full rounded border border-slate-300 p-1 text-sm dark:border-slate-700 dark:bg-slate-800" />
                ))}
                <input type="number" placeholder="رقم الإجابة الصحيحة (0-3)" value={q.correct_answer}
                  onChange={(e) => updateQ(i, 'correct_answer', e.target.value)}
                  className="w-full rounded border border-slate-300 p-1 text-sm dark:border-slate-700 dark:bg-slate-800" />
              </div>
            ))}
          </div>

          <button onClick={create} className="w-full rounded-lg bg-brand-600 py-2 font-bold text-white">إنشاء الاختبار</button>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
