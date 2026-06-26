import { useEffect, useState } from 'react';
import api from '../../lib/api';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import DataTable from '../../components/dashboard/DataTable';

const statusColors = {
  scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-700/20 dark:text-blue-300',
  live: 'bg-red-100 text-red-700 dark:bg-red-700/20 dark:text-red-300',
  ended: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  cancelled: 'bg-amber-100 text-amber-700 dark:bg-amber-700/20 dark:text-amber-300',
};

export default function AdminSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');

  const load = () => {
    setLoading(true);
    api.get('/sessions', { params: status ? { status } : {} }).then((r) => setSessions(r.data.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [status]);

  const columns = [
    { key: 'id', label: '#' },
    { key: 'title', label: 'العنوان' },
    { key: 'teacher', label: 'المدرس', render: (r) => r.teacher?.user?.name || '—' },
    { key: 'subject', label: 'المادة', render: (r) => r.subject?.name || '—' },
    { key: 'scheduled_at', label: 'الموعد', render: (r) => new Date(r.scheduled_at).toLocaleString('ar-EG') },
    { key: 'price', label: 'السعر' },
    {
      key: 'status', label: 'الحالة',
      render: (r) => <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[r.status]}`}>{r.status}</span>,
    },
  ];

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">إدارة الحصص</h1>
        <select value={status} onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-slate-300 p-2 text-sm dark:border-slate-700 dark:bg-slate-800">
          <option value="">الكل</option>
          <option value="scheduled">مجدولة</option>
          <option value="live">مباشر</option>
          <option value="ended">منتهية</option>
          <option value="cancelled">ملغاة</option>
        </select>
      </div>
      <div className="mt-6">
        <DataTable columns={columns} data={sessions} loading={loading} />
      </div>
    </DashboardLayout>
  );
}
