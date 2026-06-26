import { useState, useRef, useEffect } from 'react';
import api from '../lib/api';
import DashboardLayout from '../components/dashboard/DashboardLayout';

const INITIAL_MSG = {
  role: 'ai',
  text: 'مرحباً! أنا المساعد التعليمي الذكي. اسألني عن أي درس، أو احتاج مساعدة في فهم موضوع معين، أو أريد خطة دراسة. كيف أقدر أساعدك اليوم؟',
};

export default function AITutor() {
  const [messages, setMessages] = useState([INITIAL_MSG]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setError('');
    const userMsg = { role: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    try {
      const { data } = await api.post('/ai/tutor/chat', {
        messages: [...messages.slice(1), userMsg].map((m) => m.text),
      });
      setMessages((prev) => [...prev, { role: 'ai', text: data.data.reply }]);
    } catch (err) {
      setError(err.response?.data?.message || 'فشل الاتصال بالمساعد الذكي');
      setMessages((prev) => [...prev, { role: 'ai', text: 'عذراً، حدث خطأ. حاول مرة أخرى.' }]);
    }
    setLoading(false);
  };

  return (
    <DashboardLayout>
      <h1 className="mb-6 text-2xl font-bold">🧠 المساعد التعليمي الذكي</h1>

      <div className="mx-auto max-w-3xl">
        <div className="mb-4 flex h-[600px] flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex-1 space-y-4 overflow-y-auto p-6">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-5 py-3 text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'rounded-br-md bg-brand-600 text-white'
                      : 'rounded-bl-md border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl rounded-bl-md border border-slate-200 bg-white px-5 py-3 text-sm dark:border-slate-700 dark:bg-slate-800">
                  <span className="animate-pulse">يكتب...</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-slate-200 p-4 dark:border-slate-800">
            {error && <p className="mb-2 text-xs text-red-500">{error}</p>}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="اكتب سؤالك هنا..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-brand-500 dark:border-slate-600 dark:bg-slate-800"
              />
              <button
                onClick={send}
                disabled={loading || !input.trim()}
                className="rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
              >
                {loading ? '...' : 'إرسال'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
