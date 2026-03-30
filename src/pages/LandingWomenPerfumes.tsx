import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Star, Truck, Shield, ChevronDown, Flower2 } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import Breadcrumbs, { generateBreadcrumbSchema } from '../components/Breadcrumbs';
import { useTranslation } from '../context/TranslationContext';

const faqItems = [
  { q: 'ما أفضل عطر نسائي مستوحى في مصر؟', a: 'عطر Aura Rose المستوحى من Baccarat Rouge 540 هو الأكثر مبيعاً بين النساء في مصر. يتميز بتركيبة فريدة من الزعفران والياسمين وخشب العنبر.' },
  { q: 'كم سعر العطور النسائية في Aura?', a: 'تبدأ أسعار العطور النسائية من 95 ج.م لحجم 50ml. جميع العطور بتركيز Eau de Parfum لثبات يدوم من 8-12 ساعة.' },
  { q: 'هل العطور النسائية المستوحاة آمنة على البشرة؟', a: 'نعم، جميع عطورنا مصنوعة من مكونات عالية الجودة وآمنة تماماً على البشرة. ننصح بتجربة العطر على منطقة صغيرة أولاً إذا كانت بشرتك حساسة.' },
  { q: 'ما أفضل عطر نسائي للعرايس؟', a: 'ننصح بـ Aura Rose (مستوحى من Baccarat Rouge 540) أو Aura Blanc (مستوحى من Chanel No. 5). كلاهما يتميز بأناقة فاخرة تناسب ليلة العمر.' },
];

