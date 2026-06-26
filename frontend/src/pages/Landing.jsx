import StatCounter from '../components/StatCounter';

const subjects = [
  { name: 'الرياضيات', icon: '📐' },
  { name: 'الفيزياء', icon: '⚛️' },
  { name: 'الكيمياء', icon: '🧪' },
  { name: 'الأحياء', icon: '🧬' },
  { name: 'اللغة العربية', icon: '📝' },
  { name: 'اللغة الإنجليزية', icon: '🔤' },
];

const plans = [
  { name: 'مجاني', price: '0', features: ['حصتان مسجلتان', 'مشاركة الملفات', 'دعم محدود'] },
  { name: 'الاحترافي', price: '199', featured: true, features: ['حصص مباشرة غير محدودة', 'تسجيلات كاملة', 'واجبات واختبارات', 'دعم 24/7'] },
  { name: 'المدارس', price: 'اتصل بنا', features: ['إدارة فصول متعددة', 'تقارير متقدمة', 'تكامل واتساب', 'مدرسين مخصصين'] },
];

const faqs = [
  { q: 'هل أحتاج لتثبيت برامج؟', a: 'لا، المنصة تعمل بالكامل على المتصفح.' },
  { q: 'كيف أدفع للحصص؟', a: 'تشحن رصيدك في المحفظة ويُخصم تلقائياً عند دخول الحصة.' },
  { q: 'هل توجد تسجيلات؟', a: 'نعم، يتم تسجيل كل حصة تلقائياً وتتوفر للمشاهدة لاحقاً.' },
];

