import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-8xl font-bold text-brand-600">404</h1>
        <p className="mt-4 text-xl font-semibold text-slate-700 dark:text-slate-300">
          الصفحة غير موجودة
        </p>
        <p className="mt-2 text-slate-500">الصفحة التي تبحث عنها غير متاحة أو تم نقلها.</p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-lg bg-brand-600 px-6 py-2.5 font-bold text-white"
        >
          العودة للرئيسية
        </Link>
      </div>
    </div>
  );
}