export default function LandingWomenPerfumes() {
  const { t, language } = useTranslation();
  const dir = language === 'ar' ? 'rtl' : 'ltr';

  const breadcrumbItems = [
    { label: t('المتجر'), href: '/shop/all' },
    { label: t('عطور نسائية فاخرة') },
  ];
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems);

  const landingSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'أجمل عطور نسائية فاخرة في مصر 2025',
    description: 'اكتشفي أجمل العطور النسائية المستوحاة من Baccarat Rouge 540 و Chanel No. 5. عطور فاخرة بأسعار مناسبة.',
    url: 'https://www.aura-perfumes.online/عطور-نسائية-فاخرة',
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map(item => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };

  const perfumes = [
    { name: 'Aura Rose', inspired: 'Baccarat Rouge 540', desc: 'عطر زهري فاخر بالزعفران والياسمين وخشب العنبر. الأكثر مبيعاً.', rating: 4.9 },
    { name: 'Aura Blanc', inspired: 'Chanel No. 5', desc: 'عطر كلاسيكي أنيق بالألدهيدات واليلانغ يلانغ والورد. أناقة لا تُقاوم.', rating: 4.8 },
    { name: 'Aura Gold', inspired: 'YSL Libre', desc: 'عطر حديث وجريء بزهر البرتقال واللافندر والفانيليا. مثالي للمرأة العصرية.', rating: 4.7 },
  ];

  return (
    <div className="min-h-screen bg-surface" dir={dir}>
      <SEOHead
        title="عطور نسائية فاخرة 2025 | Aura Perfumes | عرايس ومناسبات"
        description="تسوقي أفضل العطور النسائية الفاخرة المستوحاة من الماركات العالمية. عطور ثابتة وفواحة للعرايس والمناسبات بأفضل سعر في مصر. توصيل سريع."
        keywords="عطور نسائية فاخرة مصر, أفضل عطور نسائي 2025, عطور عرايس مصر, عطر باكارا روج مصر, عطور نسائية مستوحاة, عطور شانيل مصر, برفانات حريمي, برفان حريمي ثابت, احسن برفان حريمي, عطور حريمي تركيب, fragrances, fragrance, scents, scent, luxury fragrances, aura fragrances, برفانات, برفيوز, برفيومز, محاكاه, ريحه, برفان تركيب, برفان, برفيوم, برفيوم محاكاه, دار محاكاه, دور محاكاه, اورا, اورا للبرفانات, اورا برفيوم, اورا برفيومز, هاله"
        ogUrl="/women-perfumes-egypt"
        canonicalUrl="/عطور-نسائية-فاخرة"
        schema={[breadcrumbSchema, landingSchema, faqSchema]}
      />

      {/* Hero */}
      <section className="pt-32 pb-16 px-6 md:px-12 max-w-[1100px] mx-auto">
        <Breadcrumbs items={breadcrumbItems} />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mt-8 space-y-4">
          <span className="text-tertiary tracking-[0.2em] text-xs uppercase font-bold flex items-center justify-center gap-2">
            <Flower2 className="h-4 w-4" /> {t('عطور نسائية مستوحاة')}
          </span>
          <h1 className="text-4xl md:text-6xl font-serif text-primary">{t('أجمل عطور نسائية فاخرة')}</h1>
          <p className="text-on-surface-variant text-sm max-w-2xl mx-auto leading-relaxed">
            {t('اكتشفي مجموعتنا الفاخرة من العطور النسائية المستوحاة من أشهر الماركات العالمية. من Baccarat Rouge 540 إلى Chanel No. 5 — كل الروائح التي تحبينها بأسعار مناسبة.')}
          </p>
        </motion.div>
      </section>

      {/* Benefits */}
      <section className="pb-12 px-6 md:px-12 max-w-[1100px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Star, title: t('ثبات طول اليوم'), desc: t('8-12 ساعة على البشرة') },
            { icon: Truck, title: t('شحن مجاني'), desc: t('للطلبات فوق 50 ج.م') },
            { icon: Shield, title: t('مكونات آمنة'), desc: t('مناسبة لجميع أنواع البشرة') },
          ].map((b, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center p-6 bg-white rounded-xl border border-outline-variant/10">
              <b.icon className="h-8 w-8 text-tertiary mx-auto mb-3" />
              <h3 className="text-sm font-bold text-primary mb-1">{b.title}</h3>
              <p className="text-xs text-on-surface/50">{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Perfume Cards */}
      <section className="pb-16 px-6 md:px-12 max-w-[1100px] mx-auto">
        <h2 className="text-3xl font-serif text-primary mb-8 text-center">{t('أجمل العطور النسائية')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {perfumes.map((p, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl p-6 border border-outline-variant/10 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center gap-1 mb-3">
                {[1,2,3,4,5].map(s => <Star key={s} className={`h-4 w-4 ${s <= Math.round(p.rating) ? 'fill-tertiary-gold text-tertiary-gold' : 'text-outline-variant/30'}`} />)}
                <span className="text-xs text-on-surface/40 mr-2">{p.rating}</span>
              </div>
              <h3 className="text-xl font-serif text-primary mb-1">{p.name}</h3>
              <p className="text-xs text-tertiary mb-3">{t('مستوحى من')} {p.inspired}</p>
              <p className="text-sm text-on-surface/60 leading-relaxed mb-4">{t(p.desc)}</p>
              <Link to="/shop/women" className="inline-block px-6 py-2.5 bg-primary text-white rounded-lg text-xs font-bold hover:opacity-90 transition-opacity uppercase tracking-widest">
                {t('تسوقي الآن')}
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="pb-20 px-6 md:px-12 max-w-[800px] mx-auto">
        <h2 className="text-3xl font-serif text-primary mb-8 text-center">{t('أسئلة شائعة')}</h2>
        <div className="space-y-3">
          {faqItems.map((item, idx) => (
            <details key={idx} className="group bg-white rounded-xl border border-outline-variant/10 overflow-hidden">
              <summary className="flex items-center justify-between cursor-pointer px-6 py-4 text-sm font-bold text-primary hover:bg-surface-container-low transition-colors">
                {t(item.q)}
                <ChevronDown className="h-4 w-4 text-primary/40 transition-transform group-open:rotate-180" />
              </summary>
              <div className="px-6 pb-5 text-sm text-on-surface/70 leading-relaxed border-t border-outline-variant/10 pt-4">
                {t(item.a)}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="pb-20 px-6 md:px-12 max-w-[800px] mx-auto text-center">
        <div className="bg-linear-to-l from-primary/5 to-tertiary-gold/5 border border-outline-variant/20 rounded-2xl p-10 space-y-4">
          <h2 className="text-2xl font-serif text-primary">{t('اكتشفي عطرك المثالي')}</h2>
          <p className="text-on-surface-variant text-sm">{t('مجموعة واسعة من العطور النسائية الفاخرة بضمان الجودة والإرجاع.')}</p>
          <Link to="/shop/women" className="inline-block px-8 py-3 bg-tertiary-gold text-[#241a00] rounded-lg text-sm font-bold hover:brightness-110 transition-all">
            {t('تصفحي العطور النسائية')}
          </Link>
        </div>
      </section>
    </div>
  );
}
