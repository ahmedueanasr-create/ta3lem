import { useEffect, useState } from 'react';
import api from '../../lib/api';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import Modal from '../../components/dashboard/Modal';
import { useAuth } from '../../context/AuthContext';

export default function StudentHomework() {
  const { user } = useAuth();
  const [hw, setHw] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(null);
  const [content, setContent] = useState('');
  const [uploading, setUploading] = useState(false);
  const [fileId, setFileId] = useState(null);
  const [fileName, setFileName] = useState('');

  const load = () => {
    setLoading(true);
    api.get('/homework').then((r) => setHw(r.data.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const uploadFile = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', f);
      fd.append('entity_type', 'homework');
      const { data } = await api.post('/files/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFileId(data.data.id);
      setFileName(data.data.original_name);
    } catch (ex) {
      alert('فشل رفع الملف');
    } finally {
      setUploading(false);
    }
  };

  const submitHw = async () => {
    await api.post(`/homework/${submitting.id}/submit`, { content, file_id: fileId });
    setSubmitting(null);
    setContent('');
    setFileId(null);
    setFileName('');
    load();
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold">واجباتي</h1>

      <div className="mt-6 space-y-3">
        {loading && <p className="text-slate-400">جارٍ التحميل...</p>}
        {!loading && hw.length === 0 && <p className="text-slate-400">لا توجد واجبات</p>}
        {hw.map((h) => {
          const mySub = h.submissions?.find((s) => s.user_id === user?.id);
          return (
            <div key={h.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-4 dark:border-slate-800 dark:bg-slate-900">
              <div>
                <p className="font-semibold">{h.title}</p>
                <p className="text-xs text-slate-500">التسليم: {new Date(h.due_at).toLocaleString('ar-EG')}</p>
              </div>
              {mySub ? (
                <span className={`rounded-full px-3 py-1 text-xs ${mySub.status === 'graded' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {mySub.status === 'graded' ? `تم التصحيح: ${mySub.score}/100` : 'تم التسليم'}
                </span>
              ) : (
                <button onClick={() => { setSubmitting(h); setContent(''); setFileId(null); setFileName(''); }} className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs text-white">
                  تسليم
                </button>
              )}
            </div>
          );
        })}
      </div>

      <Modal open={!!submitting} onClose={() => setSubmitting(null)} title={`تسليم: ${submitting?.title}`}>
        <div className="space-y-3">
          <p className="text-sm text-slate-500">{submitting?.description}</p>
          <textarea placeholder="اكتب إجابتك هنا..." rows="4" value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800" />
          <div>
            <label className="text-sm font-medium">أو ارفع ملف:</label>
            <input type="file" onChange={uploadFile} disabled={uploading}
              className="mt-1 block w-full text-sm text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-600 file:px-4 file:py-2 file:text-white" />
            {uploading && <p className="mt-1 text-xs text-slate-400">جارٍ الرفع...</p>}
            {fileName && <p className="mt-1 text-xs text-green-600">✓ {fileName}</p>}
          </div>
          <button onClick={submitHw} disabled={!content && !fileId}
            className="w-full rounded-lg bg-brand-600 py-2 font-bold text-white disabled:opacity-50">تسليم الواجب</button>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
