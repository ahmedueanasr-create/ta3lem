import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../ThemeToggle';
import api from '../../lib/api';
import { useEffect, useState } from 'react';

const adminLinks = [
  { to: '/dashboard', label: 'الرئيسية', icon: '🏠' },
  { to: '/admin/users', label: 'المستخدمون', icon: '👥' },
  { to: '/admin/teachers', label: 'المدرسون', icon: '🧑‍🏫' },
  { to: '/admin/subjects', label: 'المواد', icon: '📚' },
  { to: '/admin/sessions', label: 'الحصص', icon: '🎥' },
  { to: '/admin/reports', label: 'التقارير', icon: '📊' },
  { to: '/admin/whatsapp', label: 'واتساب', icon: '💬' },
  { to: '/admin/settings', label: 'الإعدادات', icon: '⚙️' },
  { to: '/ai/tutor', label: 'المساعد الذكي', icon: '🧠' },
];

const teacherLinks = [
  { to: '/dashboard', label: 'الرئيسية', icon: '🏠' },
  { to: '/teacher/sessions', label: 'حصصي', icon: '🎥' },
  { to: '/teacher/create', label: 'إنشاء حصة', icon: '➕' },
  { to: '/teacher/courses', label: 'كورساتي', icon: '📦' },
  { to: '/teacher/homework', label: 'الواجبات', icon: '📝' },
  { to: '/teacher/exams', label: 'الاختبارات', icon: '✏️' },
  { to: '/teacher/earnings', label: 'أرباحي', icon: '💰' },
  { to: '/teacher/profile', label: 'ملفي وتسعيري', icon: '⚙️' },
  { to: '/ai/tutor', label: 'المساعد الذكي', icon: '🧠' },
];

const studentLinks = [
  { to: '/dashboard', label: 'الرئيسية', icon: '🏠' },
  { to: '/student/sessions', label: 'الحصص', icon: '🎥' },
  { to: '/student/recordings', label: 'التسجيلات', icon: '🎬' },
  { to: '/student/exams', label: 'اختباراتي', icon: '✏️' },
  { to: '/student/exam-history', label: 'نتائجي', icon: '🏆' },
  { to: '/student/homework', label: 'واجباتي', icon: '📝' },
  { to: '/my-certificates', label: 'شهاداتي', icon: '🏅' },
  { to: '/wallet', label: 'محفظتي', icon: '💳' },
  { to: '/ai/tutor', label: 'المساعد الذكي', icon: '🧠' },
];

const supervisorLinks = [
  { to: '/dashboard', label: 'الرئيسية', icon: '🏠' },
  { to: '/supervisor/students', label: 'متابعة الطلاب', icon: '🎓' },
  { to: '/admin/sessions', label: 'الحصص المباشرة', icon: '🎥' },
  { to: '/admin/reports', label: 'التقارير', icon: '📊' },
  { to: '/admin/teachers', label: 'المدرسون', icon: '🧑‍🏫' },
  { to: '/admin/whatsapp', label: 'واتساب', icon: '💬' },
  { to: '/ai/tutor', label: 'المساعد الذكي', icon: '🧠' },
];

const parentLinks = [
  { to: '/parent/dashboard', label: 'لوحة التحكم', icon: '📊' },
  { to: '/parent/link-student', label: 'ربط طالب', icon: '🔗' },
  { to: '/parent/payments', label: 'المدفوعات', icon: '💳' },
  { to: '/settings', label: 'الإعدادات', icon: '⚙️' },
];

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);

  const role = user?.role?.name;
  let links = studentLinks;
  if (role === 'super_admin' || role === 'platform_admin') links = adminLinks;
  else if (role === 'teacher') links = teacherLinks;
  else if (role === 'teachers_supervisor' || role === 'student_supervisor') links = supervisorLinks;
  else if (role === 'parent') links = parentLinks;

  useEffect(() => {
    api.get('/notifications?unread=true').then((r) => setUnread(r.data.meta?.total || 0)).catch(() => {});
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 right-0 z-30 w-64 border-l border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex h-16 items-center justify-center border-b border-slate-200 dark:border-slate-800">
          <span className="text-xl font-bold text-brand-600">تـعليم</span>
        </div>
        <nav className="mt-4 space-y-1 px-3">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/dashboard'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-brand-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`
              }
            >
              <span>{l.icon}</span>
              {l.label}
            </NavLink>
          ))}
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`
            }
          >
            <span>👤</span>
            الملف الشخصي
          </NavLink>
        </nav>
      </aside>

      {/* Main */}
      <div className="mr-64 flex-1">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center gap-4">
            <span className="font-semibold">{user?.name}</span>
            <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-700/30 dark:text-brand-300">
              {user?.role?.label}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/notifications')}
              className="relative rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              🔔
              {unread > 0 && (
                <span className="absolute -top-0.5 -left-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs text-white">
                  {unread > 99 ? '99+' : unread}
                </span>
              )}
            </button>
            <ThemeToggle />
            <button onClick={handleLogout} className="rounded-lg bg-red-500 px-3 py-1.5 text-sm text-white">
              خروج
            </button>
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