export default function Landing() {
  return (
    <div>
      {/* Hero */}
      <section className="gradient-hero relative overflow-hidden text-white">
        <div className="mx-auto max-w-7xl px-4 py-24 text-center">
          <h1 className="animate-fade-up text-4xl font-bold leading-tight md:text-6xl">
            تعلّم بثقة مع أفضل المدرسين
            <br /> مباشر وتفاعلي أينما كنت
          </h1>
          <p className="animate-fade-up mx-auto mt-6 max-w-2xl text-lg text-blue-100">
            منصة تعليمية متكاملة تجمع الحصص المباشرة، التسجيلات، الواجبات، الاختبارات،
            والمحفظة الذكية في مكان واحد.
          </p>
          <div className="animate-fade-up mt-8 flex justify-center gap-4">
            <a href="/register" className="rounded-xl bg-white px-6 py-3 font-bold text-brand-700 hover:bg-blue-50">
              ابدأ الآن مجاناً
            </a>
            <a href="#features" className="rounded-xl border border-white/40 px-6 py-3 font-bold hover:bg-white/10">
              استكشف المميزات
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto -mt-12 grid max-w-5xl grid-cols-2 gap-6 px-4 md:grid-cols-4">
        {[
          { label: 'طالب', end: 125000, suffix: '+' },
          { label: 'مدرّس', end: 3200, suffix: '+' },
          { label: 'حصة مباشرة', end: 87000, suffix: '+' },
          { label: 'تقييم', end: 98, suffix: '%' },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl bg-white p-6 text-center shadow-lg dark:bg-slate-900">
            <StatCounter end={s.end} suffix={s.suffix} />
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{s.label}</p>
          </div>
        ))}
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-20">
        <h2 className="text-center text-3xl font-bold">لماذا تعليم؟</h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            { t: 'بث مباشر احترافي', d: 'فيديو، مشاركة شاشة، سبورة تفاعلية، رفع اليد، ودردشة لحظية.', i: '🎥' },
            { t: 'محفظة ذكية', d: 'شحن رصيدك وخصم تلقائي عند دخول الحصة مع سجل عمليات كامل.', i: '💳' },
            { t: 'تسجيل تلقائي', d: 'كل حصة تُسجّل وتُحفظ مع الشات والحضور لمشاهدتها لاحقاً.', i: '🎬' },
            { t: 'تنبيهات وواتساب', d: 'تذكير قبل الحصص داخل المنصة وعبر واتساب والإشعارات الفورية.', i: '🔔' },
            { t: 'اختبارات وواجبات', d: 'أسئلة اختيار من متعدد وصح/خطأ ومقالية مع تصحيح تلقائي وشهادات.', i: '📝' },
            { t: 'تقارير أداء', d: 'تقارير للحضور والغياب والأرباح والإيرادات للطلاب والمدرسين والإدارة.', i: '📊' },
          ].map((f) => (
            <div key={f.t} className="rounded-2xl border border-slate-200 p-6 dark:border-slate-800 dark:bg-slate-900">
              <div className="text-3xl">{f.i}</div>
              <h3 className="mt-4 text-xl font-bold">{f.t}</h3>
              <p className="mt-2 text-slate-500 dark:text-slate-400">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* AI Assistant */}
      <section className="bg-gradient-to-br from-indigo-50 to-purple-50 py-20 dark:from-indigo-950/30 dark:to-purple-950/30">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <span className="rounded-full bg-brand-100 px-4 py-1.5 text-sm font-semibold text-brand-700 dark:bg-brand-900/50 dark:text-brand-300">🧠 الذكاء الاصطناعي</span>
              <h2 className="mt-4 text-3xl font-bold">مساعد تعليمي ذكي 24/7</h2>
              <p className="mt-4 text-slate-600 dark:text-slate-400 leading-relaxed">
                المدرس الخصوصي الافتراضي المدعوم بالذكاء الاصطناعي يجيب على أسئلتك، يشرح الدروس، 
                ويحل الواجبات في أي وقت. اسأل عن أي مادة واحصل على إجابة فورية.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  'شرح الدروس خطوة بخطوة',
                  'توليد اختبارات ومراجعات ذكية',
                  'تلخيص الحصص تلقائياً',
                  'خطط دراسة مخصصة',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-xs text-green-600 dark:bg-green-900/50 dark:text-green-400">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <a href="/register" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700">
                جرب المساعد الذكي مجاناً
                <span>←</span>
              </a>
            </div>
            <div className="relative">
              <div className="rounded-3xl border border-white/30 bg-white/80 p-6 shadow-2xl backdrop-blur-xl dark:bg-slate-800/80">
                <div className="flex items-center gap-3 border-b border-slate-200 pb-4 dark:border-slate-700">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-lg dark:bg-brand-900/50">🧠</div>
                  <div>
                    <p className="font-bold text-sm">المساعد الذكي</p>
                    <p className="text-xs text-green-500">متصل</p>
                  </div>
                </div>
                <div className="mt-4 space-y-3">
                  <div className="rounded-2xl rounded-bl-md bg-brand-600 px-4 py-3 text-sm text-white">
                    اشرح لي قانون نيوتن الثاني مع مثال تطبيقي
                  </div>
                  <div className="rounded-2xl rounded-br-md border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900">
                    قانون نيوتن الثاني: القوة = الكتلة × التسارع (F = ma). مثلاً، إذا دفعت سيارة كتلتها 1000 كجم بتسارع 2 م/ث²، فالقوة المطلوبة = 1000 × 2 = 2000 نيوتن. هل تريد تطبيق أكثر؟
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <div className="h-10 flex-1 rounded-xl bg-slate-100 dark:bg-slate-700" />
                  <div className="flex h-10 w-20 items-center justify-center rounded-xl bg-brand-600 text-sm text-white">إرسال</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Subjects */}
      <section id="subjects" className="bg-white py-20 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-center text-3xl font-bold">المواد التعليمية</h2>
          <div className="mt-12 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
            {subjects.map((s) => (
              <div key={s.name} className="rounded-2xl border border-slate-200 p-6 text-center hover:shadow-lg dark:border-slate-700">
                <div className="text-4xl">{s.icon}</div>
                <p className="mt-3 font-semibold">{s.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Teachers */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <h2 className="text-center text-3xl font-bold">مدرسون متميزون</h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { name: 'أ. محمد أحمد', subject: 'الرياضيات', rating: 4.9, students: 3200, avatar: '🧑‍🏫' },
            { name: 'أ. فاطمة علي', subject: 'الكيمياء', rating: 4.8, students: 2100, avatar: '👩‍🏫' },
            { name: 'أ. خالد سعيد', subject: 'الفيزياء', rating: 4.7, students: 1800, avatar: '👨‍🏫' },
            { name: 'أ. منى حسن', subject: 'الأحياء', rating: 4.9, students: 1500, avatar: '👩‍🔬' },
          ].map((t, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 p-6 text-center dark:border-slate-800 dark:bg-slate-900">
              <div className="text-5xl">{t.avatar}</div>
              <h3 className="mt-3 font-bold">{t.name}</h3>
              <p className="text-sm text-slate-500">{t.subject}</p>
              <div className="mt-2 flex items-center justify-center gap-2 text-sm">
                <span className="text-yellow-500">★ {t.rating}</span>
                <span className="text-slate-400">·</span>
                <span className="text-slate-500">{t.students.toLocaleString('ar-EG')} طالب</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-7xl px-4 py-20">
        <h2 className="text-center text-3xl font-bold">خطط الأسعار</h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`rounded-2xl border p-8 ${
                p.featured ? 'border-brand-600 bg-brand-50 dark:bg-brand-700/20' : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <h3 className="text-xl font-bold">{p.name}</h3>
              <p className="mt-4 text-3xl font-extrabold">
                {p.price}
                {p.price !== 'اتصل بنا' && <span className="text-base font-normal"> ج.م/شهر</span>}
              </p>
              <ul className="mt-6 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="text-brand-600">✓</span> {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <h2 className="text-center text-3xl font-bold">آراء طلابنا</h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            { name: 'أحمد محمد', grade: 'الصف الثالث الثانوي', text: 'المنصة غيّرت طريقة مذاكرتي تماماً. الحصص المباشرة والتسجيلات ساعدتني أفهم أصعب الأجزاء.', avatar: '🧑' },
            { name: 'سارة علي', grade: 'الصف الثاني الثانوي', text: 'نظام المحفظة ممتاز، بشحن رصيدي وأدخل الحصص بسهولة. المدرسون محترفون جداً.', avatar: '👩' },
            { name: 'خالد إبراهيم', grade: 'أولى ثانوي', text: 'الاختبارات الإلكترونية والشهادات حافز قوي. كل حاجة في مكان واحد.', avatar: '👨' },
          ].map((t, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 p-6 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{t.avatar}</span>
                <div>
                  <p className="font-bold">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.grade}</p>
                </div>
              </div>
              <div className="mt-3 text-yellow-500">★★★★★</div>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">{t.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="gradient-hero py-16 text-center text-white">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-3xl font-bold">جاهز تبدأ رحلتك التعليمية؟</h2>
          <p className="mt-4 text-blue-100">انضم لآلاف الطلاب الذين يتعلمون بثقة على تعليم</p>
          <a href="/register" className="mt-6 inline-block rounded-xl bg-white px-8 py-3 font-bold text-brand-700 hover:bg-blue-50">
            سجّل مجاناً الآن
          </a>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-white py-20 dark:bg-slate-900">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-center text-3xl font-bold">الأسئلة الشائعة</h2>
          <div className="mt-10 space-y-4">
            {faqs.map((f) => (
              <details key={f.q} className="rounded-xl border border-slate-200 p-5 dark:border-slate-700">
                <summary className="cursor-pointer font-semibold">{f.q}</summary>
                <p className="mt-3 text-slate-600 dark:text-slate-400">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
