import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import SEOHead from '../components/SEOHead';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4" dir="rtl">
      <SEOHead title="الصفحة غير موجودة" noindex={true} />
      <h1 className="text-9xl font-bold text-indigo-100 mb-4">404</h1>
      <h2 className="text-3xl font-serif font-bold text-gray-900 mb-6">الصفحة غير موجودة</h2>
      <p className="text-gray-600 mb-8 max-w-md">
        عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
      </p>
      <Link 
        to="/" 
        className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-full hover:bg-indigo-700 transition duration-300 font-medium"
      >
        <Home className="h-5 w-5" />
        العودة للصفحة الرئيسية
      </Link>
    </div>
  );
}
