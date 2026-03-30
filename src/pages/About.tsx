import SEOHead from '../components/SEOHead';
import { Sparkles, CheckCircle, Shield, ThumbsUp } from 'lucide-react';
import { useTranslation } from '../context/TranslationContext';

export default function About() {
  const { t, language } = useTranslation();
  const dir = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <div className="max-w-4xl mx-auto px-4 py-16" dir={dir}>
      <SEOHead
        title={t("من نحن")}
        description={t("تعرف على أورا للعطور، وجهتك الأولى لاكتشاف العطور المستوحاة بجودة عالمية وثبات لا يضاهى.")}
        keywords={t("من نحن أورا للعطور, قصة أورا, جودة العطور, عطور مستوحاة")}
        ogUrl="/about"
        canonicalUrl="/about"
      />
      <div className="text-center mb-16">
        <Sparkles className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
        <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">{t('أورا للعطور')}</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          {t('وجهتك الأولى لاكتشاف الجاذبية العطرية المتميزة. نحن نقدم تشكيلة راقية من العطور المستوحاة المصممة بحرفية لتناسب أصحاب الذوق الرفيع.')}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-lg mb-2">{t('جودة عالمية')}</h3>
          <p className="text-gray-600 text-sm">{t('نستخدم أفضل الزيوت العطرية العالمية في صياغة منتجاتنا لضمان الجودة.')}</p>
        </div>
        <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <ThumbsUp className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-lg mb-2">{t('ثبات يدوم')}</h3>
          <p className="text-gray-600 text-sm">{t('عطورنا مصممة بتركيز عالي لتبقى معك وترافقك أينما كنت.')}</p>
        </div>
        <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-lg mb-2">{t('تسوق آمن')}</h3>
          <p className="text-gray-600 text-sm">{t('نضمن لك تجربة تسوق آمنة ومريحة مع سياسة استرجاع مرنة.')}</p>
        </div>
      </div>
    </div>
  );
}
