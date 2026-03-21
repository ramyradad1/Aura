import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Star, Check, X, ChevronDown, ArrowLeft } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import Breadcrumbs, { generateBreadcrumbSchema } from '../components/Breadcrumbs';
import { useTranslation } from '../context/TranslationContext';

const comparisons = [
  {
    slug: 'aura-noir-vs-creed-aventus',
    title: 'Aura Noir مقابل Creed Aventus — مقارنة شاملة',
    seoTitle: 'مقارنة Aura Noir و Creed Aventus — أيهما أفضل؟',
    description: 'مقارنة تفصيلية بين Aura Noir و Creed Aventus الأصلي. اكتشف الفرق في الثبات والرائحة والسعر.',
    keywords: 'Aura Noir vs Creed Aventus, مقارنة عطور, كريد أفينتوس, عطور مستوحاة, الفرق بين العطر المستوحى والأصلي',
    aura: { name: 'Aura Noir', category: 'men', price: '95 - 150 ج.م', img: '/images/category_men.png' },
    original: { name: 'Creed Aventus', price: '6,000 - 12,000 ج.م' },
    specs: [
      { label: 'النوتات العليا', aura: 'أناناس، بلاك كرنت، تفاح', original: 'أناناس، بلاك كرنت، تفاح، بيرغاموت' },
      { label: 'نوتات القلب', aura: 'بتولا، باتشولي', original: 'بتولا، باتشولي، ورد، ياسمين' },
      { label: 'النوتات القاعدية', aura: 'مسك أبيض، خشب الصندل', original: 'مسك، خشب الصندل، فانيليا' },
      { label: 'التركيز', aura: 'Eau de Parfum', original: 'Eau de Parfum' },
      { label: 'الثبات', aura: '8-12 ساعة', original: '10-14 ساعة' },
      { label: 'مطابقة الرائحة', aura: '90-95%', original: '100%' },
      { label: 'الحجم', aura: '50ml / 100ml', original: '50ml / 100ml' },
    ],
    features: [
      { label: 'ثبات عالي', aura: true, original: true },
      { label: 'سعر اقتصادي', aura: true, original: false },
      { label: 'شحن مجاني لمصر', aura: true, original: false },
      { label: 'تغليف فاخر', aura: true, original: true },
      { label: 'ضمان إرجاع', aura: true, original: false },
    ],
    verdict: 'Aura Noir يقدم 90-95% من نفس تجربة Creed Aventus الأصلي ولكن بسعر أقل بـ 98%. الفرق في الثبات بسيط جداً (2 ساعة فقط) والرائحة شبه مطابقة. الخيار المثالي لمن يحب Aventus بدون الثمن الباهظ.',
  },
  {
    slug: 'aura-rose-vs-baccarat-rouge',
    title: 'Aura Rose مقابل Baccarat Rouge 540 — مقارنة شاملة',
    seoTitle: 'مقارنة Aura Rose و Baccarat Rouge 540 — أيهما أفضل؟',
    description: 'مقارنة تفصيلية بين Aura Rose و Baccarat Rouge 540 الأصلي. اكتشفي الفرق في الرائحة والثبات.',
    keywords: 'Aura Rose vs Baccarat Rouge 540, مقارنة عطور نسائية, باكارا روج, عطور مستوحاة نسائية',
    aura: { name: 'Aura Rose', category: 'women', price: '95 - 150 ج.م', img: '/images/category_women.png' },
    original: { name: 'Baccarat Rouge 540', price: '8,000 - 15,000 ج.م' },
    specs: [
      { label: 'النوتات العليا', aura: 'زعفران، ياسمين', original: 'زعفران، ياسمين' },
      { label: 'نوتات القلب', aura: 'عنبر، أرز', original: 'عنبر، أرز' },
      { label: 'النوتات القاعدية', aura: 'فيرنيش، مسك', original: 'فيرنيش، مسك' },
      { label: 'التركيز', aura: 'Eau de Parfum', original: 'Eau de Parfum' },
      { label: 'الثبات', aura: '8-10 ساعات', original: '10-14 ساعة' },
      { label: 'مطابقة الرائحة', aura: '92-95%', original: '100%' },
      { label: 'الحجم', aura: '50ml / 100ml', original: '70ml' },
    ],
    features: [
      { label: 'رائحة مميزة', aura: true, original: true },
      { label: 'سعر اقتصادي', aura: true, original: false },
      { label: 'شحن مجاني لمصر', aura: true, original: false },
      { label: 'تغليف فاخر', aura: true, original: true },
      { label: 'ضمان إرجاع', aura: true, original: false },
    ],
    verdict: 'Aura Rose يقدم تجربة مذهلة بنسبة تطابق 92-95% مع Baccarat Rouge 540 الأصلي. الفرق الأساسي في السعر — توفير أكثر من 97% مع نفس الفخامة. مثالي كهدية أو للاستخدام اليومي.',
  },
];

