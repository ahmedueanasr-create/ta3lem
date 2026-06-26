import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

const subjects = [
  { name: 'الرياضيات', icon: '📐', desc: 'من الأساسيات إلى التفاضل والتكامل' },
  { name: 'الفيزياء', icon: '⚛️', desc: 'القوانين الفيزيائية والتطبيقات العملية' },
  { name: 'الكيمياء', icon: '🧪', desc: 'التفاعلات الكيميائية والمعادلات' },
  { name: 'الأحياء', icon: '🧬', desc: 'علوم الحياة والجينات والخلية' },
  { name: 'اللغة العربية', icon: '📝', desc: 'النحو والصرف والبلاغة' },
  { name: 'اللغة الإنجليزية', icon: '🔤', desc: 'قواعد ومحادثة وكتابة أكاديمية' },
];

const teachers = [
  { name: 'أ. محمد أحمد', subject: 'الرياضيات', rating: 4.9, students: 3200, avatar: '🧑‍🏫' },
  { name: 'أ. فاطمة علي', subject: 'الكيمياء', rating: 4.8, students: 2100, avatar: '👩‍🏫' },
  { name: 'أ. خالد سعيد', subject: 'الفيزياء', rating: 4.7, students: 1800, avatar: '👨‍🏫' },
  { name: 'أ. منى حسن', subject: 'الأحياء', rating: 4.9, students: 1500, avatar: '👩‍🔬' },
  { name: 'أ. سارة محمود', subject: 'اللغة العربية', rating: 4.8, students: 2700, avatar: '👩‍🏫' },
  { name: 'أ. عمر عبدالله', subject: 'اللغة الإنجليزية', rating: 4.6, students: 1900, avatar: '🧑‍🏫' },
];

const testimonials = [
  { name: 'أحمد محمد', grade: 'الثالث الثانوي', text: 'المنصة غيّرت طريقة مذاكرتي تماماً. الحصص المباشرة والتسجيلات ساعدتني أفهم أصعب الأجزاء.', rating: 5 },
  { name: 'سارة علي', grade: 'الثاني الثانوي', text: 'نظام المحفظة ممتاز، بشحن رصيدي وأدخل الحصص بسهولة. المدرسون محترفون جداً.', rating: 5 },
  { name: 'خالد إبراهيم', grade: 'الأول الثانوي', text: 'الاختبارات الإلكترونية والشهادات حافز قوي. كل حاجة في مكان واحد.', rating: 4 },
  { name: 'نورة أحمد', grade: 'الثالث الثانوي', text: 'المساعد الذكي بالذكاء الاصطناعي شيء خرافي! بيفهم أسئلتي وبيشرحلي خطوة بخطوة.', rating: 5 },
  { name: 'يوسف كريم', grade: 'الثاني الثانوي', text: 'المدرسين متفهمين ومحترفين. بحس أن كل حصة مع مدرس خصوصي.', rating: 4 },
];

const plans = [
  { name: 'مجاني', price: '0', features: ['حصتان مسجلتان', 'مشاركة الملفات', 'دعم محدود'] },
  { name: 'الاحترافي', price: '199', featured: true, features: ['حصص مباشرة غير محدودة', 'تسجيلات كاملة', 'واجبات واختبارات', 'دعم 24/7'] },
  { name: 'المدارس', price: 'اتصل بنا', features: ['إدارة فصول متعددة', 'تقارير متقدمة', 'تكامل واتساب', 'مدرسين مخصصين'] },
];

const faqs = [
  { q: 'هل أحتاج لتثبيت برامج؟', a: 'لا، المنصة تعمل بالكامل على المتصفح. كل ما تحتاجه هو اتصال بالإنترنت.' },
  { q: 'كيف أدفع للحصص؟', a: 'تشحن رصيدك في المحفظة الإلكترونية ويُخصم تلقائياً عند دخول الحصة. يمكنك الشحن عبر فودافون كاش أو بطاقات الائتمان.' },
  { q: 'هل توجد تسجيلات للحصص؟', a: 'نعم، يتم تسجيل كل حصة تلقائياً مع الشات والحضور، وتتوفر للمشاهدة في أي وقت لاحقاً.' },
];

