import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import AIRecommendations from '../components/AIRecommendations';
import PerfumeCard from '../components/PerfumeCard';
import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { mockPerfumes } from '../data/mockData';
import { useTranslation } from '../context/TranslationContext';

export default function Home() {
  const { t } = useTranslation();

  const faqItems = [
    {
      question: t('ما هي العطور المستوحاة؟'),
      answer: t('العطور المستوحاة هي عطور مُصنعة بمكونات عالية الجودة لتقديم رائحة مشابهة للعطور العالمية المشهورة بسعر مناسب. وهي ليست مقلدة بل تركيبات أصلية مستوحاة من الروائح الشهيرة.'),
    },
    {
      question: t('كم يدوم ثبات عطور Aura؟'),
      answer: t('عطورنا مُصنعة بتركيز عالي من الزيوت العطرية لضمان ثبات يدوم من 8 إلى 12 ساعة على البشرة، وأكثر على الملابس والأقمشة.'),
    },
    {
      question: t('هل تشحنون لجميع أنحاء الوطن العربي؟'),
      answer: t('نعم! نوفر شحن سريع لجميع أنحاء مصر والوطن العربي مع خاصية تتبع الطلبات لضمان وصولها بأمان.'),
    },
    {
      question: t('ما الأحجام المتاحة؟'),
      answer: t('جميع عطورنا متوفرة بحجم 50ml و100ml. بعض العطور قد تتوفر أيضاً بأحجام سفر صغيرة.'),
    },
    {
      question: t('هل هذه عطور أصلية؟'),
      answer: t('عطور Aura هي عطور مستوحاة من العطور العالمية وليست العطور الأصلية نفسها. نحن غير مرتبطين بأي من العلامات التجارية الأصلية المذكورة. جميع العلامات التجارية ملك لأصحابها.'),
    },
  ];

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': faqItems.map(item => ({
      '@type': 'Question',
      'name': item.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': item.answer,
      },
    })),
  };

  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Aura Perfumes',
    url: 'https://www.aura-perfumes.online',
    logo: 'https://www.aura-perfumes.online/icon.png',
    description: t('متجر عطور مستوحاة من أشهر الماركات العالمية بجودة عالية وثبات يدوم.'),
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'EG'
    }
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Aura Perfumes',
    url: 'https://www.aura-perfumes.online',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://www.aura-perfumes.online/shop/all?search={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: 'Aura Perfumes',
    alternateName: 'أورا بيرفيومز',
    description: t('متجر عطور مستوحاة من أشهر الماركات العالمية بجودة عالية وثبات يدوم.'),
    url: 'https://www.aura-perfumes.online',
    logo: 'https://www.aura-perfumes.online/icon.png',
    image: 'https://www.aura-perfumes.online/og-image.jpg',
    telephone: '+201234567890',
    email: 'info@aura-perfumes.online',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'EG',
      addressLocality: 'Cairo',
      addressRegion: 'Cairo',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '30.0444',
      longitude: '31.2357',
    },
    priceRange: '85-300 EGP',
    currenciesAccepted: 'EGP',
    paymentAccepted: 'Cash, Credit Card',
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '00:00',
      closes: '23:59',
    },
    areaServed: {
      '@type': 'Country',
      name: 'Egypt',
    },
    sameAs: [
      'https://www.facebook.com/AuraPerfumesEG',
      'https://www.instagram.com/AuraPerfumesEG',
      'https://wa.me/201234567890',
    ],
  };

  const [catalogPerfumes, setCatalogPerfumes] = useState<any[]>([]);

  useEffect(() => {
    const fetchPerfumes = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'perfumes'));
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
        setCatalogPerfumes(data.length > 0 ? data : mockPerfumes);
      } catch {
        setCatalogPerfumes(mockPerfumes);
      }
    };
    fetchPerfumes();
  }, []);

  return (
    <div className="min-h-screen bg-surface">
      <SEOHead
        title={t('الرئيسية')}
        description={t('Aura Perfumes — اكتشف تشكيلة فاخرة من العطور المستوحاة من أشهر الماركات العالمية. عطور رجالية ونسائية وللجنسين بجودة عالية وثبات يدوم وسعر مناسب. شحن سريع لمصر والوطن العربي.')}
        keywords={t('عطور, عطور مستوحاة, عطور رجالية, عطور نسائية, عطور للجنسين, Aura Perfumes, عطور فاخرة, عطور مصر, inspired perfumes, كريد أفينتوس, باكارا روج, شانيل')}
        ogUrl="/"
        canonicalUrl="/"
        schema={[faqSchema, orgSchema, websiteSchema, localBusinessSchema]}
      />

      {/* ══════════════ Section 1: Hero ══════════════ */}
      <section className="relative h-screen min-h-[700px] flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-l from-[#1a0a2e]/90 via-[#1a0a2e]/70 to-[#1a0a2e]/50 z-10" />
          <img 
            src="/images/hero_bg.png" 
            alt="عطور فاخرة مستوحاة من أشهر الماركات العالمية - Aura Perfumes" 
            className="w-full h-full object-cover"
            loading="eager"
            fetchPriority="high"
          />
        </div>
        {/* Content */}
        <div className="relative z-20 px-8 md:px-24 w-full max-w-[1400px] mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="max-w-2xl space-y-8"
          >
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif italic leading-tight text-white">
              {t('اكتشف عطرك')} <br/>
              <span className="text-tertiary-gold">{t('المفضل الجديد')}</span>
            </h1>
            <p className="text-lg md:text-xl font-light text-white/80 max-w-lg">
              {t('نقدم لك تشكيلة فاخرة من العطور المستوحاة من أشهر الماركات العالمية، بثبات عالي وسعر مناسب.')}
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link 
                to="/shop/all" 
                className="px-8 py-4 md:px-10 md:py-5 bg-tertiary-gold text-[#241a00] rounded-lg uppercase tracking-widest text-sm hover:brightness-110 transition-all shadow-xl shadow-tertiary-gold/30 font-bold flex items-center gap-2"
              >
                <ShoppingBag className="h-4 w-4" />
                {t('تسوق المجموعة')}
              </Link>
              <Link 
                to="/quiz" 
                className="px-8 py-4 md:px-10 md:py-5 border border-white/40 text-white rounded-lg uppercase tracking-widest text-sm hover:bg-white/10 transition-all font-bold"
              >
                {t('اختبار العطور')}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════ Section 2: Categories ══════════════ */}
      <section className="py-20 md:py-32 px-6 md:px-12 max-w-[1400px] mx-auto" aria-labelledby="categories-heading">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 space-y-4"
        >
          <span className="text-tertiary tracking-[0.2em] text-xs uppercase font-bold">{t('تسوق حسب الفئة')}</span>
          <h2 id="categories-heading" className="text-4xl md:text-5xl font-serif text-primary">{t('اختر ما يناسبك')}</h2>
          <p className="text-on-surface-variant text-sm max-w-md mx-auto">{t('مجموعات متنوعة تناسب كل الأذواق')}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
          {/* Women */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-7 relative group overflow-hidden rounded-2xl cursor-pointer h-[300px] md:h-[600px]"
          >
            <Link to="/shop/women" className="block w-full h-full">
              <img 
                alt="عطور نسائية — مجموعة عطور نسائية فاخرة من Aura Perfumes" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                src="/images/category_women.png" 
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-opacity duration-500" />
              <div className="absolute bottom-8 right-8 md:bottom-12 md:right-12 text-white">
                <h3 className="text-3xl md:text-4xl font-serif mb-2">{t('نساء')}</h3>
                <p className="tracking-widest text-xs uppercase opacity-90">{t('عطور زهرية وأنيقة')}</p>
              </div>
            </Link>
          </motion.div>

          {/* Vertical Stack */}
          <div className="md:col-span-5 flex flex-col gap-6 md:gap-8">
            {/* Men */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="relative group overflow-hidden rounded-2xl cursor-pointer h-[250px] md:h-[284px]"
            >
              <Link to="/shop/men" className="block w-full h-full">
                <img 
                  alt="عطور رجالية — مجموعة عطور رجالية قوية من Aura Perfumes" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  src="/images/category_men.png" 
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-6 right-6 md:bottom-8 md:right-8 text-white">
                  <h3 className="text-2xl md:text-3xl font-serif mb-1">{t('رجال')}</h3>
                  <p className="tracking-widest text-xs uppercase opacity-90">{t('عطور خشبية وقوية')}</p>
                </div>
              </Link>
            </motion.div>

            {/* Unisex */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="relative group overflow-hidden rounded-2xl cursor-pointer h-[250px] md:h-[284px]"
            >
              <Link to="/shop/unisex" className="block w-full h-full">
                <img 
                  alt="عطور للجنسين — مجموعة عطور يونيسكس من Aura Perfumes" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  src="/images/category_unisex.png" 
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-6 right-6 md:bottom-8 md:right-8 text-white">
                  <h3 className="text-2xl md:text-3xl font-serif mb-1">{t('للجنسين')}</h3>
                  <p className="tracking-widest text-xs uppercase opacity-90">{t('عطور عصرية ومنعشة')}</p>
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════ Section 3: Full Catalog ══════════════ */}
      <section className="py-20 md:py-32 bg-surface-container-low" aria-labelledby="catalog-heading">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6"
          >
            <div className="space-y-3">
              <span className="text-tertiary tracking-[0.2em] text-xs uppercase font-bold">{t('كاتالوج Aura')}</span>
              <h2 id="catalog-heading" className="text-4xl md:text-5xl font-serif text-primary">{t('جميع العطور')}</h2>
              <p className="text-on-surface-variant text-sm max-w-md">{t('تصفح مجموعتنا الكاملة من العطور الفاخرة المستوحاة من أشهر الماركات العالمية')}</p>
            </div>
            <Link 
              to="/shop/all" 
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg text-sm font-bold hover:opacity-90 transition-opacity"
            >
              {t('عرض الكل')}
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-10">
            {catalogPerfumes.map((perfume, idx) => (
              <motion.div
                key={perfume.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
              >
                <PerfumeCard {...perfume} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ Section 4: AI Recommendations ══════════════ */}
      <AIRecommendations variant="home" />

      {/* ══════════════ Section 5: FAQ ══════════════ */}
      <section className="py-20 md:py-32 px-6 md:px-12 max-w-[800px] mx-auto" aria-labelledby="faq-heading">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 space-y-4"
        >
          <h2 id="faq-heading" className="text-4xl md:text-5xl font-serif text-primary">{t('الأسئلة الشائعة')}</h2>
          <p className="text-on-surface-variant text-sm">{t('كل ما تحتاج معرفته عن عطور Aura.')}</p>
        </motion.div>
        <div className="space-y-6">
          {faqItems.map((item, index) => (
            <motion.details 
              key={index} 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="group border-b border-outline-variant/30 pb-6 cursor-pointer"
            >
              <summary className="flex justify-between items-center mb-4 list-none">
                <h3 className="text-lg font-semibold text-primary">{item.question}</h3>
                <ArrowLeft className="h-5 w-5 text-primary group-open:-rotate-90 transition-transform" />
              </summary>
              <div className="text-on-surface-variant leading-relaxed">
                {item.answer}
              </div>
            </motion.details>
          ))}
        </div>
      </section>
    </div>
  );
}
