import { useEffect, useState, useRef, useCallback } from 'react';
import QRCode from 'qrcode';
import api from '../../lib/api';
import DashboardLayout from '../../components/dashboard/DashboardLayout';

const STATUS_MAP = {
  connected: { label: 'متصل', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  awaiting_scan: { label: 'بانتظار المسح', color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  connecting: { label: 'جارٍ الاتصال...', color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  disconnected: { label: 'غير متصل', color: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
};

export default function AdminSettings() {
  const [waStatus, setWaStatus] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [pairingCode, setPairingCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState(null);
  const [pairPhone, setPairPhone] = useState('');
  const [pairError, setPairError] = useState('');
  const [pairSuccess, setPairSuccess] = useState('');
  const qrCanvasRef = useRef(null);

  // Fallback settings
  const [fallbackUrl, setFallbackUrl] = useState('');
  const [fbSaved, setFbSaved] = useState(false);
  const [testPhone, setTestPhone] = useState('');
  const [testMsg, setTestMsg] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [testLoading, setTestLoading] = useState(false);

  const renderQr = useCallback(async (data) => {
    if (!qrCanvasRef.current || !data) return;
    try {
      await QRCode.toCanvas(qrCanvasRef.current, data, {
        width: 280,
        margin: 2,
        color: { dark: '#1e293b', light: '#ffffff' },
      });
    } catch {}
  }, []);

  const fetchStatus = async () => {
    try {
      const { data } = await api.get('/settings/whatsapp/status');
      setWaStatus(data.data);
      if (data.data.qr) {
        setQrCode(data.data.qr);
        renderQr(data.data.qr);
      }
      if (data.data.pairingCode) setPairingCode(data.data.pairingCode);
    } catch {}
  };

  const fetchSettings = async () => {
    try {
      const { data } = await api.get('/settings');
      if (data.data.waFallbackApiUrl) setFallbackUrl(data.data.waFallbackApiUrl);
    } catch {}
  };

  useEffect(() => {
    fetchStatus().finally(() => setLoading(false));
    fetchSettings();

    const interval = setInterval(fetchStatus, 3000);

    return () => { clearInterval(interval); };
  }, [renderQr]);

  const restart = async () => {
    setAction('restarting');
    setQrCode(null);
    setPairingCode(null);
    setWaStatus((prev) => ({ ...prev, ready: false, status: 'connecting', qr: null }));
    try {
      await api.post('/settings/whatsapp/restart');
      setTimeout(() => fetchStatus(), 4000);
    } catch {}
    setAction(null);
  };

  const doLogout = async () => {
    if (!confirm('سيتم حذف جلسة واتساب الحالية. تأكد؟')) return;
    setAction('loggingout');
    setQrCode(null);
    setPairingCode(null);
    try {
      await api.post('/settings/whatsapp/logout');
      setTimeout(() => fetchStatus(), 4000);
    } catch {}
    setAction(null);
  };

  const doPair = async () => {
    setPairError('');
    setPairSuccess('');
    const clean = pairPhone.replace(/[^\d]/g, '');
    if (clean.length < 10) {
      setPairError('رقم الهاتف غير صالح (يجب أن يكون 10 أرقام على الأقل)');
      return;
    }
    setAction('pairing');
    try {
      const { data } = await api.post('/settings/whatsapp/pair', { phone: pairPhone });
      setPairingCode(data.data.pairingCode);
      setQrCode(null);
      setPairSuccess(`تم إنشاء رمز الإقران. أدخله في واتساب: الإعدادات ← الأجهزة المرتبطة ← إقران جهاز`);
    } catch (err) {
      setPairError(err.response?.data?.message || 'فشل إنشاء رمز الإقران');
    }
    setAction(null);
  };

  const copyCode = () => {
    if (pairingCode) {
      navigator.clipboard.writeText(pairingCode);
      setPairSuccess('تم نسخ الرمز!');
      setTimeout(() => setPairSuccess(''), 3000);
    }
  };

  const saveFallbackUrl = async () => {
    try {
      await api.put('/settings', { waFallbackApiUrl: fallbackUrl });
      setFbSaved(true);
      setTimeout(() => setFbSaved(false), 3000);
    } catch {}
  };

  const testFallbackApi = async () => {
    if (!testPhone || !testMsg) return;
    setTestLoading(true);
    setTestResult(null);
    try {
      const { data } = await api.post('/settings/whatsapp/test-fallback', { phone: testPhone, message: testMsg });
      setTestResult(data.data);
    } catch (err) {
      setTestResult({ status: 'error', message: 'فشل الاتصال بالخادم' });
    }
    setTestLoading(false);
  };

  const st = waStatus?.status || 'disconnected';
  const statusInfo = STATUS_MAP[st] || STATUS_MAP.disconnected;

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold">الإعدادات</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* WhatsApp Connection */}
        <div className="rounded-2xl border border-slate-200 p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">ربط واتساب</h2>
            <span className={`flex items-center gap-2 rounded-full px-3 py-1 text-sm ${statusInfo.color}`}>
              <span className={`h-2 w-2 rounded-full ${statusInfo.dot}`} />
              {statusInfo.label}
            </span>
          </div>

          {st === 'awaiting_scan' && (qrCode || pairingCode) && (
            <div className="mt-6">
              {qrCode && (
                <div className="text-center">
                  <p className="mb-4 text-sm text-slate-500">امسح رمز QR من تطبيق واتساب على هاتفك:</p>
                  <div className="flex justify-center">
                    <div className="inline-block rounded-xl border-2 border-slate-200 bg-white p-3 dark:border-slate-700">
                      <canvas ref={qrCanvasRef} width={280} height={280} className="h-56 w-56" />
                    </div>
                  </div>
                </div>
              )}

              {pairingCode && (
                <div className="mt-4 text-center">
                  <p className="mb-3 text-sm text-slate-500">أو استخدم رمز الإقران:</p>
                  <div onClick={copyCode} className="mx-auto inline-block cursor-pointer rounded-xl bg-slate-100 px-8 py-4 text-center text-2xl font-bold tracking-widest dark:bg-slate-800" title="اضغط للنسخ">
                    {pairingCode}
                  </div>
                  <p className="mt-2 text-xs text-slate-400">اضغط على الرمز للنسخ</p>
                </div>
              )}

              <div className="mt-4 text-xs text-slate-400">
                <p className="mb-1 font-semibold text-slate-500">الطريقة الأولى: مسح QR</p>
                <p>1. افتح واتساب على هاتفك</p>
                <p>2. اذهب للإعدادات ← الأجهزة المرتبطة ← إقران جهاز</p>
                <p>3. وجّه الكاميرا نحو رمز QR أعلاه</p>
                <p className="mb-2 mt-2 font-semibold text-slate-500">الطريقة الثانية: رمز الإقران</p>
                <p>1. أدخل رقم هاتفك أدناه</p>
                <p>2. انسخ الرمز المكون من 8 أرقام</p>
                <p>3. في واتساب: الإعدادات ← الأجهزة المرتبطة ← إقران جهاز ← أدخل الرمز</p>
              </div>
            </div>
          )}

          {st === 'connecting' && (
            <div className="mt-6 text-center">
              <div className="flex h-56 items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-brand-600" />
                  <p className="mt-4 text-sm text-slate-400">جارٍ الاتصال بخوادم واتساب...</p>
                </div>
              </div>
            </div>
          )}

          {st === 'disconnected' && !qrCode && (
            <div className="mt-6 text-center">
              <div className="flex h-56 items-center justify-center">
                <div className="text-center">
                  <p className="text-sm text-slate-400">غير متصل بخوادم واتساب</p>
                  <button onClick={restart} disabled={action === 'restarting'}
                    className="mt-3 rounded-lg bg-brand-600 px-4 py-2 text-xs text-white disabled:opacity-50">
                    {action === 'restarting' ? 'جارٍ...' : 'بدء الاتصال'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {st === 'connected' && (
            <div className="mt-6 text-center">
              <div className="text-4xl">✅</div>
              <p className="mt-3 font-semibold text-green-600">واتساب متصل ويعمل</p>
              <p className="mt-1 text-sm text-slate-500">يمكن إرسال الإشعارات ورموز OTP عبر واتساب.</p>
            </div>
          )}

          {(st === 'awaiting_scan' || st === 'connected') && (
            <div className="mt-4 flex justify-center gap-2">
              {st === 'awaiting_scan' && (
                <button onClick={restart} disabled={action === 'restarting'}
                  className="rounded-lg bg-slate-600 px-4 py-2 text-sm text-white disabled:opacity-50">
                  {action === 'restarting' ? 'جارٍ...' : 'تحديث QR'}
                </button>
              )}
              <button onClick={doLogout} disabled={action === 'loggingout'}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white disabled:opacity-50">
                {action === 'loggingout' ? 'جارٍ...' : 'فصل وإعادة ربط'}
              </button>
            </div>
          )}

          {/* Pairing Code Form */}
          {st === 'awaiting_scan' && (
            <div className="mt-6 border-t border-slate-200 pt-6 dark:border-slate-800">
              <h3 className="mb-3 text-sm font-semibold">إقران برقم الهاتف</h3>
              <div className="flex gap-2">
                <input type="tel" dir="ltr" placeholder="ادخل رقم الهاتف (مثال: 01001234567)"
                  value={pairPhone} onChange={(e) => setPairPhone(e.target.value)}
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800" />
                <button onClick={doPair} disabled={action === 'pairing'}
                  className="rounded-lg bg-brand-600 px-4 py-2 text-sm text-white disabled:opacity-50">
                  {action === 'pairing' ? 'جارٍ...' : 'إقران'}
                </button>
              </div>
              {pairError && <p className="mt-2 text-xs text-red-500">{pairError}</p>}
              {pairSuccess && <p className="mt-2 text-xs text-green-600">{pairSuccess}</p>}
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Fallback WhatsApp API */}
          <div className="rounded-2xl border border-slate-200 p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-bold">🔁 منصة واتساب احتياطية (طوارئ)</h2>
            <p className="mt-1 text-sm text-slate-500">
              عند فشل إرسال واتساب الأساسي، يتم استخدام رابط API بديل لإرسال الرسائل.
            </p>
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">رابط API البديل</label>
              <div className="flex gap-2">
                <input type="url" dir="ltr" placeholder="https://ai.zaadllc.com/"
                  value={fallbackUrl} onChange={(e) => setFallbackUrl(e.target.value)}
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800" />
                <button onClick={saveFallbackUrl}
                  className="rounded-lg bg-brand-600 px-4 py-2 text-sm text-white hover:bg-brand-700">
                  حفظ
                </button>
              </div>
              {fbSaved && <p className="mt-2 text-xs text-green-600">✅ تم الحفظ</p>}
            </div>

            <div className="mt-6 border-t border-slate-200 pt-5 dark:border-slate-800">
              <h3 className="text-sm font-semibold">📨 اختبار الإرسال</h3>
              <p className="mt-1 text-xs text-slate-400">أرسل رسالة تجريبية عبر API الطوارئ للتحقق من عمله</p>
              <div className="mt-3 space-y-2">
                <input type="tel" dir="ltr" placeholder="رقم الهاتف (مثال: 201000000000)"
                  value={testPhone} onChange={(e) => setTestPhone(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800" />
                <input type="text" placeholder="نص الرسالة"
                  value={testMsg} onChange={(e) => setTestMsg(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800" />
                <button onClick={testFallbackApi} disabled={testLoading || !testPhone || !testMsg}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white disabled:opacity-50 hover:bg-emerald-700">
                  {testLoading ? 'جارٍ الإرسال...' : 'إرسال تجريبي'}
                </button>
              </div>

              {testResult && (
                <div className={`mt-3 rounded-lg p-3 text-xs ${testResult.status === 'sent' ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-300'}`}>
                  <p className="font-semibold">{testResult.status === 'sent' ? '✅ تم الإرسال بنجاح' : '❌ فشل الإرسال'}</p>
                  <p className="mt-1">الحالة: {testResult.httpStatus || testResult.status}</p>
                  {testResult.response && <p className="mt-1 truncate">الرد: {testResult.response}</p>}
                  {testResult.message && <p className="mt-1">{testResult.message}</p>}
                </div>
              )}
            </div>
          </div>

          {/* Platform Info */}
          <div className="rounded-2xl border border-slate-200 p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-bold">معلومات المنصة</h2>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
                <span className="text-slate-500">اسم المنصة</span>
                <span className="font-semibold">تعليم</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
                <span className="text-slate-500">نظام التحقق</span>
                <span className="font-semibold">OTP عبر واتساب</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
                <span className="text-slate-500">التسجيل</span>
                <span className="font-semibold">الطلاب فقط</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
                <span className="text-slate-500">إضافة المدرسين</span>
                <span className="font-semibold">الأدمن فقط</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
                <span className="text-slate-500">حالة واتساب</span>
                <span className={`font-semibold ${st === 'connected' ? 'text-green-600' : 'text-red-600'}`}>{statusInfo.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">API احتياطي</span>
                <span className={`font-semibold ${fallbackUrl ? 'text-green-600' : 'text-red-400'}`}>
                  {fallbackUrl ? 'مفعل' : 'غير مفعل'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
