import { Link } from 'react-router-dom';
import { Home, ShoppingBag, BookOpen, Phone } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import { useTranslation } from '../context/TranslationContext';

export default function NotFound() {
  const { t, language } = useTranslation();
  const dir = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4" dir={dir}>
      <SEOHead title="الصفحة غير موجودة" noindex={true} />
      <h1 className="text-9xl font-bold text-primary/10 mb-4 font-serif">404</h1>
      <h2 className="text-3xl font-serif font-bold text-primary mb-4">{t('الصفحة غير موجودة')}</h2>
      <p className="text-on-surface-variant mb-8 max-w-md text-sm">
        {t('عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.')}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link 
          to="/" 
          className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl hover:opacity-90 transition font-bold text-sm"
        >
          <Home className="h-4 w-4" />
          {t('الصفحة الرئيسية')}
        </Link>
        <Link 
          to="/shop/all" 
          className="flex items-center gap-2 bg-primary/5 text-primary px-6 py-3 rounded-xl hover:bg-primary/10 transition font-bold text-sm"
        >
          <ShoppingBag className="h-4 w-4" />
          {t('تصفح العطور')}
        </Link>
        <Link 
          to="/blog" 
          className="flex items-center gap-2 bg-primary/5 text-primary px-6 py-3 rounded-xl hover:bg-primary/10 transition font-bold text-sm"
        >
          <BookOpen className="h-4 w-4" />
          {t('المدونة')}
        </Link>
        <Link 
          to="/contact" 
          className="flex items-center gap-2 bg-primary/5 text-primary px-6 py-3 rounded-xl hover:bg-primary/10 transition font-bold text-sm"
        >
          <Phone className="h-4 w-4" />
          {t('اتصل بنا')}
        </Link>
      </div>
    </div>
  );
}