function StarRating({ count }) {
  return <span className="text-yellow-400">{'★'.repeat(count)}{'☆'.repeat(5 - count)}</span>;
}

export default function Landing() {
  const sectionRef = useRef(null);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e3a8a] to-[#0891b2] py-20 md:py-32">
        <div className="pointer-events-none absolute inset-0 opacity-20">
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 right-10 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute left-1/3 top-1/3 h-48 w-48 rounded-full bg-blue-400/10 blur-2xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 text-center">
          <span className="inline-block animate-fade-up rounded-full border border-white/20 bg-white/10 px-4 py-1 text-sm text-blue-200 backdrop-blur">
            🚀 المنصة التعليمية الأولى في مصر
          </span>
          <h1 className="animate-fade-up mt-6 text-4xl font-bold leading-tight text-white md:text-6xl lg:text-7xl" style={{ animationDelay: '0.1s' }}>
            تعلم بثقة مع
            <br />
            <span className="bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">أفضل المدرسين</span>
          </h1>
          <p className="animate-fade-up mx-auto mt-6 max-w-2xl text-lg text-blue-200" style={{ animationDelay: '0.2s' }}>
            منصة تعليمية متكاملة تجمع الحصص المباشرة، التسجيلات، الواجبات، 
            الاختبارات، والمحفظة الذكية في مكان واحد. تعلم أينما كنت، في أي وقت.
          </p>
          <div className="animate-fade-up mt-10 flex flex-wrap justify-center gap-4" style={{ animationDelay: '0.3s' }}>
            <Link
              to="/register"
              className="group inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 font-bold text-[#1e3a8a] shadow-lg transition hover:scale-105 hover:shadow-xl"
            >
              ابدأ الآن مجاناً
              <span className="transition group-hover:translate-x-1">←</span>
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-8 py-3.5 font-bold text-white transition hover:bg-white/10 hover:border-white/50"
            >
              استكشف المميزات
              <span>↓</span>
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative -mt-12 z-10 mx-auto max-w-6xl grid grid-cols-2 gap-4 px-4 md:grid-cols-4">
        {[
          { label: 'طالب', end: 125000, suffix: '+', icon: '👨‍🎓' },
          { label: 'مدرّس', end: 3200, suffix: '+', icon: '👨‍🏫' },
          { label: 'حصة مباشرة', end: 87000, suffix: '+', icon: '🎥' },
          { label: 'تقييم', end: 98, suffix: '%', icon: '⭐' },
        ].map((s) => (
          <div key={s.label} className="group rounded-2xl border border-slate-200/60 bg-white p-6 text-center shadow-lg transition hover:shadow-xl dark:border-slate-700/60 dark:bg-slate-900">
            <span className="text-2xl">{s.icon}</span>
            <StatCounter end={s.end} suffix={s.suffix} />
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{s.label}</p>
          </div>
        ))}
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-20">
        <div className="text-center">
          <span className="inline-block rounded-full bg-brand-100 px-4 py-1 text-sm font-semibold text-brand-700 dark:bg-brand-900/50 dark:text-brand-300">✨ المميزات</span>
          <h2 className="mt-4 text-3xl font-bold md:text-4xl">لماذا تختار تعليم؟</h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-500 dark:text-slate-400">كل ما تحتاجه في رحلتك التعليمية في مكان واحد</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            { t: 'بث مباشر احترافي', d: 'فيديو عالي الجودة، مشاركة شاشة، سبورة تفاعلية، رفع اليد، ودردشة لحظية.', i: '🎥' },
            { t: 'محفظة ذكية', d: 'شحن رصيد وخصم تلقائي عند دخول الحصة مع سجل عمليات كامل وشفاف.', i: '💳' },
            { t: 'تسجيل تلقائي', d: 'كل حصة تُسجّل وتُحفظ مع الشات والحضور لمشاهدتها في أي وقت.', i: '🎬' },
            { t: 'تنبيهات وواتساب', d: 'تذكير قبل الحصص عبر المنصة وواتساب والإشعارات الفورية.', i: '🔔' },
            { t: 'اختبارات وواجبات', d: 'أسئلة ذكية مع تصحيح تلقائي وشهادات إتمام معتمدة.', i: '📝' },
            { t: 'تقارير أداء', d: 'تقارير مفصلة للحضور والغياب والأرباح والإيرادات.', i: '📊' },
          ].map((f) => (
            <div key={f.t} className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-700 dark:bg-slate-900">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand-100 text-2xl dark:bg-brand-900/50">{f.i}</div>
              <h3 className="mt-5 text-xl font-bold">{f.t}</h3>
              <p className="mt-2 leading-relaxed text-slate-500 dark:text-slate-400">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Subjects Slider */}
      <section id="subjects" className="bg-gradient-to-b from-slate-50 to-white py-20 dark:from-slate-900 dark:to-slate-950">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center">
            <span className="inline-block rounded-full bg-purple-100 px-4 py-1 text-sm font-semibold text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">📚 المواد</span>
            <h2 className="mt-4 text-3xl font-bold md:text-4xl">المواد التعليمية</h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-500 dark:text-slate-400">اختر من بين مجموعة واسعة من المواد الدراسية</p>
          </div>
          <div className="mt-12">
            <Swiper
              modules={[Autoplay, Pagination]}
              spaceBetween={20}
              slidesPerView={2}
              autoplay={{ delay: 3000, disableOnInteraction: false }}
              pagination={{ clickable: true }}
              breakpoints={{
                640: { slidesPerView: 3 },
                768: { slidesPerView: 4 },
                1024: { slidesPerView: 6 },
              }}
            >
              {subjects.map((s) => (
                <SwiperSlide key={s.name}>
                  <div className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-6 text-center transition hover:-translate-y-2 hover:shadow-xl dark:border-slate-700 dark:bg-slate-900">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-100 to-blue-100 text-3xl transition group-hover:scale-110 dark:from-brand-900/30 dark:to-blue-900/30">
                      {s.icon}
                    </div>
                    <p className="mt-4 font-bold">{s.name}</p>
                    <p className="mt-1 text-xs text-slate-400">{s.desc}</p>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </section>

      {/* Teachers Slider */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="text-center">
          <span className="inline-block rounded-full bg-orange-100 px-4 py-1 text-sm font-semibold text-orange-700 dark:bg-orange-900/50 dark:text-orange-300">👨‍🏫 المدرسون</span>
          <h2 className="mt-4 text-3xl font-bold md:text-4xl">مدرسون متميزون</h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-500 dark:text-slate-400">تعلم على أيدي نخبة من أفضل المدرسين في مصر</p>
        </div>
        <div className="mt-12">
          <Swiper
            modules={[Autoplay, Pagination]}
            spaceBetween={24}
            slidesPerView={1}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 4 },
            }}
          >
            {teachers.map((t) => (
              <SwiperSlide key={t.name}>
                <div className="group rounded-2xl border border-slate-200 bg-white p-6 text-center transition hover:-translate-y-2 hover:shadow-xl dark:border-slate-700 dark:bg-slate-900">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-brand-100 to-orange-100 text-4xl transition group-hover:scale-110 dark:from-brand-900/30 dark:to-orange-900/30">
                    {t.avatar}
                  </div>
                  <h3 className="mt-4 text-lg font-bold">{t.name}</h3>
                  <p className="text-sm text-brand-600 dark:text-brand-400">{t.subject}</p>
                  <div className="mt-3 flex items-center justify-center gap-3 text-sm">
                    <span className="text-yellow-500">★ {t.rating}</span>
                    <span className="text-slate-300">|</span>
                    <span className="text-slate-500">{t.students.toLocaleString('ar-EG')} طالب</span>
                  </div>
                  <button className="mt-4 w-full rounded-lg bg-brand-600 py-2 text-sm font-semibold text-white opacity-0 transition group-hover:opacity-100">
                    احجز حصة
                  </button>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* AI Assistant */}
      <section className="bg-gradient-to-br from-indigo-50 to-purple-50 py-20 dark:from-indigo-950/30 dark:to-purple-950/30">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <span className="inline-block rounded-full bg-brand-100 px-4 py-1.5 text-sm font-semibold text-brand-700 dark:bg-brand-900/50 dark:text-brand-300">🧠 الذكاء الاصطناعي</span>
              <h2 className="mt-4 text-3xl font-bold md:text-4xl">مساعد تعليمي ذكي 24/7</h2>
              <p className="mt-4 text-lg leading-relaxed text-slate-600 dark:text-slate-400">
                المدرس الخصوصي الافتراضي المدعوم بالذكاء الاصطناعي يجيب على أسئلتك، 
                يشرح الدروس، ويحل الواجبات في أي وقت.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  'شرح الدروس خطوة بخطوة',
                  'توليد اختبارات ومراجعات ذكية',
                  'تلخيص الحصص تلقائياً',
                  'خطط دراسة مخصصة',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green-100 text-sm text-green-600 dark:bg-green-900/50 dark:text-green-400">✓</span>
                    <span className="font-medium">{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-brand-700 hover:shadow-xl"
              >
                جرب المساعد الذكي مجاناً
                <span>←</span>
              </Link>
            </div>
            <div className="relative">
              <div className="rounded-3xl border border-white/30 bg-white/80 p-6 shadow-2xl backdrop-blur dark:bg-slate-800/80">
                <div className="flex items-center gap-3 border-b border-slate-200 pb-4 dark:border-slate-700">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-lg dark:bg-brand-900/50">🧠</div>
                  <div>
                    <p className="font-bold text-sm">المساعد الذكي</p>
                    <p className="text-xs text-green-500">متصل</p>
                  </div>
                </div>
                <div className="mt-4 space-y-4">
                  <div className="rounded-2xl rounded-bl-md bg-brand-600 px-4 py-3 text-sm text-white shadow">
                    اشرح لي قانون نيوتن الثاني مع مثال تطبيقي
                  </div>
                  <div className="rounded-2xl rounded-br-md border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    قانون نيوتن الثاني: القوة = الكتلة × التسارع (F = ma). 
                    مثلاً، إذا دفعت سيارة كتلتها 1000 كجم بتسارع 2 م/ث²، 
                    فالقوة المطلوبة = 1000 × 2 = 2000 نيوتن.
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <div className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-400 dark:border-slate-700 dark:bg-slate-900">
                    اكتب سؤالك هنا...
                  </div>
                  <div className="flex cursor-pointer items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700">
                    إرسال
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-7xl px-4 py-20">
        <div className="text-center">
          <span className="inline-block rounded-full bg-green-100 px-4 py-1 text-sm font-semibold text-green-700 dark:bg-green-900/50 dark:text-green-300">💰 الأسعار</span>
          <h2 className="mt-4 text-3xl font-bold md:text-4xl">خطط الأسعار</h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-500 dark:text-slate-400">اختر الخطة المناسبة لك وابدأ رحلتك التعليمية</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`group relative rounded-2xl border-2 p-8 transition hover:-translate-y-1 hover:shadow-xl ${
                p.featured
                  ? 'border-brand-600 bg-white shadow-lg dark:bg-slate-900'
                  : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900'
              }`}
            >
              {p.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-600 px-4 py-1 text-xs font-bold text-white">
                  الأكثر طلباً
                </span>
              )}
              <h3 className="text-xl font-bold">{p.name}</h3>
              <p className="mt-4">
                <span className="text-4xl font-extrabold">{p.price}</span>
                {p.price !== 'اتصل بنا' && <span className="text-base text-slate-500"> ج.م/شهر</span>}
              </p>
              <ul className="mt-6 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-xs text-green-600 dark:bg-green-900/50 dark:text-green-400">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                className={`mt-8 w-full rounded-xl py-3 font-bold transition ${
                  p.featured
                    ? 'bg-brand-600 text-white shadow-lg hover:bg-brand-700 hover:shadow-xl'
                    : 'border border-brand-600 text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20'
                }`}
              >
                {p.price === 'اتصل بنا' ? 'تواصل معنا' : 'ابدأ الآن'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Slider */}
      <section className="bg-gradient-to-b from-slate-50 to-white py-20 dark:from-slate-900 dark:to-slate-950">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center">
            <span className="inline-block rounded-full bg-yellow-100 px-4 py-1 text-sm font-semibold text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300">💬 آراء الطلاب</span>
            <h2 className="mt-4 text-3xl font-bold md:text-4xl">ماذا يقول طلابنا؟</h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-500 dark:text-slate-400">آلاف الطلاب يثقون في تعليم لتطوير مستواهم الدراسي</p>
          </div>
          <div className="relative mt-12">
            <Swiper
              modules={[Autoplay, Pagination]}
              spaceBetween={24}
              slidesPerView={1}
              autoplay={{ delay: 5000, disableOnInteraction: false }}
              pagination={{ clickable: true }}
              breakpoints={{
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
              }}
            >
              {testimonials.map((t) => (
                <SwiperSlide key={t.name}>
                  <div className="relative rounded-2xl border border-slate-200 bg-white p-8 dark:border-slate-700 dark:bg-slate-900">
                    <div className="absolute -top-3 -right-3 text-3xl opacity-20">"</div>
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-100 to-yellow-100 text-2xl dark:from-brand-900/30 dark:to-yellow-900/30">
                        {t.name[0]}
                      </div>
                      <div>
                        <p className="font-bold">{t.name}</p>
                        <p className="text-xs text-slate-500">{t.grade}</p>
                      </div>
                    </div>
                    <StarRating count={t.rating} />
                    <p className="mt-4 leading-relaxed text-slate-600 dark:text-slate-400">{t.text}</p>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1e3a8a] via-[#2563eb] to-[#06b6d4] py-16 text-center text-white">
        <div className="pointer-events-none absolute inset-0 opacity-20">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 left-10 h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-3xl px-4">
          <h2 className="text-3xl font-bold md:text-4xl">جاهز تبدأ رحلتك التعليمية؟</h2>
          <p className="mt-4 text-lg text-blue-200">انضم لآلاف الطلاب الذين يتعلمون بثقة على تعليم</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 font-bold text-[#1e3a8a] shadow-lg transition hover:scale-105 hover:shadow-xl"
            >
              سجّل مجاناً الآن
              <span>←</span>
            </Link>
            <a
              href="#faq"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-8 py-3.5 font-bold text-white transition hover:bg-white/10"
            >
              تعرف أكثر
            </a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-4 py-20">
        <div className="text-center">
          <span className="inline-block rounded-full bg-blue-100 px-4 py-1 text-sm font-semibold text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">❓ الأسئلة</span>
          <h2 className="mt-4 text-3xl font-bold">الأسئلة الشائعة</h2>
        </div>
        <div className="mt-10 space-y-4">
          {faqs.map((f) => (
            <details key={f.q} className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
              <summary className="cursor-pointer text-lg font-semibold transition group-open:text-brand-600">{f.q}</summary>
              <p className="mt-4 leading-relaxed text-slate-600 dark:text-slate-400">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-slate-500">
          <p>© {new Date().getFullYear()} تعليم - جميع الحقوق محفوظة</p>
          <p className="mt-2">تواصل معنا: info@ta3lem.app | 0100 000 0000</p>
        </div>
      </footer>
    </div>
  );
}

function StatCounter({ end, suffix = '', duration = 1500 }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = (now) => {
            const p = Math.min((now - start) / duration, 1);
            setVal(Math.floor(p * end));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end, duration]);

  return (
    <span ref={ref} className="count-up text-3xl font-bold text-brand-600 dark:text-brand-400">
      {val.toLocaleString('ar-EG')}{suffix}
    </span>
  );
}
