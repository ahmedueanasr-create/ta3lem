import { useEffect, useState } from 'react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import StatCard from '../components/dashboard/StatCard';

const TYPE_BADGES = {
  charge: 'bg-green-100 text-green-700 dark:bg-green-700/20 dark:text-green-300',
  deduct: 'bg-red-100 text-red-700 dark:bg-red-700/20 dark:text-red-300',
  refund: 'bg-amber-100 text-amber-700 dark:bg-amber-700/20 dark:text-amber-300',
  withdrawal: 'bg-purple-100 text-purple-700 dark:bg-purple-700/20 dark:text-purple-300',
};

const PLANS = [
  { name: 'اشتراك شهري', price: '99', period: 'شهرياً', features: ['دروس غير محدودة', 'تصحيح واجبات', 'دعم فني'] },
  { name: 'اشتراك سنوي', price: '999', period: 'سنوياً', features: ['دروس غير محدودة', 'تصحيح واجبات', 'دعم فني', 'خصم ١٦٪'] },
];

export default function Wallet() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [txs, setTxs] = useState([]);
  const [amount, setAmount] = useState('');
  const [charging, setCharging] = useState(false);

  const load = async () => {
    const [w, h] = await Promise.all([api.get('/wallet'), api.get('/wallet/history')]);
    setWallet(w.data.data);
    setTxs(h.data.data);
  };

  useEffect(() => {
    load().catch(() => {});
  }, []);

  const charge = async (e) => {
    e.preventDefault();
    setCharging(true);
    try {
      await api.post('/wallet/charge', { amount: Number(amount), reason: 'شحن رصيد' });
      setAmount('');
      await load();
    } catch {
    } finally {
      setCharging(false);
    }
  };

  const chargeTotal = txs.filter((t) => t.type === 'charge').reduce((s, t) => s + Number(t.amount), 0);
  const deductTotal = txs.filter((t) => t.type !== 'charge').reduce((s, t) => s + Number(t.amount), 0);
  const maxBar = Math.max(chargeTotal, deductTotal, 1);

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-bold">محفظتي</h1>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <StatCard label="الرصيد المتاح" value={`${wallet?.balance ?? 0} ${wallet?.currency || 'ر.س'}`} color="brand" icon="💰" />
          <StatCard label="إجمالي الشحن" value={`${chargeTotal} ${wallet?.currency || 'ر.س'}`} color="green" icon="📈" />
          <StatCard label="إجمالي الخصم" value={`${deductTotal} ${wallet?.currency || 'ر.س'}`} color="red" icon="📉" />
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 p-5 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-3 text-sm font-semibold text-slate-500">ملخص الإنفاق</h3>
          <div className="space-y-3">
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-green-600">شحن</span>
                <span>{chargeTotal} {wallet?.currency || 'ر.س'}</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${(chargeTotal / maxBar) * 100}%` }} />
              </div>
            </div>
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-red-600">خصم</span>
                <span>{deductTotal} {wallet?.currency || 'ر.س'}</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <div className="h-full rounded-full bg-red-500 transition-all" style={{ width: `${(deductTotal / maxBar) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 p-6 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500">الرصيد المتاح</p>
          <p className="text-3xl font-bold text-brand-600">{wallet?.balance ?? 0} {wallet?.currency || 'ر.س'}</p>
          <form onSubmit={charge} className="mt-4 flex gap-2">
            <input type="number" min="1" placeholder="المبلغ" value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full max-w-xs rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800" required />
            <button disabled={charging}
              className="rounded-lg bg-brand-600 px-4 py-2 text-white transition hover:bg-brand-700 disabled:opacity-50">
              {charging ? 'جارٍ...' : 'شحن'}
            </button>
          </form>
        </div>

        <h2 className="mt-10 text-xl font-bold">سجل العمليات</h2>
        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="p-3 text-right">النوع</th>
                <th className="p-3 text-right">المبلغ</th>
                <th className="p-3 text-right">السبب</th>
                <th className="p-3 text-right">التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {txs.map((t) => (
                <tr key={t.id} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="p-3">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${TYPE_BADGES[t.type] || 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                      {t.type === 'charge' ? 'شحن' : t.type === 'deduct' ? 'خصم' : t.type === 'refund' ? 'استرجاع' : t.type === 'withdrawal' ? 'سحب' : t.type}
                    </span>
                  </td>
                  <td className={`p-3 font-semibold ${t.type === 'charge' ? 'text-green-600' : 'text-red-600'}`}>
                    {t.type === 'charge' ? '+' : '-'}{t.amount}
                  </td>
                  <td className="p-3 text-slate-500">{t.reason}</td>
                  <td className="p-3 text-slate-500">{new Date(t.created_at).toLocaleString('ar-EG')}</td>
                </tr>
              ))}
              {txs.length === 0 && (
                <tr><td colSpan="4" className="p-6 text-center text-slate-400">لا توجد عمليات</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <h2 className="mt-10 text-xl font-bold">الاشتراكات</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {PLANS.map((plan) => (
            <div key={plan.name} className="rounded-2xl border border-slate-200 p-6 dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-lg font-bold">{plan.name}</h3>
              <p className="mt-2 text-3xl font-bold text-brand-600">{plan.price} <span className="text-sm font-normal text-slate-500">{wallet?.currency || 'ر.س'}/{plan.period}</span></p>
              <ul className="mt-4 space-y-1 text-sm text-slate-500">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">✅ {f}</li>
                ))}
              </ul>
              <button className="mt-4 w-full rounded-lg bg-brand-600 py-2 text-sm font-bold text-white transition hover:bg-brand-700">اشتراك</button>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
