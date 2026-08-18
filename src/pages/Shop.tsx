import { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import PerfumeCard from '../components/PerfumeCard';
import SEOHead from '../components/SEOHead';
import Breadcrumbs, { generateBreadcrumbSchema } from '../components/Breadcrumbs';
import RecentlyViewed from '../components/RecentlyViewed';
import { Filter, Search, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { handleFirestoreError, OperationType } from '../utils/firebaseUtils';
import { useTranslation } from '../context/TranslationContext';
import { mockPerfumes } from '../data/mockData';

function SkeletonCard() {
  return (
    <div className="flex flex-col items-center">
      <div className="w-full aspect-4/5 skeleton rounded-2xl" />
      <div className="mt-6 space-y-3 w-full text-center">
        <div className="h-3 w-1/2 skeleton mx-auto" />
        <div className="h-5 w-2/3 skeleton mx-auto" />
        <div className="h-4 w-1/4 skeleton mx-auto" />
      </div>
    </div>
  );
}

export default function Shop() {
  const { category } = useParams<{ category: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t, language } = useTranslation();

  const [perfumes, setPerfumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState<Error | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);

  // Initialize filters from URL params
  const searchQuery = searchParams.get('q') || searchParams.get('search') || '';
  const currentSort = searchParams.get('sort') || 'newest';
  const currentBrand = searchParams.get('brand') || '';
  const currentNotes = searchParams.get('notes') || '';
  const currentMinPrice = searchParams.get('minPrice') || '';
  const currentMaxPrice = searchParams.get('maxPrice') || '';
  const currentSelectedNotes = useMemo(() => {
    const raw = searchParams.get('selectedNotes');
    return raw ? raw.split(',').filter(Boolean) : [];
  }, [searchParams]);

  const commonNotes = [
    { name: 'عود', icon: '🪵' },
    { name: 'ياسمين', icon: '🌸' },
    { name: 'فانيليا', icon: '🍦' },
    { name: 'مسك', icon: '✨' },
    { name: 'ورد', icon: '🌹' },
    { name: 'عنبر', icon: '🪨' },
    { name: 'خشب الصندل', icon: '🌲' },
    { name: 'برغموت', icon: '🍋' },
    { name: 'باتشولي', icon: '🌿' },
    { name: 'لافندر', icon: '🪻' },
  ];

  // Helper to update search params
  const updateParam = (key: string, value: string | string[] | null) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (Array.isArray(value)) {
        if (value.length > 0) next.set(key, value.join(','));
        else next.delete(key);
      } else if (value && value.trim()) {
        next.set(key, value.trim());
      } else {
        next.delete(key);
      }
      return next;
    }, { replace: true });
  };

  useEffect(() => {
    setVisibleCount(12);
  }, [category, searchQuery, currentSort, currentBrand, currentMinPrice, currentMaxPrice, currentNotes, currentSelectedNotes]);

  useEffect(() => {
    const fetchPerfumes = async () => {
      setLoading(true);
      try {
        let q: any = collection(db, 'perfumes');
        if (category && category !== 'all') {
          q = query(collection(db, 'perfumes'), where('category', '==', category));
        }
        
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
        
        if (data.length === 0) {
          if (category && category !== 'all') {
            setPerfumes(mockPerfumes.filter(p => p.category === category));
          } else {
            setPerfumes(mockPerfumes);
          }
        } else {
          setPerfumes(data);
        }
      } catch (error) {
        try {
          handleFirestoreError(error, OperationType.GET, 'perfumes');
        } catch (e: any) {
          setErrorState(e);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchPerfumes();
  }, [category]);

  if (errorState) {
    throw errorState;
  }

  // Filter & Sort
  const filteredPerfumes = useMemo(() => {
    const list = perfumes.filter(p => {
      const matchesSearch = !searchQuery || 
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.inspiredBy?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.nameEn?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesBrand = !currentBrand || 
        p.inspiredBy?.toLowerCase().includes(currentBrand.toLowerCase()) || 
        (p.brand && p.brand.toLowerCase().includes(currentBrand.toLowerCase()));

      const matchesNotesText = !currentNotes || (p.notes && (
        (p.notes.top && p.notes.top.toLowerCase().includes(currentNotes.toLowerCase())) ||
        (p.notes.middle && p.notes.middle.toLowerCase().includes(currentNotes.toLowerCase())) ||
        (p.notes.base && p.notes.base.toLowerCase().includes(currentNotes.toLowerCase()))
      ));

      const matchesSelectedNotes = currentSelectedNotes.length === 0 || (p.notes && (
        currentSelectedNotes.every(note => 
          (p.notes.top && p.notes.top.toLowerCase().includes(note.toLowerCase())) ||
          (p.notes.middle && p.notes.middle.toLowerCase().includes(note.toLowerCase())) ||
          (p.notes.base && p.notes.base.toLowerCase().includes(note.toLowerCase()))
        )
      ));

      const matchesMinPrice = !currentMinPrice || p.price >= Number(currentMinPrice);
      const matchesMaxPrice = !currentMaxPrice || p.price <= Number(currentMaxPrice);

      return matchesSearch && matchesBrand && matchesNotesText && matchesSelectedNotes && matchesMinPrice && matchesMaxPrice;
    });

    // Sorting
    return [...list].sort((a, b) => {
      switch (currentSort) {
        case 'price-asc':
          return (Number(a.price) || 0) - (Number(b.price) || 0);
        case 'price-desc':
          return (Number(b.price) || 0) - (Number(a.price) || 0);
        case 'rating':
          return (Number(b.rating) || 5) - (Number(a.rating) || 5);
        case 'popular':
          return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0);
        case 'newest':
        default:
          if (a.createdAt && b.createdAt) {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          }
          return 0;
      }
    });
  }, [perfumes, searchQuery, currentBrand, currentNotes, currentSelectedNotes, currentMinPrice, currentMaxPrice, currentSort]);

  const clearFilters = () => {
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  const toggleNote = (note: string) => {
    const next = currentSelectedNotes.includes(note)
      ? currentSelectedNotes.filter(n => n !== note)
      : [...currentSelectedNotes, note];
    updateParam('selectedNotes', next);
  };

  const activeFilterCount = [
    currentBrand,
    currentNotes,
    currentMinPrice,
    currentMaxPrice,
    ...currentSelectedNotes
  ].filter(Boolean).length;

  const getCategoryTitle = () => {
    switch(category) {
      case 'men': return t('عطور رجالية');
      case 'women': return t('عطور نسائية');
      case 'unisex': return t('عطور للجنسين');
      default: return t('جميع العطور');
    }
  };

  const getCategoryDescription = () => {
    switch(category) {
      case 'men': return t('تسوق أفضل العطور الرجالية المستوحاة من أشهر الماركات العالمية مثل Creed Aventus و Bleu de Chanel. جودة عالية وثبات يدوم بأسعار مناسبة.');
      case 'women': return t('اكتشفي مجموعة العطور النسائية المستوحاة من Baccarat Rouge 540 و Chanel No. 5 وأشهر العطور العالمية. رائحة فاخرة بسعر مناسب.');
      case 'unisex': return t('تسوق عطور للجنسين مستوحاة من Tom Ford Oud Wood و Amouage Reflection. عطور شرقية وغربية تناسب الجميع.');
      default: return t('اكتشف مجموعتنا الكاملة من العطور المستوحاة من أشهر الماركات العالمية. عطور رجالية ونسائية وللجنسين بجودة عالية.');
    }
  };

  const getCategoryKeywords = () => {
    const base = t('عطور, عطور مستوحاة, Aura Perfumes');
    switch(category) {
      case 'men': return `${base}, ${t('عطور رجالية')}, ${t('عطر رجالي')}, ${t('كريد أفينتوس')}, ${t('بلو دي شانيل')}, ${t('عطور رجالية فاخرة')}`;
      case 'women': return `${base}, ${t('عطور نسائية')}, ${t('عطر نسائي')}, ${t('باكارا روج')}, ${t('شانيل نمبر 5')}, ${t('عطور نسائية فاخرة')}`;
      case 'unisex': return `${base}, ${t('عطور للجنسين')}, ${t('عطر يونيسكس')}, ${t('توم فورد عود')}, ${t('عطور شرقية')}`;
      default: return `${base}, ${t('عطور رجالية')}, ${t('عطور نسائية')}, ${t('عطور للجنسين')}`;
    }
  };

  const breadcrumbItems = category && category !== 'all' 
    ? [{ label: t('المتجر'), href: '/shop/all' }, { label: getCategoryTitle() }] 
    : [{ label: t('المتجر') }];

  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems);

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: filteredPerfumes.slice(0, 12).map((p, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: p.name,
      url: `https://auraperfumes.eg/perfume/${p.id}`,
    })),
  };

  return (
    <div className="min-h-screen bg-surface" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <SEOHead
        title={getCategoryTitle()}
        description={getCategoryDescription()}
        keywords={getCategoryKeywords()}
        ogUrl={`/shop/${category || 'all'}`}
        canonicalUrl={`/shop/${category || 'all'}`}
        schema={[breadcrumbSchema, itemListSchema]}
      />

      {/* Hero Header */}
      <section className="pt-16 pb-12 px-6 md:px-12 max-w-[1400px] mx-auto">
        <Breadcrumbs items={breadcrumbItems} />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mt-8"
        >
          <div className="space-y-3">
            <h1 className="text-4xl md:text-6xl font-serif text-primary font-bold">{getCategoryTitle()}</h1>
            <p className="text-on-surface/50 font-light">{t('اكتشف مجموعتنا المميزة من العطور المستوحاة بدقة وثبات عالي')}</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px] md:w-72">
              <Search className={`absolute ${language === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 h-4 w-4 text-outline`} />
              <input 
                type="text" 
                placeholder={t('ابحث عن عطر أو ماركة...')}
                value={searchQuery}
                onChange={(e) => updateParam('q', e.target.value)}
                className={`w-full ${language === 'ar' ? 'pl-4 pr-11' : 'pr-4 pl-11'} py-3 bg-white border border-outline-variant/20 rounded-xl focus-visible:ring-2 focus-visible:ring-primary outline-hidden transition-all text-sm shadow-xs`}
                aria-label={t('البحث في العطور')}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => updateParam('q', '')}
                  className={`absolute ${language === 'ar' ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort Select */}
            <div className="relative">
              <select
                value={currentSort}
                onChange={(e) => updateParam('sort', e.target.value)}
                aria-label="ترتيب المنتجات"
                className="py-3 px-4 bg-white border border-outline-variant/20 rounded-xl text-sm font-medium text-primary shadow-xs outline-hidden focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
              >
                <option value="newest">الأحدث وصولاً</option>
                <option value="price-asc">السعر: من الأقل للأعلى</option>
                <option value="price-desc">السعر: من الأعلى للأقل</option>
                <option value="popular">الأكثر طلباً</option>
                <option value="rating">الأعلى تقييماً</option>
              </select>
            </div>

            {/* Filter Toggle Button */}
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters(!showFilters)}
              className={`relative p-3 border rounded-xl transition-all cursor-pointer shadow-xs ${
                showFilters || activeFilterCount > 0
                  ? 'bg-primary border-primary text-white' 
                  : 'bg-white border-outline-variant/20 hover:bg-surface-container-low text-primary'
              }`}
              aria-label="عرض الفلاتر"
              aria-expanded={showFilters}
            >
              <SlidersHorizontal className="h-5 w-5" />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-tertiary-gold text-[#241a00] text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-xs">
                  {activeFilterCount}
                </span>
              )}
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* Advanced Filters Panel */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="bg-white p-6 rounded-2xl shadow-luxury mb-8 border border-outline-variant/10" role="search" aria-label={t('بحث متقدم')}>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-serif text-primary font-bold flex items-center gap-2">
                    <Filter className="h-5 w-5 text-tertiary" />
                    {t('تصفية النتائج')}
                  </h2>
                  <button 
                    onClick={clearFilters}
                    className="text-xs text-tertiary hover:underline font-bold transition-all cursor-pointer"
                  >
                    {t('إعادة تعيين الكل')}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Brand / Inspired By */}
                  <div>
                    <label className="block text-xs font-bold text-primary/60 mb-2 uppercase tracking-widest">{t('المستوحى منه أو الماركة')}</label>
                    <input 
                      type="text" 
                      placeholder={t('مثال: Creed, Chanel, Baccarat...')}
                      value={currentBrand}
                      onChange={(e) => updateParam('brand', e.target.value)}
                      className="w-full p-3 bg-surface-container-low border border-outline-variant/20 rounded-xl focus-visible:ring-2 focus-visible:ring-primary outline-hidden text-sm"
                    />
                  </div>

                  {/* Price Range */}
                  <div>
                    <label className="block text-xs font-bold text-primary/60 mb-2 uppercase tracking-widest">{t('نطاق السعر (ج.م)')}</label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="number" 
                        placeholder={t('من')}
                        value={currentMinPrice}
                        onChange={(e) => updateParam('minPrice', e.target.value)}
                        className="w-full p-3 bg-surface-container-low border border-outline-variant/20 rounded-xl focus-visible:ring-2 focus-visible:ring-primary outline-hidden text-sm"
                      />
                      <span className="text-on-surface/30">-</span>
                      <input 
                        type="number" 
                        placeholder={t('إلى')}
                        value={currentMaxPrice}
                        onChange={(e) => updateParam('maxPrice', e.target.value)}
                        className="w-full p-3 bg-surface-container-low border border-outline-variant/20 rounded-xl focus-visible:ring-2 focus-visible:ring-primary outline-hidden text-sm"
                      />
                    </div>
                  </div>

                  {/* Notes Search Text */}
                  <div>
                    <label className="block text-xs font-bold text-primary/60 mb-2 uppercase tracking-widest">{t('البحث في النوتات')}</label>
                    <input 
                      type="text" 
                      placeholder={t('مثال: فانيليا، عنبر، ليمون...')}
                      value={currentNotes}
                      onChange={(e) => updateParam('notes', e.target.value)}
                      className="w-full p-3 bg-surface-container-low border border-outline-variant/20 rounded-xl focus-visible:ring-2 focus-visible:ring-primary outline-hidden text-sm"
                    />
                  </div>

                  {/* Common Notes Tags */}
                  <div className="md:col-span-3">
                    <label className="block text-xs font-bold text-primary/60 mb-2.5 uppercase tracking-widest">{t('نوتات عطرية شائعة')}</label>
                    <div className="flex flex-wrap gap-2.5">
                      {commonNotes.map((note) => {
                        const isSelected = currentSelectedNotes.includes(note.name);
                        return (
                          <button
                            key={note.name}
                            type="button"
                            onClick={() => toggleNote(note.name)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                              isSelected
                                ? 'bg-primary text-white ring-2 ring-tertiary-gold shadow-md'
                                : 'bg-surface-container-low text-on-surface/80 hover:bg-surface-container-high hover:text-primary border border-outline-variant/15'
                            }`}
                          >
                            <span className="text-sm leading-none">{note.icon}</span>
                            <span>{note.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category Tabs */}
        <div className="flex justify-between items-center mb-8 border-b border-outline-variant/10 pb-4 overflow-x-auto">
          <div className="flex gap-2">
            {[
              { id: 'all', label: t('الكل') },
              { id: 'men', label: t('رجالي') },
              { id: 'women', label: t('نسائي') },
              { id: 'unisex', label: t('للجنسين') },
            ].map(tab => {
              const isActive = (category || 'all') === tab.id;
              return (
                <Link
                  key={tab.id}
                  to={`/shop/${tab.id === 'all' ? 'all' : tab.id}`}
                  className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                    isActive 
                      ? 'bg-primary text-white shadow-md' 
                      : 'text-on-surface-variant hover:text-primary hover:bg-surface-variant'
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <>
            <div className="mb-8 flex items-center gap-3">
              <span className="text-xs tracking-widest uppercase text-on-surface/40 font-bold">
                {filteredPerfumes.length} {t('عطر متاح')}
              </span>
              {activeFilterCount > 0 && (
                <span className="text-xs text-primary bg-secondary-container/40 px-3 py-1 rounded-full font-bold">
                  {activeFilterCount} {t('فلتر نشط')}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {filteredPerfumes.slice(0, visibleCount).map((perfume, idx) => (
                <motion.div
                  key={perfume.id}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.4, delay: (idx % 12) * 0.05 }}
                >
                  <PerfumeCard {...perfume} />
                </motion.div>
              ))}

              {filteredPerfumes.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full text-center py-24"
                >
                  <div className="w-20 h-20 bg-surface-container-low rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="h-8 w-8 text-outline" />
                  </div>
                  <h3 className="text-xl font-serif text-primary mb-2 font-bold">{t('لا توجد نتائج مطابقة')}</h3>
                  <p className="text-on-surface/50 mb-6 font-light">{t('حاول تعديل معايير البحث أو مسح الفلاتر.')}</p>
                  <button 
                    onClick={clearFilters} 
                    className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:opacity-90 transition-opacity uppercase tracking-widest text-xs cursor-pointer shadow-md"
                  >
                    {t('مسح كافة الفلاتر')}
                  </button>
                </motion.div>
              )}
            </div>

            {visibleCount < filteredPerfumes.length && (
              <div className="mt-16 flex justify-center">
                <button
                  onClick={() => setVisibleCount(v => v + 12)}
                  className="px-8 py-3.5 border border-primary/20 text-primary font-bold rounded-xl hover:bg-surface-container-low transition-all uppercase tracking-widest text-xs cursor-pointer shadow-xs"
                >
                  {t('عرض المزيد')}
                </button>
              </div>
            )}
          </>
        )}

        {/* Recently Viewed Section */}
        <RecentlyViewed />
      </div>
    </div>
  );
}
