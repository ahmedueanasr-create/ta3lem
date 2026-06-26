import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-brand-600">
          <span className="rounded-lg bg-brand-600 px-2 py-1 text-white">تـعليم</span>
        </Link>
        <div className="hidden gap-6 text-sm font-semibold md:flex">
          <a href="#features" className="hover:text-brand-600">المميزات</a>
          <a href="#subjects" className="hover:text-brand-600">المواد</a>
          <a href="#pricing" className="hover:text-brand-600">الأسعار</a>
          <a href="#faq" className="hover:text-brand-600">الأسئلة</a>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <>
              <Link to="/dashboard" className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm dark:bg-slate-800">
                لوحتي
              </Link>
              <button onClick={handleLogout} className="rounded-lg bg-red-500 px-3 py-1.5 text-sm text-white">
                خروج
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="rounded-lg px-3 py-1.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-800">
                دخول
              </Link>
              <Link to="/register" className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm text-white">
                ابدأ مجاناً
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
