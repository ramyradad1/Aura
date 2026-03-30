import SEOHead from '../components/SEOHead';
import { useTranslation } from '../context/TranslationContext';

export default function Privacy() {
  const { t, language } = useTranslation();
  const dir = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <div className="max-w-4xl mx-auto px-4 py-16" dir={dir}>
      <SEOHead
        title={t("سياسة الخصوصية")}
        description={t("تعرف على سياسة الخصوصية وكيفية حماية بياناتك الشخصية في متجر أورا للعطور.")}
        ogUrl="/privacy"
        canonicalUrl="/privacy"
      />
      <h1 className="text-4xl font-serif font-bold text-gray-900 mb-8">{t('سياسة الخصوصية')}</h1>
      <div className="prose prose-indigo max-w-none text-gray-600">
        <p className="mb-4">{t('في أورا للعطور، نأخذ خصوصيتك على محمل الجد. توضح هذه السياسة كيفية جمعنا واستخدامنا وحمايتنا لمعلوماتك الشخصية.')}</p>
        
        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{t('جمع المعلومات')}</h2>
        <p className="mb-4">{t('نقوم بجمع المعلومات التي تقدمها لنا مباشرة عند إنشاء حساب، إتمام عملية شراء، أو التواصل معنا. هذه المعلومات قد تشمل اسمك، عنوانك، رقم هاتفك، وبريدك الإلكتروني.')}</p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{t('استخدام المعلومات')}</h2>
        <p className="mb-4">{t('نستخدم المعلومات التي نجمعها لتقديم وصيانة وتحسين خدماتنا، بما في ذلك معالجة المعاملات وإرسال الإشعارات إليك وتقديم دعم العملاء.')}</p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{t('حماية المعلومات')}</h2>
        <p className="mb-4">{t('نحن ننفذ مجموعة متنوعة من الإجراءات الأمنية للحفاظ على سلامة معلوماتك الشخصية عندما تقوم بتقديم طلب أو الوصول إلى معلوماتك.')}</p>
      </div>
    </div>
  );
}
