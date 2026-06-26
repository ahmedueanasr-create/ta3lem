import { useEffect, useState } from 'react';
import api from '../lib/api';
import DashboardLayout from '../components/dashboard/DashboardLayout';

const TYPE_ICONS = {
  info: 'ℹ️',
  warning: '⚠️',
  success: '✅',
  error: '❌',
  course: '📚',
  payment: '💳',
  system: '⚙️',
};

export default function Notifications() {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10;

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get('/notifications', { params: { page, limit } });
      const data = r.data.data || [];
      const total = r.data.total || r.data.meta?.total || data.length;
      if (page === 1) setNotifs(data);
      else setNotifs((prev) => [...prev, ...data]);
      setHasMore(page * limit < total);
    } catch {
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    load();
  }, []);

  useEffect(() => {
    if (page > 1) load();
  }, [page]);

  const markRead = async (id) => {
    await api.patch(`/notifications/${id}/read`);
    const r = await api.get('/notifications', { params: { page: 1, limit: page * limit } });
    const data = r.data.data || [];
    setNotifs(data);
  };

  const markAll = async () => {
    await api.post('/notifications/read-all');
    const r = await api.get('/notifications', { params: { page: 1, limit: page * limit } });
    setNotifs(r.data.data || []);
  };

  const deleteNotif = async (id) => {
    await api.delete(`/notifications/${id}`);
    setNotifs((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">الإشعارات</h1>
        {notifs.length > 0 && (
          <button onClick={markAll} className="rounded-lg bg-slate-600 px-4 py-2 text-sm text-white">
            تعليم الكل كمقروء
          </button>
        )}
      </div>

      <div className="mt-6 space-y-2">
        {loading && notifs.length === 0 && <p className="text-slate-400">جارٍ التحميل...</p>}

        {!loading && notifs.length === 0 && (
          <div className="flex flex-col items-center py-16">
            <span className="text-6xl">🔔</span>
            <p className="mt-4 text-slate-400">لا توجد إشعارات</p>
          </div>
        )}

        {notifs.map((n) => (
          <div
            key={n.id}
            className={`flex items-start justify-between rounded-xl border p-4 ${
              n.read_at
                ? 'border-slate-200 dark:border-slate-800'
                : 'border-brand-300 bg-brand-50 dark:border-brand-700 dark:bg-brand-700/10'
            }`}
          >
            <div className="flex flex-1 gap-3">
              <span className="mt-1 text-xl">{TYPE_ICONS[n.type] || '🔔'}</span>
              <div className="flex-1">
                <p className="font-semibold">{n.title}</p>
                <p className="mt-1 text-sm text-slate-500">{n.body}</p>
                <p className="mt-1 text-xs text-slate-400">{new Date(n.created_at).toLocaleString('ar-EG')}</p>
              </div>
            </div>
            <div className="mr-2 flex items-center gap-2">
              {!n.read_at && (
                <button onClick={() => markRead(n.id)} className="rounded-lg bg-brand-600 px-3 py-1 text-xs text-white">
                  مقروء
                </button>
              )}
              <button onClick={() => deleteNotif(n.id)} className="rounded-lg bg-red-500/10 px-3 py-1 text-xs text-red-600 hover:bg-red-500/20">
                حذف
              </button>
            </div>
          </div>
        ))}

        {hasMore && (
          <div className="pt-4 text-center">
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={loading}
              className="rounded-lg border border-slate-300 px-6 py-2 text-sm text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              {loading ? 'جارٍ التحميل...' : 'عرض المزيد'}
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
