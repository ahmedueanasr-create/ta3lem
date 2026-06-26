import { useEffect, useState } from 'react';
import api from '../../lib/api';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import Modal from '../../components/dashboard/Modal';

export default function StudentExams() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [taking, setTaking] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  const load = () => {
    setLoading(true);
    api.get('/exams').then((r) => setExams(r.data.data.filter((e) => e.is_published))).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const startExam = async (exam) => {
    const { data } = await api.post(`/exams/${exam.id}/attempts`);
    setAttempt(data.data);
    setTaking(exam);
    setAnswers({});
    setResult(null);
  };

  const submit = async () => {
    const payload = Object.entries(answers).map(([qid, answer]) => ({ question_id: parseInt(qid), answer }));
    const { data } = await api.post(`/exams/attempts/${attempt.id}/submit`, { answers: payload });
    setResult(data.data);
    setTaking(null);
    setAttempt(null);
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold">اختباراتي</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading && <p className="text-slate-400">جارٍ التحميل...</p>}
        {!loading && exams.length === 0 && <p className="text-slate-400">لا توجد اختبارات متاحة</p>}
        {exams.map((e) => (
          <div key={e.id} className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="font-bold">{e.title}</h3>
            <p className="mt-1 text-sm text-slate-500">{e.questions?.length || 0} سؤال · {e.duration_min} دقيقة</p>
            <p className="text-sm text-slate-500">درجة النجاح: {e.pass_score}%</p>
            <button onClick={() => startExam(e)} className="mt-3 w-full rounded-lg bg-brand-600 py-2 text-sm font-bold text-white">
              ابدأ الاختبار
            </button>
          </div>
        ))}
      </div>

      <Modal open={!!taking} onClose={() => setTaking(null)} title={taking?.title}>
        <div className="max-h-[70vh] space-y-4 overflow-y-auto">
          {taking?.questions?.map((q, i) => (
            <div key={q.id} className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
              <p className="font-semibold">{i + 1}. {q.text}</p>
              <div className="mt-2 space-y-2">
                {q.type === 'mcq' && (q.options || []).map((opt, oi) => (
                  <label key={oi} className="flex items-center gap-2 text-sm">
                    <input type="radio" name={`q-${q.id}`} value={oi}
                      onChange={() => setAnswers({ ...answers, [q.id]: String(oi) })} />
                    {opt}
                  </label>
                ))}
                {q.type === 'truefalse' && (
                  <div className="flex gap-4 text-sm">
                    <label className="flex items-center gap-1">
                      <input type="radio" name={`q-${q.id}`} value="true"
                        onChange={() => setAnswers({ ...answers, [q.id]: 'true' })} /> صح
                    </label>
                    <label className="flex items-center gap-1">
                      <input type="radio" name={`q-${q.id}`} value="false"
                        onChange={() => setAnswers({ ...answers, [q.id]: 'false' })} /> خطأ
                    </label>
                  </div>
                )}
              </div>
            </div>
          ))}
          <button onClick={submit} className="w-full rounded-lg bg-green-600 py-2 font-bold text-white">
            تسليم الاختبار
          </button>
        </div>
      </Modal>

      <Modal open={!!result} onClose={() => { setResult(null); load(); }} title="نتيجة الاختبار">
        <div className="text-center">
          <p className={`text-4xl font-bold ${result?.passed ? 'text-green-600' : 'text-red-600'}`}>
            {result?.score}%
          </p>
          <p className="mt-2 text-lg">{result?.passed ? '🎉 نجحت!' : ' لم تنجح هذه المرة'}</p>
          {result?.certificateId && (
            <p className="mt-3 rounded-lg bg-green-50 p-3 text-sm text-green-700">
              🏆 رقم الشهادة: {result.certificateId}
            </p>
          )}
        </div>
      </Modal>
    </DashboardLayout>
  );
}
