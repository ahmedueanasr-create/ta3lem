import { useState } from 'react';
import Modal from './Modal';
import api from '../../lib/api';

export default function RateSession({ sessionId, sessionTitle, onRated }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);

  const submit = async () => {
    if (rating < 1) return setErr('اختر تقييماً');
    setErr(null);
    try {
      await api.post(`/sessions/${sessionId}/rate`, { rating, comment });
      setMsg('شكراً لتقييمك! ⭐');
      setTimeout(() => { setOpen(false); setMsg(null); onRated?.(); }, 1500);
    } catch (ex) {
      setErr(ex.response?.data?.message || 'فشل التقييم');
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-medium text-white"
      >
        ⭐ قيّم الحصة
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title={`تقييم: ${sessionTitle}`}>
        <div className="space-y-4 text-center">
          {msg ? (
            <p className="py-4 text-lg font-bold text-green-600">{msg}</p>
          ) : (
            <>
              <p className="text-sm text-slate-500">كيف كانت الحصة؟</p>
              <div className="flex justify-center gap-1 text-3xl">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onMouseEnter={() => setHover(n)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => setRating(n)}
                    className={`transition ${(hover || rating) >= n ? 'text-yellow-400' : 'text-slate-300'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <textarea
                placeholder="اكتب تعليقك (اختياري)"
                rows="3"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-sm dark:border-slate-700 dark:bg-slate-800"
              />
              {err && <p className="text-sm text-red-600">{err}</p>}
              <button onClick={submit} className="w-full rounded-lg bg-brand-600 py-2 font-bold text-white">
                إرسال التقييم
              </button>
            </>
          )}
        </div>
      </Modal>
    </>
  );
}
