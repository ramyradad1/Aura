import SEOHead from '../components/SEOHead';
import { useTranslation } from '../context/TranslationContext';

export default function Terms() {
  const { t, language } = useTranslation();
  const dir = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <div className="max-w-4xl mx-auto px-4 py-16" dir={dir}>
      <SEOHead
        title={t("الشروط والأحكام")}
        description={t("اقرأ الشروط والأحكام الخاصة بشراء العطور واستخدام موقع أورا للعطور.")}
        ogUrl="/terms"
        canonicalUrl="/terms"
      />
      <h1 className="text-4xl font-serif font-bold text-gray-900 mb-8">{t('الشروط والأحكام')}</h1>
      <div className="prose prose-indigo max-w-none text-gray-600">
        <p className="mb-4">{t('مرحباً بك في أورا للعطور. باستخدامك لهذا الموقع، فإنك توافق على الالتزام بالشروط والأحكام التالية.')}</p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{t('استخدام الموقع')}</h2>
        <p className="mb-4">{t('يجب أن تكون بعمر 18 عاماً على الأقل لاستخدام هذا الموقع أو أن تستخدمه تحت إشراف الوالدين.')}</p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{t('المنتجات والأسعار')}</h2>
        <p className="mb-4">{t('نحتفظ بالحق في تغيير أسعار منتجاتنا في أي وقت دون إشعار مسبق. جميع الأسعار قابلة للتغيير وتخضع للضرائب المطبقة.')}</p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{t('الطلبات والإلغاء')}</h2>
        <p className="mb-4">{t('يحق لنا رفض أو تقييد أو إلغاء أي طلب تضعه لدينا لأي سبب كان، بما في ذلك الأخطاء في تسعير المنتجات.')}</p>
      </div>
    </div>
  );
}
