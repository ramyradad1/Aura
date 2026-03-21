import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { doc, getDoc, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, ShoppingCart, Sparkles, Star, Droplets, Wind, Leaf, Check, Heart, ChevronDown } from 'lucide-react';
import { fastPerfumeRecommendation } from '../utils/geminiUtils';
import AIRecommendations from '../components/AIRecommendations';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { handleFirestoreError, OperationType } from '../utils/firebaseUtils';
import { extractIdFromSlug, generateProductSlug } from '../utils/slugUtils';
import SEOHead from '../components/SEOHead';
import Breadcrumbs, { generateBreadcrumbSchema } from '../components/Breadcrumbs';

import { useTranslation } from '../context/TranslationContext';

export default function PerfumeDetails() {
  const { t, language } = useTranslation();
  const dir = language === 'ar' ? 'rtl' : 'ltr';
  const { id: rawId } = useParams<{ id: string }>();
  const id = extractIdFromSlug(rawId);
  const [perfume, setPerfume] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { user, openAuthModal } = useAuth();
  const { addViewedProduct } = useUserPreferences();
  
  const [aiRecommendation, setAiRecommendation] = useState('');
  const [recommending, setRecommending] = useState(false);
  const [errorState, setErrorState] = useState<Error | null>(null);
  
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, text: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  // Track viewed product for AI recommendations
  useEffect(() => {
    if (id) addViewedProduct(id);
  }, [id]);

  useEffect(() => {
    const fetchPerfumeAndReviews = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'perfumes', id);
        const docSnap = await getDoc(docRef);
        
        let fetchedPerfume: any = null;
        if (docSnap.exists()) {
          fetchedPerfume = { id: docSnap.id, ...docSnap.data() };
        } else {
          const mockData = [
            { id: '1', name: 'Velvet Crimson', price: 85, category: 'women', inspiredBy: 'Baccarat Rouge 540', imageUrl: 'https://picsum.photos/seed/perfume1/800/800', images: ['https://picsum.photos/seed/perfume1/800/800', 'https://picsum.photos/seed/perfume1_2/800/800'], description: 'عطر نسائي فخم يجمع بين الأناقة والغموض.', notes: { top: 'زعفران، ياسمين', middle: 'خشب العنبر', base: 'راتنج التنوب، أرز' }, sizes: ['50ml', '100ml'] },
            { id: '2', name: 'Imperial Oud', price: 92, category: 'men', inspiredBy: 'Tom Ford Oud Wood', imageUrl: 'https://picsum.photos/seed/perfume2/800/800', description: 'عطر شرقي أصيل بنفحات العود.', notes: { top: 'خشب الورد، هيل', middle: 'عود، خشب الصندل', base: 'تونكا، عنبر' }, sizes: ['50ml', '100ml'] },
            { id: '3', name: 'Sovereign', price: 78, category: 'unisex', inspiredBy: 'Creed Aventus', imageUrl: 'https://picsum.photos/seed/perfume3/800/800', description: 'عطر رجالي فخم يجمع بين القوة والأناقة.', notes: { top: 'أناناس، برغموت', middle: 'باتشولي، ياسمين', base: 'مسك، طحلب البلوط' }, sizes: ['50ml', '100ml'] },
            { id: '4', name: "L'Eternel", price: 89, category: 'women', inspiredBy: 'Chanel No. 5', imageUrl: 'https://picsum.photos/seed/perfume4/800/800', description: 'عطر كلاسيكي ناعم.', notes: { top: 'ألدهيدات، يلانغ يلانغ', middle: 'ورد، ياسمين', base: 'خشب الصندل، فانيليا' }, sizes: ['50ml', '100ml'] },
            { id: '5', name: 'Midnight Bleu', price: 95, category: 'men', inspiredBy: 'Bleu de Chanel', imageUrl: 'https://picsum.photos/seed/perfume5/800/800', description: 'عطر منعش وحيوي.', notes: { top: 'جريب فروت، ليمون', middle: 'زنجبيل، جوزة الطيب', base: 'بخور، خشب الأرز' }, sizes: ['50ml', '100ml'] },
            { id: '6', name: 'Aurelia Gold', price: 110, category: 'unisex', inspiredBy: 'Amouage Reflection', imageUrl: 'https://picsum.photos/seed/perfume6/800/800', description: 'عطر فاخر للمناسبات الخاصة.', notes: { top: 'إكليل الجبل، فلفل أحمر', middle: 'جذور السوسن، ياسمين', base: 'خشب الصندل، نجيل الهند' }, sizes: ['50ml', '100ml'] },
          ];
          fetchedPerfume = mockData.find(p => p.id === id);
        }

        if (fetchedPerfume) {
          setPerfume(fetchedPerfume);
          setSelectedImage(fetchedPerfume.imageUrl || (fetchedPerfume.images && fetchedPerfume.images[0]) || '');
          if (fetchedPerfume.sizes && fetchedPerfume.sizes.length > 0) {
            setSelectedSize(fetchedPerfume.sizes[0]);
          }
        }

        const q = query(collection(db, 'reviews'), where('perfumeId', '==', id));
        const reviewsSnap = await getDocs(q);
        const fetchedReviews = reviewsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
        fetchedReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setReviews(fetchedReviews);

      } catch (error) {
        try {
          handleFirestoreError(error, OperationType.GET, `perfumes/${id}`);
        } catch (e: any) {
          setErrorState(e);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchPerfumeAndReviews();
  }, [id]);

  if (errorState) {
    throw errorState;
  }

  const handleGetRecommendation = async () => {
    if (!perfume) return;
    setRecommending(true);
    try {
      const rec = await fastPerfumeRecommendation(`عطور تشبه ${perfume.name} المستوحى من ${perfume.inspiredBy}`);
      setAiRecommendation(rec || '');
    } catch (error) {
      console.error(error);
    } finally {
      setRecommending(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id || !reviewForm.text.trim()) return;
    setSubmittingReview(true);
    try {
      const newReview = {
        perfumeId: id,
        userId: user.uid,
        userName: user.displayName || 'مستخدم',
        rating: reviewForm.rating,
        text: reviewForm.text,
        createdAt: new Date().toISOString()
      };
      const docRef = await addDoc(collection(db, 'reviews'), newReview);
      setReviews([{ id: docRef.id, ...newReview }, ...reviews]);
      setReviewForm({ rating: 5, text: '' });
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.CREATE, 'reviews');
      } catch (e: any) {
        setErrorState(e);
      }
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-surface" aria-label={t("جاري التحميل")}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!perfume) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-surface text-center px-4" dir={dir}>
        <SEOHead title={t("العطر غير موجود")} noindex={true} />
        <h2 className="text-2xl font-serif text-primary mb-4">{t("العطر غير موجود")}</h2>
        <Link to="/shop/all" className="text-tertiary hover:underline">{t("العودة للمتجر")}</Link>
      </div>
    );
  }

  const allImages = perfume.images || [perfume.imageUrl || `https://picsum.photos/seed/${perfume.id}/800/800`];
  const avgRating = reviews.length > 0 ? (reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length).toFixed(1) : 0;

  const categoryLabel = perfume.category === 'men' ? t('عطور رجالية') : perfume.category === 'women' ? t('عطور نسائية') : t('عطور للجنسين');
  const categorySlug = perfume.category || 'all';

  const breadcrumbItems = [
    { label: t('المتجر'), href: '/shop/all' },
    { label: categoryLabel, href: `/shop/${categorySlug}` },
    { label: perfume.name },
  ];

  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems);

  const productSchema: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    'name': perfume.name,
    'description': perfume.description || `عطر مستوحى من ${perfume.inspiredBy} — ${categoryLabel}`,
    'image': allImages,
    'brand': { '@type': 'Brand', 'name': 'Aura Perfumes' },
    'url': `https://www.aura-perfumes.online/perfume/${generateProductSlug(perfume.name, perfume.id)}`,
    'sku': `AURA-${perfume.id}`,
    'category': categoryLabel,
    'offers': {
      '@type': 'Offer',
      'price': perfume.price,
      'priceCurrency': 'EGP',
      'availability': 'https://schema.org/InStock',
      'seller': { '@type': 'Organization', 'name': 'Aura Perfumes' },
      'url': `https://www.aura-perfumes.online/perfume/${generateProductSlug(perfume.name, perfume.id)}`,
    },
  };

  if (reviews.length > 0) {
    productSchema.aggregateRating = {
      '@type': 'AggregateRating',
      'ratingValue': avgRating,
      'reviewCount': reviews.length,
      'bestRating': 5,
      'worstRating': 1,
    };
    productSchema.review = reviews.slice(0, 5).map((r: any) => ({
      '@type': 'Review',
      'author': { '@type': 'Person', 'name': r.userName },
      'datePublished': r.createdAt,
      'reviewRating': { '@type': 'Rating', 'ratingValue': r.rating, 'bestRating': 5, 'worstRating': 1 },
      'reviewBody': r.text,
    }));
  }

  if (perfume.notes) {
    productSchema.additionalProperty = [
      { '@type': 'PropertyValue', 'name': 'النوتات الافتتاحية', 'value': perfume.notes.top },
      { '@type': 'PropertyValue', 'name': 'نوتات القلب', 'value': perfume.notes.middle },
      { '@type': 'PropertyValue', 'name': 'النوتات القاعدية', 'value': perfume.notes.base },
      { '@type': 'PropertyValue', 'name': 'مستوحى من', 'value': perfume.inspiredBy },
    ];
  }

  const faqItems = [
    {
      q: t(`ما مدى ثبات عطر ${perfume.name}؟`),
      a: t(`عطر ${perfume.name} مصمم بتركيز Eau de Parfum عالٍ ليدوم طويلاً، حيث يصل ثباته من 8 إلى 12 ساعة على البشرة، ويدوم لفترة أطول على الملابس والأقمشة.`),
    },
    {
      q: t(`هل رائحة ${perfume.name} مطابقة لعطر ${perfume.inspiredBy}؟`),
      a: t(`نعم، تركيبتنا مستوحاة بدقة عالية من ${perfume.inspiredBy} لتقديم نفس التجربة العطرية الفاخرة بجودة ممتازة وسعر مناسب.`),
    },
    {
      q: t('هل الشحن مجاني؟ وكم يستغرق التوصيل؟'),
      a: t('نعم، الشحن مجاني للطلبات فوق 50 ج.م. التوصيل يستغرق من 2 إلى 5 أيام عمل لجميع محافظات مصر مع خدمة تتبع الطلب.'),
    },
    {
      q: t('ما الأحجام المتاحة وما الفرق بينها؟'),
      a: t('نوفر حجمين: 50ml مثالي للتجربة والسفر، و100ml للاستخدام اليومي وهو الأوفر اقتصادياً. جميع الأحجام بنفس التركيز والجودة.'),
    },
    {
      q: t('هل يمكنني إرجاع العطر إذا لم يعجبني؟'),
      a: t('نعم، نوفر سياسة إرجاع سهلة خلال 14 يوم من استلام الطلب بشرط أن يكون المنتج في حالته الأصلية غير مستخدم وبالتغليف الكامل.'),
    },
  ];

  const productFaqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': faqItems.map(item => ({
      '@type': 'Question',
      'name': item.q,
      'acceptedAnswer': { '@type': 'Answer', 'text': item.a },
    })),
  };

  return (
    <div className="min-h-screen bg-surface py-16 px-6 md:px-12" dir={dir}>
      <SEOHead
        title={`${perfume.name} — مستوحى من ${perfume.inspiredBy}`}
        description={`${perfume.name} — عطر مستوحى من ${perfume.inspiredBy}. ${perfume.description || ''} السعر: ${perfume.price} ج.م. ${perfume.notes ? `النوتات: ${perfume.notes.top} | ${perfume.notes.middle} | ${perfume.notes.base}` : ''}`}
        keywords={`${perfume.name}, ${perfume.inspiredBy}, عطر مستوحى, ${categoryLabel}, Aura Perfumes, عطور`}
        ogUrl={`/perfume/${generateProductSlug(perfume.name, perfume.id)}`}
        canonicalUrl={`/perfume/${generateProductSlug(perfume.name, perfume.id)}`}
        ogImage={perfume.imageUrl}
        ogType="product"
        schema={[breadcrumbSchema, productSchema, productFaqSchema]}
      />

      <div className="max-w-[1200px] mx-auto">
        <Breadcrumbs items={breadcrumbItems} />
        
        <article itemScope itemType="https://schema.org/Product">
          <meta itemProp="name" content={perfume.name} />
          <meta itemProp="description" content={perfume.description || `عطر مستوحى من ${perfume.inspiredBy}`} />
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-16 mt-8 mb-20"
          >
            {/* Image Gallery */}
            <div className="flex flex-col gap-6">
              <AnimatePresence mode="wait">
                <motion.div 
                  key={selectedImage}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.4 }}
                  className="aspect-square bg-white rounded-lg overflow-hidden shadow-luxury group"
                >
                  <img 
                    src={selectedImage || allImages[0]} 
                    alt={`${perfume.name} — عطر مستوحى من ${perfume.inspiredBy}`} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                    itemProp="image"
                    loading="eager"
                  />
                </motion.div>
              </AnimatePresence>
              
              {allImages.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                  {allImages.map((img: string, idx: number) => (
                    <button 
                      key={idx} 
                      onClick={() => setSelectedImage(img)}
                      className={`w-20 h-20 rounded-lg overflow-hidden shrink-0 transition-all duration-300 ${selectedImage === img ? 'ring-2 ring-primary ring-offset-2' : 'opacity-50 hover:opacity-100'}`}
                      aria-label={`عرض صورة ${idx + 1}`}
                    >
                      <img src={img} alt={`${perfume.name} — صورة ${idx + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" loading="lazy" />
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Product Details */}
            <div className="flex flex-col justify-center">
              <div className="flex justify-between items-start mb-6">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-tertiary bg-tertiary-fixed/20 px-4 py-1.5 rounded-full">
                  {categoryLabel}
                </span>
                {reviews.length > 0 && (
                  <div className="flex items-center gap-1.5 text-tertiary" itemProp="aggregateRating" itemScope itemType="https://schema.org/AggregateRating">
                    <Star className="h-4 w-4 fill-tertiary-gold text-tertiary-gold" />
                    <span className="text-sm font-bold" itemProp="ratingValue">{avgRating}</span>
                    <span className="text-sm text-on-surface/30">(<span itemProp="reviewCount">{reviews.length}</span>)</span>
                    <meta itemProp="bestRating" content="5" />
                  </div>
                )}
              </div>
              
              <h1 className="text-5xl md:text-6xl font-serif text-primary mb-3">{perfume.name}</h1>
              <p className="text-on-surface/50 mb-8 flex items-center gap-2 font-light">
                <span>{t('مستوحى من')}</span>
                <Link to={`/shop/${categorySlug}?brand=${encodeURIComponent(perfume.inspiredBy)}`} className="text-primary font-medium hover:underline transition-all">
                  {perfume.inspiredBy}
                </Link>
              </p>
              
              <p className="text-4xl font-serif text-tertiary mb-10" itemProp="offers" itemScope itemType="https://schema.org/Offer">
                <span itemProp="priceCurrency" content="EGP">{t('ج.م')}</span><span itemProp="price" content={String(perfume.price)}>{perfume.price}</span>
                <link itemProp="availability" href="https://schema.org/InStock" />
              </p>
              
              {perfume.sizes && perfume.sizes.length > 0 && (
                <div className="mb-10">
                  <h3 className="text-xs font-bold text-primary/60 mb-4 uppercase tracking-widest">{t('الحجم')}</h3>
                  <div className="flex gap-3" role="radiogroup" aria-label={t('اختيار الحجم')}>
                    {perfume.sizes.map((size: string) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-6 py-3 rounded-lg border transition-all duration-200 ${selectedSize === size ? 'border-primary bg-secondary-container/20 text-primary font-bold' : 'border-outline-variant/20 text-on-surface-variant hover:border-primary/30'}`}
                        role="radio"
                        aria-checked={selectedSize === size}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {perfume.notes && (
                <div className="mb-10">
                  <h3 className="text-xs font-bold text-primary/60 mb-4 uppercase tracking-widest">{t('هرم العطر')}</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-5 bg-white rounded-lg border border-outline-variant/10 shadow-sm">
                      <Wind className="h-5 w-5 text-tertiary mb-3" />
                      <span className="block text-xs font-bold text-primary mb-1 uppercase tracking-widest">{t('الافتتاحية')}</span>
                      <p className="text-sm text-on-surface/50 font-light">{t(perfume.notes.top)}</p>
                    </div>
                    <div className="p-5 bg-white rounded-lg border border-outline-variant/10 shadow-sm">
                      <Heart className="h-5 w-5 text-tertiary mb-3" />
                      <span className="block text-xs font-bold text-primary mb-1 uppercase tracking-widest">{t('القلب')}</span>
                      <p className="text-sm text-on-surface/50 font-light">{t(perfume.notes.middle)}</p>
                    </div>
                    <div className="p-5 bg-white rounded-lg border border-outline-variant/10 shadow-sm">
                      <Leaf className="h-5 w-5 text-tertiary mb-3" />
                      <span className="block text-xs font-bold text-primary mb-1 uppercase tracking-widest">{t('القاعدة')}</span>
                      <p className="text-sm text-on-surface/50 font-light">{t(perfume.notes.base)}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {perfume.description && (
                <div className="mb-10">
                  <h3 className="text-xs font-bold text-primary/60 mb-3 uppercase tracking-widest">{t('الوصف')}</h3>
                  <p className="text-on-surface/60 leading-relaxed font-light" itemProp="description">{t(perfume.description)}</p>
                </div>
              )}
              
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => addToCart({ ...perfume, quantity: 1, size: selectedSize })}
                className="w-full py-4 bg-primary text-white font-bold rounded-lg transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-3 mb-4 uppercase tracking-widest text-sm hover:opacity-90"
                aria-label={t('أضف للسلة')}
              >
                <ShoppingCart className="h-5 w-5" />
                {t('أضف للسلة')}
              </motion.button>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="text-center p-3 bg-white rounded-lg border border-outline-variant/10">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest">{t('شحن مجاني')}</p>
                  <p className="text-[10px] text-on-surface/30 mt-1">{t('للطلبات فوق 50 ج.م')}</p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border border-outline-variant/10">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest">{t('أصلي 100%')}</p>
                  <p className="text-[10px] text-on-surface/30 mt-1">{t('ضمان الجودة')}</p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border border-outline-variant/10">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest">{t('إرجاع سهل')}</p>
                  <p className="text-[10px] text-on-surface/30 mt-1">{t('خلال 14 يوم')}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </article>

        {/* AI Recommendations */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-linear-to-l from-primary to-primary-container rounded-2xl p-10 mb-20 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-60 h-60 bg-tertiary-gold/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-tertiary-gold rounded-lg flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-[#241a00]" />
              </div>
              <div>
                <h3 className="font-serif text-2xl text-white">{t('توصيات Aura AI')}</h3>
                <p className="text-white/40 text-xs">{t('مدعوم بالذكاء الاصطناعي من Gemini')}</p>
              </div>
            </div>
            
            {aiRecommendation ? (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="whitespace-pre-wrap text-white/80 bg-white/10 backdrop-blur-md p-6 rounded-lg border border-white/10 leading-relaxed font-light"
              >
                {aiRecommendation}
              </motion.div>
            ) : (
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGetRecommendation}
                disabled={recommending}
                className="w-full py-4 px-6 bg-white/10 hover:bg-white/15 backdrop-blur-sm border border-white/10 rounded-lg transition-all duration-300 disabled:opacity-60 group"
              >
                {recommending ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-tertiary-gold" />
                    <span className="text-white/60 font-light">{t('جاري تحليل بصمة العطر...')}</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className={`flex items-center gap-3 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                      <Star className="w-5 h-5 text-tertiary-gold" />
                      <span className="text-white font-light text-sm">{t('هل أعجبك هذا العطر؟ اكتشف بدائل مذهلة تحاكي طابعه')}</span>
                    </div>
                    {language === 'ar' ? (
                        <ArrowRight className="w-5 h-5 text-white/40 group-hover:text-white/80 group-hover:translate-x-0 -translate-x-2 transition-all duration-300 shrink-0" />
                    ) : (
                        <ArrowRight className="w-5 h-5 text-white/40 group-hover:text-white/80 group-hover:translate-x-0 translate-x-2 transition-all duration-300 shrink-0 scale-x-[-1]" />
                    )}
                  </div>
                )}
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-3xl font-serif text-primary mb-8">{t('أسئلة شائعة')}</h2>
          <div className="space-y-3">
            {faqItems.map((item, idx) => (
              <details key={idx} className="group bg-white rounded-xl border border-outline-variant/10 overflow-hidden">
                <summary className="flex items-center justify-between cursor-pointer px-6 py-4 text-sm font-bold text-primary hover:bg-surface-container-low transition-colors">
                  {item.q}
                  <ChevronDown className="h-4 w-4 text-primary/40 transition-transform group-open:rotate-180" />
                </summary>
                <div className="px-6 pb-5 text-sm text-on-surface/70 leading-relaxed border-t border-outline-variant/10 pt-4">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </motion.section>

        {/* Reviews Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-20" 
          aria-labelledby="reviews-heading"
        >
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 id="reviews-heading" className="text-4xl font-serif text-primary mb-2">{t('تجارب العملاء')}</h2>
              <p className="text-on-surface/40 font-light">{t('شاركنا رأيك واقرأ تقييمات محبي العطور')}</p>
            </div>
            {reviews.length > 0 && (
              <div className="hidden md:flex flex-col items-center bg-white px-6 py-4 rounded-lg border border-outline-variant/10">
                <span className="text-3xl font-serif text-primary">{avgRating}</span>
                <div className="flex text-tertiary-gold my-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className={`w-4 h-4 ${Number(avgRating) >= star ? 'fill-tertiary-gold' : 'text-outline-variant/30'}`} />
                  ))}
                </div>
                <span className="text-xs text-on-surface/40">{reviews.length} {t('تقييم')}</span>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Add Review Form */}
            <div className="lg:col-span-4 lg:col-start-9 lg:row-start-1">
              <div className="bg-white p-8 rounded-2xl border border-outline-variant/10 shadow-luxury sticky top-24">
                <h3 className="text-xl font-serif text-primary mb-6">{t('أضف تقييمك')}</h3>
                {user ? (
                  <form onSubmit={handleSubmitReview} className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold text-primary/60 mb-3 uppercase tracking-widest">{t('تقييمك للعطر')}</label>
                      <div className="flex gap-2" role="radiogroup" aria-label={t('اختيار التقييم')}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            key={star}
                            type="button"
                            onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                            className="focus:outline-none p-1 rounded-full hover:bg-surface-container-low transition-colors"
                            aria-label={`${star} نجوم`}
                            role="radio"
                            aria-checked={reviewForm.rating === star}
                          >
                            <Star className={`h-8 w-8 ${reviewForm.rating >= star ? 'fill-tertiary-gold text-tertiary-gold' : 'text-outline-variant/30 hover:text-outline-variant/60'}`} />
                          </motion.button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label htmlFor="review-text" className="block text-xs font-bold text-primary/60 mb-3 uppercase tracking-widest">{t('حدثنا عن تجربتك')}</label>
                      <textarea
                        id="review-text"
                        required
                        value={reviewForm.text}
                        onChange={(e) => setReviewForm({ ...reviewForm, text: e.target.value })}
                        className={`w-full p-4 bg-surface-container-low border border-outline-variant/20 rounded-lg outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/10 transition-all resize-none h-32 text-on-surface text-sm ${language === 'ar' ? 'text-right' : 'text-left'}`}
                        dir={dir}
                        placeholder={t('كيف كان ثبات العطر؟ هل ناسبك؟ شاركه معنا...')}
                      ></textarea>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={submittingReview}
                      className="w-full py-3.5 bg-primary text-white font-bold rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity flex justify-center items-center gap-2 uppercase tracking-widest text-xs"
                    >
                      {submittingReview ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white" />
                      ) : (
                        <>{t('إرسال التقييم')} <Check className="w-5 h-5" /></>
                      )}
                    </motion.button>
                  </form>
                ) : (
                  <div className="text-center py-10 px-4 bg-surface-container-low border border-outline-variant/10 rounded-lg">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                      <Star className="w-8 h-8 text-outline-variant/40" />
                    </div>
                    <p className="text-on-surface/50 mb-6 px-2 font-light">{t('يجب عليك تسجيل الدخول لتتمكن من مشاركة وتقييم تجربتك معنا.')}</p>
                    <button onClick={openAuthModal} className="px-6 py-2.5 bg-primary text-white font-bold rounded-lg hover:opacity-90 transition-opacity text-xs uppercase tracking-widest">
                      {t('تسجيل الدخول')}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Reviews List */}
            <div className="lg:col-span-8 lg:row-start-1 space-y-6">
              {reviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-outline-variant/20">
                  <div className="w-20 h-20 bg-surface-container-low rounded-full flex items-center justify-center mb-4">
                    <Droplets className="w-8 h-8 text-outline-variant" />
                  </div>
                  <h3 className="text-xl font-serif text-primary mb-2">{t('لا توجد تقييمات بعد')}</h3>
                  <p className="text-on-surface/40 text-center max-w-sm font-light">{t('كن أول من يجرب هذا العطر ويشاركنا رأيه ليساعد الآخرين في اختياراتهم!')}</p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {reviews.map((review, idx) => (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: idx * 0.1 }}
                      key={review.id} 
                      className="p-6 md:p-8 bg-white border border-outline-variant/10 rounded-2xl shadow-sm hover:shadow-luxury transition-shadow" 
                      itemScope itemType="https://schema.org/Review"
                    >
                      <div className="flex justify-between items-start mb-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-secondary-container/30 rounded-full flex items-center justify-center text-primary font-serif text-xl">
                            {review.userName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-primary" itemProp="author">{review.userName}</p>
                            <p className="text-sm text-on-surface/30" dir="ltr">
                              <time itemProp="datePublished" dateTime={review.createdAt}>{new Date(review.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-0.5" itemProp="reviewRating" itemScope itemType="https://schema.org/Rating">
                          <meta itemProp="ratingValue" content={String(review.rating)} />
                          <meta itemProp="bestRating" content="5" />
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className={`h-4 w-4 ${review.rating >= star ? 'fill-tertiary-gold text-tertiary-gold' : 'text-outline-variant/20'}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-on-surface/60 leading-relaxed font-light" itemProp="reviewBody">{review.text}</p>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.section>

        {/* AI-Powered Related Products */}
        <AIRecommendations variant="detail" currentPerfumeId={id} />
      </div>
    </div>
  );
}
