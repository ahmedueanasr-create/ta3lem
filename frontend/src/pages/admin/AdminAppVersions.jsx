import { useEffect, useState } from 'react';
import api from '../../lib/api';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import DataTable from '../../components/dashboard/DataTable';
import Modal from '../../components/dashboard/Modal';

export default function AdminAppVersions() {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');

  const fetchVersions = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/app/versions');
      setVersions(data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVersions(); }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    setUploadError('');
    setUploadSuccess('');
    const form = e.target;
    const formData = new FormData(form);

    if (!formData.get('file').size) {
      setUploadError('يرجى اختيار ملف APK');
      return;
    }

    try {
      setUploading(true);
      await api.post('/app/versions', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadSuccess('تم رفع الإصدار بنجاح');
      setShowUpload(false);
      fetchVersions();
    } catch (e) {
      setUploadError(e.response?.data?.message || e.message || 'فشل الرفع');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا الإصدار؟')) return;
    try {
      await api.delete(`/app/versions/${id}`);
      fetchVersions();
    } catch (e) {
      alert(e.response?.data?.message || 'فشل الحذف');
    }
  };

  const latest = versions[0];

  const columns = [
    { key: 'versionName', label: 'الإصدار' },
    { key: 'versionCode', label: 'الكود' },
    {
      key: 'fileSize',
      label: 'الحجم',
      render: (r) => r.fileSize ? `${(r.fileSize / 1024 / 1024).toFixed(1)} MB` : '-',
    },
    {
      key: 'isForceUpdate',
      label: 'إجباري',
      render: (r) => r.isForceUpdate ? '✅' : '—',
    },
    {
      key: 'isActive',
      label: 'فعال',
      render: (r) => r.isActive ? '✅' : '❌',
    },
    {
      key: 'createdAt',
      label: 'التاريخ',
      render: (r) => new Date(r.createdAt).toLocaleDateString('ar-EG'),
    },
    {
      key: 'actions',
      label: '',
      render: (r) => (
        <button onClick={() => handleDelete(r.id)} className="text-red-500 hover:text-red-700 text-sm">حذف</button>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">إصدارات التطبيق</h1>
          {latest && (
            <p className="mt-1 text-sm text-slate-500">
              أحدث إصدار: <strong>{latest.versionName}</strong> (كود {latest.versionCode})
              {' — '}{new Date(latest.createdAt).toLocaleDateString('ar-EG')}
            </p>
          )}
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-brand-700"
        >
          + رفع إصدار جديد
        </button>
      </div>

      <DataTable columns={columns} data={versions} loading={loading} emptyText="لا توجد إصدارات" />

      {showUpload && (
        <Modal onClose={() => setShowUpload(false)} title="رفع إصدار جديد">
          <form onSubmit={handleUpload} className="space-y-4">
            {uploadError && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{uploadError}</div>}
            {uploadSuccess && <div className="rounded-lg bg-green-50 p-3 text-sm text-green-600">{uploadSuccess}</div>}

            <div>
              <label className="mb-1 block text-sm font-semibold">رقم الإصدار (versionCode)</label>
              <input name="versionCode" type="number" required
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">اسم الإصدار (versionName)</label>
              <input name="versionName" type="text" required placeholder="مثال: 2.0.0"
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">ملف APK</label>
              <input name="file" type="file" accept=".apk,.aab"
                className="w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700 hover:file:bg-brand-100" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">ملاحظات الإصدار</label>
              <textarea name="releaseNotes" rows={3}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none" />
            </div>
            <div className="flex items-center gap-2">
              <input name="isForceUpdate" type="checkbox" id="forceUpdate" value="true"
                className="h-4 w-4 rounded border-slate-300 text-brand-600" />
              <label htmlFor="forceUpdate" className="text-sm font-semibold">تحديث إجباري</label>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowUpload(false)}
                className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold transition hover:bg-slate-50">
                إلغاء
              </button>
              <button type="submit" disabled={uploading}
                className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-brand-700 disabled:opacity-50">
                {uploading ? 'جاري الرفع...' : 'رفع'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </DashboardLayout>
  );
}
