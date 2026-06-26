import { useEffect, useState } from 'react';
import api from '../../lib/api';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import DataTable from '../../components/dashboard/DataTable';
import Modal from '../../components/dashboard/Modal';

const statusColors = {
  active: 'bg-green-100 text-green-700 dark:bg-green-700/20 dark:text-green-300',
  suspended: 'bg-red-100 text-red-700 dark:bg-red-700/20 dark:text-red-300',
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-700/20 dark:text-amber-300',
  inactive: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
};

const ROLE_OPTIONS = [
  { value: 'student', label: 'طالب' },
  { value: 'teacher', label: 'معلم' },
  { value: 'super_admin', label: 'مشرف عام' },
  { value: 'platform_admin', label: 'مشرف منصة' },
];

const ALL_ROLES_OPTIONS = [
  { value: '', label: 'جميع الأدوار' },
  ...ROLE_OPTIONS,
];

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showCharge, setShowCharge] = useState(null);
  const [chargeAmount, setChargeAmount] = useState('');
  const [creating, setCreating] = useState(false);
  const [charging, setCharging] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '', email: '', password: '', phone: '', role: 'student',
  });

  const load = () => {
    setLoading(true);
    const params = { q };
    if (roleFilter) params.role = roleFilter;
    api.get('/users', { params }).then((r) => setUsers(r.data.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  useEffect(() => { load(); }, [roleFilter]);

  const setStatus = async (id, status) => {
    await api.patch(`/users/${id}/status`, { status });
    load();
  };

  const createUser = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post('/auth/register', createForm);
      setShowCreate(false);
      setCreateForm({ name: '', email: '', password: '', phone: '', role: 'student' });
      load();
    } catch {
    } finally {
      setCreating(false);
    }
  };

  const chargeWallet = async (e) => {
    e.preventDefault();
    if (!chargeAmount) return;
    setCharging(true);
    try {
      await api.post(`/users/${showCharge.id}/wallet/charge`, { amount: Number(chargeAmount) });
      setShowCharge(null);
      setChargeAmount('');
      load();
    } catch {
    } finally {
      setCharging(false);
    }
  };

  const columns = [
    { key: 'id', label: '#' },
    { key: 'name', label: 'الاسم' },
    { key: 'email', label: 'البريد' },
    { key: 'phone', label: 'الهاتف' },
    { key: 'role', label: 'الدور', render: (r) => r.role?.label || '—' },
    {
      key: 'status', label: 'الحالة',
      render: (r) => <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[r.status]}`}>{r.status}</span>,
    },
    {
      key: 'actions', label: 'إجراءات',
      render: (r) => (
        <div className="flex items-center gap-2">
          <select
            value={r.status}
            onChange={(e) => setStatus(r.id, e.target.value)}
            className="rounded-lg border border-slate-300 p-1 text-xs dark:border-slate-700 dark:bg-slate-800"
          >
            <option value="active">نشط</option>
            <option value="suspended">موقوف</option>
            <option value="pending">بانتظار</option>
            <option value="inactive">غير نشط</option>
          </select>
          <button
            onClick={() => { setShowCharge(r); setChargeAmount(''); }}
            className="rounded-lg bg-brand-600 px-2.5 py-1 text-xs text-white transition hover:bg-brand-700"
          >
            شحن
          </button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">إدارة المستخدمين</h1>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-lg border border-slate-300 p-2 text-sm dark:border-slate-700 dark:bg-slate-800"
          >
            {ALL_ROLES_OPTIONS.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
          <input
            placeholder="بحث بالاسم..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load()}
            className="rounded-lg border border-slate-300 p-2 text-sm dark:border-slate-700 dark:bg-slate-800"
          />
          <button onClick={load} className="rounded-lg bg-brand-600 px-4 py-2 text-sm text-white">بحث</button>
          <button onClick={() => setShowCreate(true)} className="rounded-lg bg-green-600 px-4 py-2 text-sm text-white">إنشاء مستخدم</button>
        </div>
      </div>

      <div className="mt-6">
        <DataTable columns={columns} data={users} loading={loading} />
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="إنشاء مستخدم جديد">
        <form onSubmit={createUser} className="space-y-3">
          <input placeholder="الاسم" value={createForm.name}
            onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
            className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800" required />
          <input type="email" placeholder="البريد الإلكتروني" value={createForm.email}
            onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
            className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800" required />
          <input type="password" placeholder="كلمة المرور" value={createForm.password}
            onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
            className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800" required />
          <input placeholder="رقم الهاتف" value={createForm.phone}
            onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
            className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800" />
          <select value={createForm.role}
            onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
            className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800">
            {ROLE_OPTIONS.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
          <button disabled={creating}
            className="w-full rounded-lg bg-brand-600 py-2 font-bold text-white transition hover:bg-brand-700 disabled:opacity-50">
            {creating ? 'جارٍ الإنشاء...' : 'إنشاء'}
          </button>
        </form>
      </Modal>

      <Modal open={!!showCharge} onClose={() => setShowCharge(null)} title={`شحن محفظة ${showCharge?.name || ''}`}>
        <form onSubmit={chargeWallet} className="space-y-3">
          <input type="number" min="1" placeholder="المبلغ" value={chargeAmount}
            onChange={(e) => setChargeAmount(e.target.value)}
            className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800" required />
          <button disabled={charging}
            className="w-full rounded-lg bg-brand-600 py-2 font-bold text-white transition hover:bg-brand-700 disabled:opacity-50">
            {charging ? 'جارٍ الشحن...' : 'شحن المحفظة'}
          </button>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
