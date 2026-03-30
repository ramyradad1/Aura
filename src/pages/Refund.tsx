import SEOHead from '../components/SEOHead';
import { useTranslation } from '../context/TranslationContext';

export default function Refund() {
  const { t, language } = useTranslation();
  const dir = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <div className="max-w-4xl mx-auto px-4 py-16" dir={dir}>
      <SEOHead
        title={t("سياسة الاسترجاع")}
        description={t("تعرف على سياسة الاسترجاع والاستبدال لمنتجات أورا للعطور.")}
        ogUrl="/refund"
        canonicalUrl="/refund"
      />
      <h1 className="text-4xl font-serif font-bold text-gray-900 mb-8">{t('سياسة الاسترجاع')}</h1>
      <div className="prose prose-indigo max-w-none text-gray-600">
        <p className="mb-4">{t('نحن في أورا نضمن لك الجودة والرضا. إذا لم تكن راضياً عن مشترياتك، يمكنك إرجاعها وفقاً للشروط التالية:')}</p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{t('شروط الاسترجاع والاستبدال')}</h2>
        <ul className={`list-disc ${language === 'ar' ? 'pl-5 pr-5' : 'pl-5'} mb-4 space-y-2`}>
          <li>{t('يجب إرجاع المنتجات خلال 14 يوماً من تاريخ استلام الطلب.')}</li>
          <li>{t('يجب أن تكون المنتجات في حالتها الأصلية ومغلفة بغلافها الأصلي.')}</li>
          <li>{t('يجب إرفاق فاتورة الشراء الأصلية أو إثبات الشراء.')}</li>
        </ul>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{t('المنتجات غير القابلة للاسترجاع')}</h2>
        <p className="mb-4">{t('لأسباب صحية، لا يمكننا قبول إرجاع العطور بعد فتح غلافها الأصلي واستخدامها، إلا إذا كان هناك عيب مصنعي.')}</p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{t('كيفية طلب استرجاع')}</h2>
        <p className="mb-4">{t('يمكنك بدء عملية الاسترجاع عن طريق التواصل مع فريق خدمة العملاء عبر صفحة اتصل بنا أو عبر البريد الإلكتروني.')}</p>
      </div>
    </div>
  );
}
