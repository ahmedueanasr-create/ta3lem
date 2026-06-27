import { useEffect, useState } from 'react';
import api from '../../lib/api';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import DataTable from '../../components/dashboard/DataTable';

export default function AdminWhatsApp() {
  const [status, setStatus] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ phone: '', message: '' });
  const [result, setResult] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [sr, mr] = await Promise.all([
        api.get('/whatsapp/status'),
        api.get('/whatsapp/messages?direction=out'),
      ]);
      setStatus(sr.data.data);
      setMessages(mr.data.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const send = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/whatsapp/send', form);
      setResult(data.data);
      setForm({ phone: '', message: '' });
      load();
    } catch (ex) {
      setResult({ status: 'failed', error: ex.response?.data?.message });
    }
  };

  const columns = [
    { key: 'id', label: '#' },
    { key: 'jid', label: 'المستقبل' },
    { key: 'message', label: 'الرسالة', render: (r) => <span className="line-clamp-1 max-w-xs">{r.message}</span> },
    { key: 'status', label: 'الحالة' },
    { key: 'created_at', label: 'التاريخ', render: (r) => new Date(r.created_at).toLocaleString('ar-EG') },
  ];

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold">نظام واتساب</h1>

      <div className="mt-4 flex items-center gap-3">
        <span className={`flex items-center gap-2 rounded-full px-3 py-1 text-sm ${status?.ready ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          <span className={`h-2 w-2 rounded-full ${status?.ready ? 'bg-green-500' : 'bg-red-500'}`} />
          {status?.ready ? 'متصل' : 'غير متصل'}
        </span>
        {!status?.ready && (
          <span className="text-sm text-slate-500">امسح QR من سيرفر لتسجيل الدخول</span>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 font-bold">إرسال رسالة</h2>
          <form onSubmit={send} className="space-y-3">
            <input placeholder="رقم الهاتف (مثال: 201234567890)" value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full rounded-lg border border-slate-300 p-2 text-sm dark:border-slate-700 dark:bg-slate-800" required />
            <textarea placeholder="نص الرسالة" rows="4" value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full rounded-lg border border-slate-300 p-2 text-sm dark:border-slate-700 dark:bg-slate-800" required />
            <button className="w-full rounded-lg bg-green-600 py-2 text-sm font-bold text-white">إرسال</button>
            {result && (
              <div className={`rounded-lg p-2 text-xs ${result.status === 'sent' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {result.status === 'sent' ? 'تم الإرسال ✓' : `فشل: ${result.error || ''}`}
              </div>
            )}
          </form>
        </div>

        <div className="lg:col-span-2">
          <h2 className="mb-4 font-bold">سجل الرسائل الصادرة</h2>
          <DataTable columns={columns} data={messages} loading={loading} />
        </div>
      </div>
    </DashboardLayout>
  );
}
