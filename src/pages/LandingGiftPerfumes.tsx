import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Star, Gift, ChevronDown, Heart, Sparkles } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import Breadcrumbs, { generateBreadcrumbSchema } from '../components/Breadcrumbs';
import { useTranslation } from '../context/TranslationContext';

const faqItems = [
  { q: 'ما أفضل عطر هدية لرجل في مصر؟', a: 'عطر Aura Noir المستوحى من Creed Aventus هو الخيار الأمثل كهدية رجالية فاخرة. يأتي في علبة أنيقة مناسبة للإهداء بسعر يبدأ من 85 ج.م.' },
  { q: 'ما أفضل عطر هدية لعروسة؟', a: 'ننصح بـ Aura Rose المستوحى من Baccarat Rouge 540 أو Aura Blanc المستوحى من Chanel No. 5. كلاهما يأتي في تغليف فاخر مناسب كهدية زفاف.' },
  { q: 'هل يوجد تغليف هدايا؟', a: 'جميع عطورنا تأتي في علب أنيقة فاخرة مناسبة للإهداء مباشرة. يمكنك أيضاً إضافة رسالة شخصية مع الطلب.' },
  { q: 'هل يمكن إرجاع عطر الهدية؟', a: 'نعم، نوفر سياسة إرجاع مرنة خلال 14 يوم بشرط عدم فتح العطر. مثالي في حالة عدم ملاءمة الهدية.' },
];

export default function LandingGiftPerfumes() {
  const { t, language } = useTranslation();
  const dir = language === 'ar' ? 'rtl' : 'ltr';

  const breadcrumbItems = [
    { label: t('المتجر'), href: '/shop/all' },
    { label: t('عطور هدايا') },
  ];
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems);

  const landingSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'أفضل عطور هدايا في مصر 2025',
    description: 'اكتشف أفضل العطور المناسبة كهدايا للرجال والنساء في مصر. عطور فاخرة بتغليف أنيق.',
    url: 'https://www.aura-perfumes.online/عطور-هدايا',
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

  const gifts = [
    { name: 'Aura Noir', for: t('هدية رجالي'), inspired: 'Creed Aventus', desc: t('الخيار المثالي لكل رجل يحب العطور الفاخرة. ثبات عالي ورائحة أنيقة.'), rating: 4.9, link: '/shop/men' },
    { name: 'Aura Rose', for: t('هدية عروسة'), inspired: 'Baccarat Rouge 540', desc: t('أروع هدية لليلة العمر. عطر ساحر بتركيبة فريدة ورائحة لا تُنسى.'), rating: 4.9, link: '/shop/women' },
    { name: 'Aura Oud', for: t('هدية فاخرة'), inspired: 'Tom Ford Oud Wood', desc: t('عطر عود شرقي فاخر يناسب الجنسين. مثالي لمحبي العطور التقليدية.'), rating: 4.8, link: '/shop/unisex' },
    { name: 'Aura Bleu', for: t('هدية عيد ميلاد'), inspired: 'Bleu de Chanel', desc: t('عطر منعش وأنيق للاستخدام اليومي. هدية عملية يستخدمها كل يوم.'), rating: 4.8, link: '/shop/men' },
  ];

  return (
    <div className="min-h-screen bg-surface" dir={dir}>
      <SEOHead
        title="عطور هدايا فخمة | أطقم هدايا عطور رجالي ونسائي | Aura"
        description="تبحث عن هدية مميزة؟ نقدم لك أطقم عطور مستوحاة فاخرة للرجال والنساء تغليف أنيق وثبات يدوم. أفضل خيار لهدايا الأعياد والمناسبات في مصر."
        keywords="عطور هدايا, أفضل عطور هدايا رجالي, عطور عرايس مصر, هدية عطر فاخر, عطور مناسبات, هدايا عيد ميلاد عطور, برفانات هدايا, ازازة برفان شيك, برفانات عرايس, fragrances, fragrance, scents, scent, luxury fragrances, aura fragrances, برفانات, برفيوز, برفيومز, محاكاه, ريحه, برفان تركيب, برفان, برفيوم, برفيوم محاكاه, دار محاكاه, دور محاكاه, اورا, اورا للبرفانات, اورا برفيوم, اورا برفيومز, هاله"
        ogUrl="/perfume-gifts-egypt"
        canonicalUrl="/عطور-هدايا"
        schema={[breadcrumbSchema, landingSchema, faqSchema]}
      />

      {/* Hero */}
      <section className="pt-32 pb-16 px-6 md:px-12 max-w-[1100px] mx-auto">
        <Breadcrumbs items={breadcrumbItems} />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mt-8 space-y-4">
          <span className="text-tertiary tracking-[0.2em] text-xs uppercase font-bold flex items-center justify-center gap-2">
            <Gift className="h-4 w-4" /> {t('دليل هدايا العطور')}
          </span>
          <h1 className="text-4xl md:text-6xl font-serif text-primary">{t('أفضل عطور هدايا في مصر')}</h1>
          <p className="text-on-surface-variant text-sm max-w-2xl mx-auto leading-relaxed">
            {t('ابحث عن هدية العطر المثالية لأي مناسبة — من هدايا أعياد الميلاد إلى هدايا العرايس. كل عطورنا بتغليف فاخر جاهز للإهداء.')}
          </p>
        </motion.div>
      </section>

      {/* Gift Ideas */}
      <section className="pb-16 px-6 md:px-12 max-w-[1100px] mx-auto">
        <h2 className="text-3xl font-serif text-primary mb-8 text-center">{t('اختر هديتك المثالية')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {gifts.map((g, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl p-6 border border-outline-variant/10 hover:shadow-xl transition-shadow relative overflow-hidden"
            >
              <span className="absolute top-4 left-4 bg-tertiary-gold/10 text-tertiary-gold text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <Heart className="h-3 w-3" /> {g.for}
              </span>
              <div className="flex items-center gap-1 mb-3 mt-8">
                {[1,2,3,4,5].map(s => <Star key={s} className={`h-4 w-4 ${s <= Math.round(g.rating) ? 'fill-tertiary-gold text-tertiary-gold' : 'text-outline-variant/30'}`} />)}
                <span className="text-xs text-on-surface/40 mr-2">{g.rating}</span>
              </div>
              <h3 className="text-xl font-serif text-primary mb-1">{g.name}</h3>
              <p className="text-xs text-tertiary mb-3">{t('مستوحى من')} {g.inspired}</p>
              <p className="text-sm text-on-surface/60 leading-relaxed mb-4">{g.desc}</p>
              <Link to={g.link} className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg text-xs font-bold hover:opacity-90 transition-opacity uppercase tracking-widest">
                <Sparkles className="h-3.5 w-3.5" /> {t('اطلب الآن')}
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
          <h2 className="text-2xl font-serif text-primary">{t('اكتشف المزيد من العطور')}</h2>
          <p className="text-on-surface-variant text-sm">{t('تصفح مجموعتنا الكاملة واختر هديتك المثالية لأي مناسبة.')}</p>
          <Link to="/shop/all" className="inline-block px-8 py-3 bg-tertiary-gold text-[#241a00] rounded-lg text-sm font-bold hover:brightness-110 transition-all">
            {t('تصفح جميع العطور')}
          </Link>
        </div>
      </section>
    </div>
  );
}
