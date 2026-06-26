import { useEffect, useState } from 'react';
import api from '../../lib/api';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import DataTable from '../../components/dashboard/DataTable';
import Modal from '../../components/dashboard/Modal';

const statusColors = {
  approved: 'bg-green-100 text-green-700 dark:bg-green-700/20 dark:text-green-300',
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-700/20 dark:text-amber-300',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-700/20 dark:text-red-300',
};

export default function AdminTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [prices, setPrices] = useState({});

  const load = () => {
    setLoading(true);
    api.get('/teachers').then((r) => setTeachers(r.data.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const approve = async (id) => { await api.post(`/teachers/${id}/approve`); load(); };
  const reject = async (id) => { await api.post(`/teachers/${id}/reject`); load(); };

  const openPricing = (t) => {
    setEditing(t);
    setPrices(t.pricing || { session_price: 0, private_session_price: 0, monthly_price: 0, yearly_price: 0 });
  };

  const savePricing = async () => {
    await api.put(`/teachers/${editing.user_id}/pricing`, prices);
    setEditing(null);
    load();
  };

  const columns = [
    { key: 'user_id', label: '#' },
    { key: 'name', label: 'الاسم', render: (r) => r.user?.name },
    { key: 'email', label: 'البريد', render: (r) => r.user?.email },
    { key: 'specialization', label: 'التخصص' },
    { key: 'rating', label: 'التقييم' },
    {
      key: 'status', label: 'الحالة',
      render: (r) => <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[r.status]}`}>{r.status}</span>,
    },
    {
      key: 'actions', label: 'إجراءات',
      render: (r) => (
        <div className="flex gap-2">
          {r.status === 'pending' && (
            <>
              <button onClick={() => approve(r.user_id)} className="rounded bg-green-600 px-2 py-1 text-xs text-white">اعتماد</button>
              <button onClick={() => reject(r.user_id)} className="rounded bg-red-600 px-2 py-1 text-xs text-white">رفض</button>
            </>
          )}
          <button onClick={() => openPricing(r)} className="rounded bg-slate-600 px-2 py-1 text-xs text-white">الأسعار</button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold">إدارة المدرسين</h1>
      <div className="mt-6">
        <DataTable columns={columns} data={teachers} loading={loading} />
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="تعديل أسعار المدرس">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">سعر الحصة العادية</label>
            <input type="number" step="0.01" value={prices.session_price || 0}
              onChange={(e) => setPrices({ ...prices, session_price: parseFloat(e.target.value) })}
              className="mt-1 w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800" />
          </div>
          <div>
            <label className="text-sm font-medium">سعر الحصة الخاصة</label>
            <input type="number" step="0.01" value={prices.private_session_price || 0}
              onChange={(e) => setPrices({ ...prices, private_session_price: parseFloat(e.target.value) })}
              className="mt-1 w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800" />
          </div>
          <div>
            <label className="text-sm font-medium">الاشتراك الشهري</label>
            <input type="number" step="0.01" value={prices.monthly_price || 0}
              onChange={(e) => setPrices({ ...prices, monthly_price: parseFloat(e.target.value) })}
              className="mt-1 w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800" />
          </div>
          <div>
            <label className="text-sm font-medium">الاشتراك السنوي</label>
            <input type="number" step="0.01" value={prices.yearly_price || 0}
              onChange={(e) => setPrices({ ...prices, yearly_price: parseFloat(e.target.value) })}
              className="mt-1 w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800" />
          </div>
          <button onClick={savePricing} className="w-full rounded-lg bg-brand-600 py-2 font-bold text-white">حفظ</button>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
