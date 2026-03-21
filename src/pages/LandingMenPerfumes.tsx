import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Star, Truck, Shield, ChevronDown } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import Breadcrumbs, { generateBreadcrumbSchema } from '../components/Breadcrumbs';
import { useTranslation } from '../context/TranslationContext';

const faqItems = [
  { q: 'ما أفضل عطر رجالي مستوحى في مصر؟', a: 'عطر Aura Noir المستوحى من Creed Aventus يعتبر الأكثر مبيعاً بين الرجال في مصر بفضل ثباته من 8-12 ساعة وسعره المناسب. يليه Aura Bleu المستوحى من Bleu de Chanel.' },
  { q: 'كم سعر العطور الرجالية في Aura?', a: 'تبدأ أسعار العطور الرجالية من 85 ج.م لحجم 50ml وتصل إلى 150 ج.م لحجم 100ml. جميع العطور بتركيز Eau de Parfum لثبات عالي.' },
  { q: 'هل العطور الرجالية المستوحاة فيها فرق عن الأصلية؟', a: 'عطور Aura مصنوعة بمكونات عالية الجودة لتقديم 90-95% من نفس الرائحة الأصلية. الفرق في السعر فقط — نفس التجربة العطرية بسعر أقل بكثير.' },
  { q: 'هل فيه شحن لجميع محافظات مصر؟', a: 'نعم، نوفر شحن سريع (2-5 أيام عمل) لجميع محافظات مصر. الشحن مجاني للطلبات فوق 50 ج.م مع خدمة تتبع الطلب.' },
];

export default function LandingMenPerfumes() {
  const { t, language } = useTranslation();
  const dir = language === 'ar' ? 'rtl' : 'ltr';

  const breadcrumbItems = [
    { label: t('المتجر'), href: '/shop/all' },
    { label: t('عطور رجالية مصر') },
  ];
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems);

  const landingSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'أفضل عطور رجالي في مصر 2025',
    description: 'اكتشف أفضل العطور الرجالية المستوحاة من أشهر الماركات العالمية في مصر. عطور فاخرة بأسعار مناسبة مع شحن سريع.',
    url: 'https://www.aura-perfumes.online/عطور-رجالي-مصر',
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
    { name: 'Aura Noir', inspired: 'Creed Aventus', desc: 'عطر خشبي فاخر بنوتات أناناس وبلاك كرنت وبتولا. ثبات 10+ ساعات.', rating: 4.9 },
    { name: 'Aura Bleu', inspired: 'Bleu de Chanel', desc: 'عطر منعش بنوتات حمضية وخشب الأرز. مثالي للعمل والنهار.', rating: 4.8 },
    { name: 'Aura Oud', inspired: 'Tom Ford Oud Wood', desc: 'عطر شرقي فاخر بالعود الهندي والعنبر. مثالي للمناسبات.', rating: 4.7 },
  ];

  return (
    <div className="min-h-screen bg-surface" dir={dir}>
      <SEOHead
        title="أفضل عطور رجالي في مصر 2025 — عطور مستوحاة فاخرة"
        description="اكتشف أفضل العطور الرجالية المستوحاة من Creed Aventus و Bleu de Chanel في مصر. عطور فاخرة بثبات 8-12 ساعة وأسعار تبدأ من 85 ج.م. شحن سريع لجميع المحافظات."
        keywords="عطور رجالي مصر, أفضل عطور رجالية 2025, عطور رجالية فاخرة, عطر كريد أفينتوس مصر, عطور مستوحاة رجالي, عطر خشبي رجالي"
        ogUrl="/عطور-رجالي-مصر"
        schema={[breadcrumbSchema, landingSchema, faqSchema]}
      />

      {/* Hero */}
      <section className="pt-32 pb-16 px-6 md:px-12 max-w-[1100px] mx-auto">
        <Breadcrumbs items={breadcrumbItems} />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mt-8 space-y-4">
          <span className="text-tertiary tracking-[0.2em] text-xs uppercase font-bold">{t('عطور رجالية مستوحاة')}</span>
          <h1 className="text-4xl md:text-6xl font-serif text-primary">{t('أفضل عطور رجالي في مصر')}</h1>
          <p className="text-on-surface-variant text-sm max-w-2xl mx-auto leading-relaxed">
            {t('اكتشف مجموعتنا من العطور الرجالية المستوحاة من أشهر الماركات العالمية مثل Creed Aventus و Bleu de Chanel. جودة عالية وثبات يدوم بأسعار مناسبة مع شحن سريع لجميع محافظات مصر.')}
          </p>
        </motion.div>
      </section>

      {/* Benefits */}
      <section className="pb-12 px-6 md:px-12 max-w-[1100px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Star, title: t('ثبات 8-12 ساعة'), desc: t('تركيز Eau de Parfum عالي') },
            { icon: Truck, title: t('شحن سريع لمصر'), desc: t('2-5 أيام لجميع المحافظات') },
            { icon: Shield, title: t('ضمان الجودة'), desc: t('إرجاع سهل خلال 14 يوم') },
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
        <h2 className="text-3xl font-serif text-primary mb-8 text-center">{t('أشهر العطور الرجالية')}</h2>
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
              <Link to="/shop/men" className="inline-block px-6 py-2.5 bg-primary text-white rounded-lg text-xs font-bold hover:opacity-90 transition-opacity uppercase tracking-widest">
                {t('تسوق الآن')}
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
          <h2 className="text-2xl font-serif text-primary">{t('ابدأ التسوق الآن')}</h2>
          <p className="text-on-surface-variant text-sm">{t('جميع العطور بضمان الجودة وإمكانية الإرجاع. اكتشف عطرك المثالي.')}</p>
          <Link to="/shop/men" className="inline-block px-8 py-3 bg-tertiary-gold text-[#241a00] rounded-lg text-sm font-bold hover:brightness-110 transition-all">
            {t('تصفح العطور الرجالية')}
          </Link>
        </div>
      </section>
    </div>
  );
}
