import { useEffect, useState, useMemo } from 'react';
import api from '../../lib/api';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import DataTable from '../../components/dashboard/DataTable';
import Modal from '../../components/dashboard/Modal';

const statusColors = {
  present: 'bg-green-100 text-green-700 dark:bg-green-700/20 dark:text-green-300',
  absent: 'bg-red-100 text-red-700 dark:bg-red-700/20 dark:text-red-300',
  late: 'bg-amber-100 text-amber-700 dark:bg-amber-700/20 dark:text-amber-300',
};

export default function SupervisorStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [guardianMsg, setGuardianMsg] = useState('');
  const [guardianResult, setGuardianResult] = useState(null);
  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [attSummary, setAttSummary] = useState(null);

  const load = () => {
    setLoading(true);
    api.get('/reports/students').then((r) => {
      const data = r.data.data || [];
      setStudents(data);
      if (data.length > 0) {
        const totalAttPct = data.reduce((sum, s) => sum + (s.attendancePct || 0), 0);
        setAttSummary({ total: data.length, avgPct: Math.round(totalAttPct / data.length) });
      }
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const grades = useMemo(() => {
    return [...new Set(students.map(s => s.grade).filter(Boolean))];
  }, [students]);

  const filtered = useMemo(() => {
    let f = students;
    if (search) {
      const q = search.toLowerCase();
      f = f.filter(s => (s.user?.name || '').toLowerCase().includes(q));
    }
    if (gradeFilter) f = f.filter(s => s.grade === gradeFilter);
    return f;
  }, [students, search, gradeFilter]);

  const viewDetail = async (s) => {
    const { data } = await api.get(`/reports/student/${s.user_id}`);
    setDetail(data.data);
    const att = await api.get(`/reports/student/${s.user_id}/attendance`, { params: { limit: 20 } });
    setAttendance(att.data.data);
    setGuardianMsg(`مرحباً ${s.guardian_name || ''}، بخصوص الطالب ${s.user?.name}.`);
    setGuardianResult(null);
  };

  const contactGuardian = async () => {
    try {
      const { data } = await api.post(`/reports/student/${detail?.user_id || students.find(s=>s.user_id===detail?.user_id)?.user_id}/contact-guardian`, { message: guardianMsg });
      setGuardianResult(data.data);
    } catch (ex) {
      setGuardianResult({ status: 'failed', error: ex.response?.data?.message });
    }
  };

  const exportCSV = () => {
    const sep = ',';
    const rows = filtered.map(s => [
      s.user_id,
      s.user?.name || '',
      s.user?.email || '',
      s.grade || '',
      s.guardian_name || '',
      s.guardian_phone || '',
      s.attendancePct ?? ''
    ].map(c => `"${String(c).replace(/"/g, '""')}"`).join(sep));
    const header = ['#','الاسم','البريد','المرحلة','ولي الأمر','هاتف ولي الأمر','نسبة الحضور'].join(sep);
    const bom = '\uFEFF';
    const csv = bom + header + '\n' + rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'students.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const columns = [
    { key: 'user_id', label: '#' },
    { key: 'name', label: 'الاسم', render: (r) => r.user?.name },
    { key: 'email', label: 'البريد', render: (r) => r.user?.email },
    { key: 'grade', label: 'المرحلة' },
    { key: 'guardian_name', label: 'ولي الأمر' },
    { key: 'guardian_phone', label: 'هاتف ولي الأمر' },
    {
      key: 'actions', label: 'إجراءات',
      render: (r) => <button onClick={() => viewDetail(r)} className="rounded bg-brand-600 px-2 py-1 text-xs text-white">تفاصيل</button>,
    },
  ];

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold">متابعة الطلاب</h1>
      <p className="mt-1 text-slate-500">تقرير الحضور والغياب والتواصل مع أولياء الأمور</p>

      {attSummary && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs text-slate-500">إجمالي الطلاب</p>
            <p className="text-2xl font-bold">{attSummary.total}</p>
          </div>
          <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs text-slate-500">متوسط نسبة الحضور</p>
            <p className="text-2xl font-bold">{attSummary.avgPct}%</p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div className="h-2 rounded-full bg-green-500" style={{ width: `${attSummary.avgPct}%` }} />
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث بالاسم..."
          className="flex-1 rounded-lg border border-slate-300 bg-transparent px-4 py-2 text-sm min-w-[200px] dark:border-slate-700"
        />
        <select
          value={gradeFilter}
          onChange={(e) => setGradeFilter(e.target.value)}
          className="rounded-lg border border-slate-300 bg-transparent px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
        >
          <option value="">كل المراحل</option>
          {grades.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
        <button onClick={exportCSV} className="rounded-lg bg-green-600 px-4 py-2 text-sm font-bold text-white">تصدير CSV</button>
      </div>

      <div className="mt-4">
        <DataTable columns={columns} data={filtered} loading={loading} />
      </div>

      <Modal open={!!detail} onClose={() => setDetail(null)} title="تفاصيل الطالب">
        {detail && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg bg-green-50 p-3 dark:bg-green-700/20">
                <p className="text-2xl font-bold text-green-600">{detail.attended}</p>
                <p className="text-xs">حاضر</p>
              </div>
              <div className="rounded-lg bg-red-50 p-3 dark:bg-red-700/20">
                <p className="text-2xl font-bold text-red-600">{detail.absent}</p>
                <p className="text-xs">غائب</p>
              </div>
              <div className="rounded-lg bg-brand-50 p-3 dark:bg-brand-700/20">
                <p className="text-2xl font-bold text-brand-600">{detail.attendancePct}%</p>
                <p className="text-xs">نسبة الحضور</p>
              </div>
            </div>

            <div>
              <h4 className="mb-2 font-semibold text-sm">سجل الحضور</h4>
              <div className="max-h-40 space-y-1 overflow-y-auto">
                {attendance.length === 0 && <p className="text-xs text-slate-400">لا توجد سجلات</p>}
                {attendance.map((a) => (
                  <div key={a.id} className="flex items-center justify-between rounded bg-slate-50 p-2 text-xs dark:bg-slate-800">
                    <span>{a.session?.title || 'حصة'}</span>
                    <span className={`rounded-full px-2 py-0.5 ${statusColors[a.status]}`}>{a.status}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-3">
              <h4 className="mb-2 font-semibold text-sm">التواصل مع ولي الأمر</h4>
              <textarea value={guardianMsg} onChange={(e) => setGuardianMsg(e.target.value)} rows="3"
                className="w-full rounded-lg border border-slate-300 p-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
              <button onClick={contactGuardian} className="mt-2 w-full rounded-lg bg-green-600 py-2 text-sm font-bold text-white">
                إرسال واتساب لولي الأمر
              </button>
              {guardianResult && (
                <div className={`mt-2 rounded p-2 text-xs ${guardianResult.status === 'sent' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {guardianResult.status === 'sent' ? 'تم الإرسال ✓' : `فشل: ${guardianResult.error || ''}`}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