export default function PerfumeComparison() {
  const { t, language } = useTranslation();
  const dir = language === 'ar' ? 'rtl' : 'ltr';

  const breadcrumbItems = [
    { label: t('المتجر'), href: '/shop/all' },
    { label: t('مقارنة العطور') },
  ];
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems);

  const comparisonFaqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'هل العطور المستوحاة نفس رائحة الأصلية؟',
        acceptedAnswer: { '@type': 'Answer', text: 'نعم، عطور Aura مصنوعة بمكونات عالية الجودة لتقديم 90-95% من نفس الرائحة الأصلية. الفرق الرئيسي في السعر فقط.' },
      },
      {
        '@type': 'Question',
        name: 'ما الفرق بين العطر المستوحى والعطر الأصلي؟',
        acceptedAnswer: { '@type': 'Answer', text: 'العطر المستوحى يستخدم مكونات مشابهة لتقديم نفس الرائحة ولكن بعلامة تجارية مختلفة وسعر أقل بكثير. الجودة والثبات قريبة جداً من الأصلي.' },
      },
      {
        '@type': 'Question',
        name: 'لماذا العطور المستوحاة أرخص؟',
        acceptedAnswer: { '@type': 'Answer', text: 'العطور الأصلية تشمل تكاليف التسويق والعلامة التجارية والتوزيع العالمي. العطور المستوحاة تركز على جودة المكونات فقط، مما يجعلها اقتصادية بدون التنازل عن الرائحة.' },
      },
    ],
  };

  return (
    <div className="min-h-screen bg-surface" dir={dir}>
      <SEOHead
        title="مقارنة العطور المستوحاة بالأصلية — أيهما أفضل؟"
        description="مقارنة تفصيلية بين عطور Aura المستوحاة والعطور الأصلية. تعرف على الفرق في الثبات والرائحة والسعر. Aura Noir vs Creed Aventus و Aura Rose vs Baccarat Rouge 540."
        keywords="مقارنة عطور, عطور مستوحاة مقابل أصلية, Aura Noir vs Creed Aventus, Aura Rose vs Baccarat Rouge, الفرق بين العطر المستوحى والأصلي"
        ogUrl="/مقارنة-العطور"
        schema={[breadcrumbSchema, comparisonFaqSchema]}
      />

      {/* Hero */}
      <section className="pt-32 pb-12 px-6 md:px-12 max-w-[1100px] mx-auto">
        <Breadcrumbs items={breadcrumbItems} />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mt-8 space-y-4">
          <h1 className="text-4xl md:text-6xl font-serif text-primary">{t('مقارنة العطور المستوحاة بالأصلية')}</h1>
          <p className="text-on-surface-variant text-sm max-w-2xl mx-auto leading-relaxed">
            {t('هل فعلاً العطور المستوحاة بنفس جودة الأصلية؟ قارن بنفسك واكتشف الفرق الحقيقي في الثبات والرائحة والسعر.')}
          </p>
        </motion.div>
      </section>

      {/* Comparisons */}
      {comparisons.map((comp, ci) => (
        <section key={ci} className="pb-16 px-6 md:px-12 max-w-[1000px] mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <h2 className="text-3xl font-serif text-primary mb-8 text-center">{t(comp.title)}</h2>

            {/* Specs Table */}
            <div className="bg-white rounded-2xl overflow-hidden border border-outline-variant/10 mb-6">
              {/* Header */}
              <div className="grid grid-cols-3 bg-primary text-white text-center text-xs font-bold py-3">
                <div>{t('المواصفة')}</div>
                <div className="text-tertiary-gold">{comp.aura.name}</div>
                <div>{comp.original.name}</div>
              </div>
              {/* Price Row */}
              <div className="grid grid-cols-3 text-center text-sm py-3 border-b border-outline-variant/10 bg-tertiary-gold/5">
                <div className="font-bold text-primary">{t('السعر')}</div>
                <div className="font-bold text-green-600">{comp.aura.price}</div>
                <div className="text-red-500">{comp.original.price}</div>
              </div>
              {/* Specs Rows */}
              {comp.specs.map((spec, i) => (
                <div key={i} className={`grid grid-cols-3 text-center text-xs py-3 border-b border-outline-variant/5 ${i % 2 === 0 ? 'bg-surface-container-low' : ''}`}>
                  <div className="font-medium text-primary">{t(spec.label)}</div>
                  <div className="text-on-surface/70">{spec.aura}</div>
                  <div className="text-on-surface/70">{spec.original}</div>
                </div>
              ))}
            </div>

            {/* Features Checklist */}
            <div className="bg-white rounded-2xl overflow-hidden border border-outline-variant/10 mb-6">
              <div className="grid grid-cols-3 bg-surface-container-low text-center text-xs font-bold py-3 border-b border-outline-variant/10">
                <div className="text-primary">{t('المميزات')}</div>
                <div className="text-tertiary">{comp.aura.name}</div>
                <div>{comp.original.name}</div>
              </div>
              {comp.features.map((f, i) => (
                <div key={i} className="grid grid-cols-3 text-center text-sm py-3 border-b border-outline-variant/5">
                  <div className="text-primary text-xs">{t(f.label)}</div>
                  <div>{f.aura ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : <X className="h-5 w-5 text-red-400 mx-auto" />}</div>
                  <div>{f.original ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : <X className="h-5 w-5 text-red-400 mx-auto" />}</div>
                </div>
              ))}
            </div>

            {/* Verdict */}
            <div className="bg-linear-to-l from-primary/5 to-tertiary-gold/5 border border-outline-variant/20 rounded-2xl p-6 text-center space-y-3">
              <h3 className="text-lg font-serif text-primary">{t('الخلاصة')}</h3>
              <p className="text-sm text-on-surface/70 leading-relaxed">{t(comp.verdict)}</p>
              <Link to={`/shop/${comp.aura.category}`} className="inline-block mt-2 px-8 py-3 bg-tertiary-gold text-[#241a00] rounded-lg text-sm font-bold hover:brightness-110 transition-all">
                {t('تسوق')} {comp.aura.name} {t('الآن')}
              </Link>
            </div>
          </motion.div>
        </section>
      ))}

      {/* FAQ */}
      <section className="pb-20 px-6 md:px-12 max-w-[800px] mx-auto">
        <h2 className="text-3xl font-serif text-primary mb-8 text-center">{t('أسئلة شائعة')}</h2>
        <div className="space-y-3">
          {comparisonFaqSchema.mainEntity.map((item: any, idx: number) => (
            <details key={idx} className="group bg-white rounded-xl border border-outline-variant/10 overflow-hidden">
              <summary className="flex items-center justify-between cursor-pointer px-6 py-4 text-sm font-bold text-primary hover:bg-surface-container-low transition-colors">
                {t(item.name)}
                <ChevronDown className="h-4 w-4 text-primary/40 transition-transform group-open:rotate-180" />
              </summary>
              <div className="px-6 pb-5 text-sm text-on-surface/70 leading-relaxed border-t border-outline-variant/10 pt-4">
                {t(item.acceptedAnswer.text)}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="pb-20 px-6 md:px-12 max-w-[800px] mx-auto text-center">
        <Link to="/shop/all" className="inline-block px-10 py-3 bg-primary text-white rounded-lg text-sm font-bold hover:opacity-90 transition-opacity uppercase tracking-widest">
          {t('تصفح جميع العطور')}
        </Link>
      </section>
    </div>
  );
}
