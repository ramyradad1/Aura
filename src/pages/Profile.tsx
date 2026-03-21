import SEOHead from '../components/SEOHead';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { User, Package, Heart, LogOut } from 'lucide-react';
import { useTranslation } from '../context/TranslationContext';

export default function Profile() {
  const { user, logout } = useAuth();
  const { t, language } = useTranslation();
  const dir = language === 'ar' ? 'rtl' : 'ltr';

  if (!user) {
    return <Navigate to="/" />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-16" dir={dir}>
      <SEOHead title={t("الملف الشخصي")} noindex={true} />
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-serif font-bold text-gray-900">{t('الملف الشخصي')}</h1>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-red-600 hover:text-red-800 transition-colors"
        >
          <LogOut className={`h-5 w-5 ${language === 'ar' ? 'rotate-180' : ''}`} />
          <span>{t('تسجيل الخروج')}</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="p-8 flex items-center gap-6">
          <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
            <User className="h-10 w-10" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{user.email?.split('@')[0]}</h2>
            <p className="text-gray-500">{user.email}</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <Package className="h-6 w-6 text-indigo-600" />
            <h2 className="text-xl font-bold">{t('طلباتي')}</h2>
          </div>
          <p className="text-gray-500 text-center py-8">{t('لا توجد طلبات سابقة حتى الآن.')}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <Heart className="h-6 w-6 text-pink-600" />
            <h2 className="text-xl font-bold">{t('نشاطاتي')}</h2>
          </div>
          <ul className="space-y-4">
            <li className="flex justify-between items-center text-sm border-b pb-4">
              <span>{t('تاريخ الانضمام')}</span>
              <span className="font-medium">{new Date().toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}</span>
            </li>
            <li className="flex justify-between items-center text-sm pb-2">
              <span>{t('حالة الحساب')}</span>
              <span className="text-green-600 font-medium">{t('نشط')}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
