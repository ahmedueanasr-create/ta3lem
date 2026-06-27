import { useRef, useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import Lenis from 'lenis';
import HeroScene from '../components/landing/HeroScene';

const fadeUp = { initial: { opacity: 0, y: 50 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-80px' }, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } };

const SectionHeading = ({ badge, title, desc }) => (
  <motion.div {...fadeUp} className="mb-16 text-center">
    <span className="inline-block rounded-full border border-[#00e5ff]/30 bg-[#00e5ff]/10 px-5 py-1.5 text-sm text-[#00e5ff] backdrop-blur">{badge}</span>
    <h2 className="mt-5 text-4xl font-bold text-white md:text-5xl">{title}</h2>
    {desc && <p className="mx-auto mt-4 max-w-2xl text-lg text-[#b8c0cc]">{desc}</p>}
  </motion.div>
);

const GlowButton = ({ children, to, href, primary = true, ...props }) => {
  const cls = `group relative inline-flex items-center gap-2 overflow-hidden rounded-xl px-8 py-3.5 font-bold transition-all duration-300 ${primary ? 'bg-[#00e5ff] text-[#0a0a0a] hover:shadow-[0_0_30px_rgba(0,229,255,0.5)]' : 'border border-white/20 text-white hover:border-white/40 hover:bg-white/5'}`;
  const content = (
    <>
      <span className="relative z-10 flex items-center gap-2">{children}</span>
      {primary && <span className="absolute inset-0 animate-pulse rounded-xl bg-[#00e5ff]/20" style={{ animationDuration: '2s' }} />}
    </>
  );
  if (to) return <Link to={to} className={cls} {...props}>{content}</Link>;
  return <a href={href} className={cls} {...props}>{content}</a>;
};

/* ------------------------------------------------------------------ */
/*  Counter                                                            */
/* ------------------------------------------------------------------ */
function Counter({ end, suffix = '', duration = 2000 }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !started.current) {
          started.current = true;
          const startT = performance.now();
          const tick = (now) => {
            const p = Math.min((now - startT) / duration, 1);
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

  return <span ref={ref} className="text-5xl font-bold text-white">{val.toLocaleString()}{suffix}</span>;
}

/* ------------------------------------------------------------------ */
/*  Glass Card                                                         */
/* ------------------------------------------------------------------ */
function GlassCard({ icon, title, desc, index = 0, hover3d = false }) {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouse = useCallback((e) => {
    if (!hover3d || !cardRef.current) return;
    const r = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ x: -y * 15, y: x * 15 });
  }, [hover3d]);

  const resetTilt = () => setTilt({ x: 0, y: 0 });

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.15, ease: 'easeOut' }}
      onMouseMove={handleMouse}
      onMouseLeave={resetTilt}
      style={{ transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl transition-all duration-500 hover:border-[#00e5ff]/30 hover:shadow-[0_0_40px_rgba(0,229,255,0.15)]"
    >
      <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-[#00e5ff]/5 blur-3xl transition-all duration-500 group-hover:bg-[#00e5ff]/10" />
      <div className="relative z-10">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#00e5ff]/10 text-3xl">{icon}</span>
        <h3 className="mt-6 text-2xl font-bold text-white">{title}</h3>
        <div className="my-4 h-px w-12 bg-gradient-to-r from-[#00e5ff] to-transparent" />
        <p className="text-[#b8c0cc] leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  DATA                                                               */
/* ------------------------------------------------------------------ */
const features = [
  { icon: '📚', title: 'Smart Digital Library', desc: 'Access thousands of digital books, research papers, and interactive learning materials from anywhere in the world.' },
  { icon: '🎓', title: 'Interactive Learning', desc: 'Engage with live virtual classrooms, real-time quizzes, collaborative whiteboards, and hands-on lab simulations.' },
  { icon: '🤖', title: 'AI-Powered Education', desc: 'Personalized learning paths, intelligent tutoring, and adaptive assessments powered by advanced artificial intelligence.' },
];

const subjects = [
  { name: 'Mathematics', icon: '📐', color: '#00e5ff', desc: 'From algebra to calculus' },
  { name: 'Science', icon: '🔬', color: '#3b82f6', desc: 'Explore the natural world' },
  { name: 'Physics', icon: '⚛️', color: '#6ee7ff', desc: 'Laws of the universe' },
  { name: 'Chemistry', icon: '🧪', color: '#00e5ff', desc: 'Matter and its reactions' },
  { name: 'Biology', icon: '🧬', color: '#3b82f6', desc: 'Life sciences decoded' },
  { name: 'CS', icon: '💻', color: '#6ee7ff', desc: 'Code & innovation' },
  { name: 'History', icon: '📜', color: '#00e5ff', desc: 'Stories of our past' },
  { name: 'Geography', icon: '🌍', color: '#3b82f6', desc: 'Our world explored' },
  { name: 'Languages', icon: '🌐', color: '#6ee7ff', desc: 'Connect globally' },
];

const stats = [
  { end: 25000, suffix: '+', label: 'Students' },
  { end: 1200, suffix: '+', label: 'Teachers' },
  { end: 98, suffix: '%', label: 'Success Rate' },
  { end: 150, suffix: '+', label: 'Courses' },
];

const testimonials = [
  { name: 'Sarah Johnson', role: 'Student', text: 'Future Academy transformed my learning experience. The interactive platform and AI tutor helped me improve my grades significantly.' },
  { name: 'Dr. Ahmed Hassan', role: 'Physics Teacher', text: 'The teaching tools here are exceptional. I can create immersive lessons that truly engage my students.' },
  { name: 'Maria Lopez', role: 'Parent', text: 'My children love learning here. The progress tracking and parent portal keep me informed every step of the way.' },
  { name: 'Prof. James Chen', role: 'Computer Science', text: 'Teaching at Future Academy feels like being part of a revolution in education. The technology is world-class.' },
  { name: 'Emma Wilson', role: 'Student', text: 'The virtual labs and interactive 3D models make complex subjects so much easier to understand.' },
  { name: 'Dr. Layla Mahmoud', role: 'Biology Instructor', text: 'I can bring science to life with the tools available here. My students are more engaged than ever before.' },
];

const libraryBooks = [
  { title: 'Quantum Physics', author: 'Dr. Michio Kaku', image: '📖' },
  { title: 'Calculus Made Easy', author: 'Silvanus Thompson', image: '📘' },
  { title: 'The Art of Coding', author: 'Tech Academy', image: '📕' },
  { title: 'Molecular Biology', author: 'Dr. Jane Watson', image: '📗' },
  { title: 'World History', author: 'Prof. David Miller', image: '📙' },
  { title: 'Chemistry Essentials', author: 'Dr. Lisa Park', image: '📓' },
];

/* ------------------------------------------------------------------ */
/*  LANDING PAGE                                                       */
/* ------------------------------------------------------------------ */
export default function Landing() {
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95]);

  useEffect(() => {
    const lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), orientation: 'vertical', smoothWheel: true });
    let rafId;
    const onRaf = (time) => { lenis.raf(time); setScrollY(lenis.scroll); rafId = requestAnimationFrame(onRaf); };
    rafId = requestAnimationFrame(onRaf);
    return () => { cancelAnimationFrame(rafId); lenis.destroy(); };
  }, []);

  return (
    <div className="relative bg-[#0a0a0a] text-white">

      {/* ======================== HERO ======================== */}
      <section ref={heroRef} className="relative flex h-screen min-h-[700px] items-center justify-center overflow-hidden">
        <HeroScene scrollY={scrollY} />

        <motion.div style={{ opacity: heroOpacity, scale: heroScale }} className="absolute inset-0 z-10 flex flex-col items-center justify-center px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.3 }}>
            <span className="inline-block rounded-full border border-[#00e5ff]/30 bg-[#00e5ff]/10 px-5 py-1.5 text-sm text-[#00e5ff] backdrop-blur">
              ✦ Future Academy — Est. 2024
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="mt-8 max-w-5xl text-5xl font-bold leading-tight md:text-7xl lg:text-8xl"
          >
            The Future of{' '}
            <span className="bg-gradient-to-r from-[#00e5ff] via-[#3b82f6] to-[#6ee7ff] bg-clip-text text-transparent">
              Learning
            </span>{' '}
            Begins Here.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.7 }}
            className="mt-6 max-w-2xl text-lg text-[#b8c0cc] md:text-xl"
          >
            Inspiring students through innovation, creativity, and world-class education.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.9 }}
            className="mt-10 flex flex-wrap justify-center gap-4"
          >
            <GlowButton to="/register">Explore Courses &rarr;</GlowButton>
            <GlowButton primary={false} href="#features">Virtual Campus Tour</GlowButton>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 1.2 }}
            className="mt-8 text-sm text-[#b8c0cc]/60"
          >
            Trusted by Thousands of Students, Teachers, and Parents.
          </motion.p>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex flex-col items-center gap-2"
            >
              <span className="text-xs text-[#b8c0cc]/40">Scroll to explore</span>
              <div className="h-8 w-[1px] bg-gradient-to-b from-[#00e5ff] to-transparent" />
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ======================== STATS ======================== */}
      <section className="relative z-10 -mt-16 mx-auto max-w-6xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-2 gap-4 rounded-2xl border border-white/10 bg-[#111111]/80 p-8 backdrop-blur-xl md:grid-cols-4"
        >
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <Counter end={s.end} suffix={s.suffix} />
              <p className="mt-2 text-sm text-[#b8c0cc]">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ======================== FEATURES ======================== */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-32">
        <SectionHeading badge="✦ Features" title="Academic Excellence Reimagined" desc="Discover a new era of education with cutting-edge tools and personalized learning experiences." />
        <div className="grid gap-8 md:grid-cols-3">
          {features.map((f, i) => (
            <GlassCard key={f.title} {...f} index={i} hover3d />
          ))}
        </div>
      </section>

      {/* ======================== SUBJECTS ======================== */}
      <section className="overflow-hidden py-24">
        <SectionHeading badge="📚 Subjects" title="Explore Our Subjects" desc="Dive into a world of knowledge across multiple disciplines." />
        <div className="relative mt-12">
          <div className="flex gap-6 px-4" style={{ animation: 'scrollSubjects 40s linear infinite' }}>
            {[...subjects, ...subjects].map((s, i) => (
              <div
                key={i}
                className="group flex-shrink-0 w-56 rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center backdrop-blur transition-all duration-500 hover:border-[#00e5ff]/30 hover:shadow-[0_0_30px_rgba(0,229,255,0.1)]"
              >
                <span className="text-5xl">{s.icon}</span>
                <h3 className="mt-4 text-lg font-bold text-white">{s.name}</h3>
                <p className="mt-1 text-sm text-[#b8c0cc]">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
        <style>{`
          @keyframes scrollSubjects {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
      </section>

      {/* ======================== LIBRARY ======================== */}
      <section className="mx-auto max-w-7xl px-4 py-32">
        <SectionHeading badge="📖 Digital Library" title="Explore Our Library" desc="A vast collection of knowledge at your fingertips." />
        <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-6">
          {libraryBooks.map((book, i) => (
            <motion.div
              key={book.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ y: -6, rotateY: -5 }}
              className="group cursor-pointer rounded-xl border border-white/10 bg-white/[0.03] p-5 text-center backdrop-blur transition-all duration-300 hover:border-[#00e5ff]/30 hover:shadow-[0_0_25px_rgba(0,229,255,0.1)]"
            >
              <span className="text-5xl">{book.image}</span>
              <h3 className="mt-3 text-sm font-bold text-white">{book.title}</h3>
              <p className="mt-1 text-xs text-[#b8c0cc]">{book.author}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ======================== TESTIMONIALS ======================== */}
      <section className="mx-auto max-w-7xl px-4 py-32">
        <SectionHeading badge="💬 Testimonials" title="What Our Community Says" desc="Hear from students, teachers, and parents around the world." />
        <div className="relative overflow-hidden py-4">
          <div className="flex gap-6" style={{ animation: 'scrollTestimonials 30s linear infinite' }}>
            {[...testimonials, ...testimonials].map((t, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-80 rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#00e5ff]/20 text-sm font-bold text-[#00e5ff]">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <p className="text-xs text-[#b8c0cc]">{t.role}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-[#b8c0cc]">"{t.text}"</p>
              </div>
            ))}
          </div>
        </div>
        <style>{`
          @keyframes scrollTestimonials {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
      </section>

      {/* ======================== GALLERY ======================== */}
      <section className="mx-auto max-w-7xl px-4 py-24">
        <SectionHeading badge="🏛️ Campus" title="Our Virtual Campus" />
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { label: 'Digital Library', emoji: '📚' },
            { label: 'Innovation Lab', emoji: '🔬' },
            { label: 'Virtual Classrooms', emoji: '💻' },
            { label: 'AI Learning Studio', emoji: '🤖' },
            { label: 'Science Pavilion', emoji: '🧪' },
            { label: 'Global Lecture Hall', emoji: '🌍' },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ scale: 1.03 }}
              className="group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.03] to-white/[0.01] p-8 text-center backdrop-blur transition-all duration-500 hover:border-[#00e5ff]/30 hover:shadow-[0_0_30px_rgba(0,229,255,0.1)]"
            >
              <span className="text-5xl">{item.emoji}</span>
              <h3 className="mt-4 text-lg font-bold text-white">{item.label}</h3>
              <div className="mx-auto mt-3 h-px w-12 bg-gradient-to-r from-transparent via-[#00e5ff]/50 to-transparent" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ======================== CTA ======================== */}
      <section className="relative overflow-hidden py-32 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,229,255,0.08)_0%,transparent_60%)]" />
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-[#00e5ff]/10"
              style={{
                width: Math.random() * 4 + 2,
                height: Math.random() * 4 + 2,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0, 0.8, 0],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
        <div className="relative z-10 mx-auto max-w-4xl px-4">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-5xl font-bold leading-tight md:text-6xl"
          >
            Start Your{' '}
            <span className="bg-gradient-to-r from-[#00e5ff] to-[#3b82f6] bg-clip-text text-transparent">
              Learning Journey
            </span>{' '}
            Today
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-10"
          >
            <GlowButton to="/register">Enroll Now &rarr;</GlowButton>
          </motion.div>
        </div>
      </section>

      {/* ======================== FOOTER ======================== */}
      <footer className="border-t border-white/10 px-4 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-[#00e5ff]/50 to-transparent" />
          <div className="mt-12 grid gap-8 md:grid-cols-4">
            <div>
              <h3 className="text-xl font-bold text-white">
                <span className="text-[#00e5ff]">✦</span> Future Academy
              </h3>
              <p className="mt-3 text-sm text-[#b8c0cc]">Shaping tomorrow's leaders through innovation and excellence in education.</p>
            </div>
            {[
              { title: 'Quick Links', items: ['Home', 'Courses', 'Library', 'About'] },
              { title: 'Admissions', items: ['Apply Now', 'Tuition', 'Scholarships', 'FAQ'] },
              { title: 'Connect', items: ['Contact', 'Support', 'Careers', 'Blog'] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="mb-4 text-sm font-semibold text-[#b8c0cc] uppercase tracking-wider">{col.title}</h4>
                <ul className="space-y-2">
                  {col.items.map((item) => (
                    <li key={item}>
                      <a href="#" className="text-sm text-white/60 transition hover:text-[#00e5ff]">{item}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-white/5 pt-8 text-sm text-[#b8c0cc]/50">
            <p>© {new Date().getFullYear()} Future Academy. All rights reserved.</p>
            <div className="flex gap-4">
              {['Twitter', 'LinkedIn', 'YouTube', 'Instagram'].map((s) => (
                <a key={s} href="#" className="transition hover:text-[#00e5ff]">{s}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
