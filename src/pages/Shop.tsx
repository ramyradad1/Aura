import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import PerfumeCard from '../components/PerfumeCard';
import SEOHead from '../components/SEOHead';
import Breadcrumbs, { generateBreadcrumbSchema } from '../components/Breadcrumbs';
import { Filter, Search, X, SlidersHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { handleFirestoreError, OperationType } from '../utils/firebaseUtils';
import AIRecommendations from '../components/AIRecommendations';
import { generateProductSlug } from '../utils/slugUtils';
import { useTranslation } from '../context/TranslationContext';

function SkeletonCard() {
  return (
    <div className="flex flex-col items-center">
      <div className="w-full aspect-4/5 skeleton rounded-lg" />
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
  const [perfumes, setPerfumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorState, setErrorState] = useState<Error | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);
  const { t, language } = useTranslation();
  
  const [filters, setFilters] = useState({
    notes: '',
    brand: '',
    minPrice: '',
    maxPrice: '',
    gender: category || 'all',
    selectedNotes: [] as string[]
  });

  const commonNotes = ['ياسمين', 'عود', 'فانيليا', 'مسك', 'ورد', 'خشب الصندل', 'عنبر', 'برغموت', 'باتشولي', 'لافندر'];

  useEffect(() => {
    setFilters(prev => ({ ...prev, gender: category || 'all' }));
    setVisibleCount(12);
  }, [category]);

  useEffect(() => {
    setVisibleCount(12);
  }, [filters, searchQuery]);

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
          const mockData = [
            { id: '1', name: 'Velvet Crimson', price: 85, category: 'women', inspiredBy: 'Baccarat Rouge 540', imageUrl: 'https://picsum.photos/seed/perfume1/400/500', notes: { top: 'Saffron, Jasmine', middle: 'Amberwood', base: 'Fir Resin, Cedar' } },
            { id: '2', name: 'Imperial Oud', price: 92, category: 'men', inspiredBy: 'Tom Ford Oud Wood', imageUrl: 'https://picsum.photos/seed/perfume2/400/500', notes: { top: 'Rosewood, Cardamom', middle: 'Oud, Sandalwood', base: 'Tonka Bean, Amber' } },
            { id: '3', name: 'Sovereign', price: 78, category: 'unisex', inspiredBy: 'Creed Aventus', imageUrl: 'https://picsum.photos/seed/perfume3/400/500', notes: { top: 'Pineapple, Bergamot', middle: 'Birch, Patchouli', base: 'Musk, Oakmoss' } },
            { id: '4', name: "L'Eternel", price: 89, category: 'women', inspiredBy: 'Chanel No. 5', imageUrl: 'https://picsum.photos/seed/perfume4/400/500', notes: { top: 'Aldehydes, Ylang-Ylang', middle: 'Rose, Jasmine', base: 'Sandalwood, Vanilla' } },
            { id: '5', name: 'Midnight Bleu', price: 95, category: 'men', inspiredBy: 'Bleu de Chanel', imageUrl: 'https://picsum.photos/seed/perfume5/400/500', notes: { top: 'Grapefruit, Lemon', middle: 'Ginger, Nutmeg', base: 'Incense, Cedar' } },
            { id: '6', name: 'Aurelia Gold', price: 110, category: 'unisex', inspiredBy: 'Amouage Reflection', imageUrl: 'https://picsum.photos/seed/perfume6/400/500', notes: { top: 'Rosemary, Red Pepper', middle: 'Orris Root, Jasmine', base: 'Sandalwood, Vetiver' } },
          ];
          
          if (category && category !== 'all') {
            setPerfumes(mockData.filter(p => p.category === category));
          } else {
            setPerfumes(mockData);
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

  const filteredPerfumes = perfumes.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.inspiredBy.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBrand = filters.brand === '' || p.inspiredBy.toLowerCase().includes(filters.brand.toLowerCase()) || (p.brand && p.brand.toLowerCase().includes(filters.brand.toLowerCase()));
    const matchesNotesText = filters.notes === '' || (p.notes && (
      (p.notes.top && p.notes.top.toLowerCase().includes(filters.notes.toLowerCase())) ||
      (p.notes.middle && p.notes.middle.toLowerCase().includes(filters.notes.toLowerCase())) ||
      (p.notes.base && p.notes.base.toLowerCase().includes(filters.notes.toLowerCase()))
    ));
    const matchesSelectedNotes = filters.selectedNotes.length === 0 || (p.notes && (
      filters.selectedNotes.every(note => 
        (p.notes.top && p.notes.top.toLowerCase().includes(note.toLowerCase())) ||
        (p.notes.middle && p.notes.middle.toLowerCase().includes(note.toLowerCase())) ||
        (p.notes.base && p.notes.base.toLowerCase().includes(note.toLowerCase()))
      )
    ));
    const matchesMinPrice = filters.minPrice === '' || p.price >= Number(filters.minPrice);
    const matchesMaxPrice = filters.maxPrice === '' || p.price <= Number(filters.maxPrice);
    const matchesGender = filters.gender === 'all' || p.category === filters.gender;
    return matchesSearch && matchesBrand && matchesNotesText && matchesSelectedNotes && matchesMinPrice && matchesMaxPrice && matchesGender;
  });

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
    'name': getCategoryTitle(),
    'description': getCategoryDescription(),
    'numberOfItems': filteredPerfumes.length,
    'itemListElement': filteredPerfumes.slice(0, 10).map((p, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'item': {
        '@type': 'Product',
        'name': p.name,
        'description': `عطر مستوحى من ${p.inspiredBy}`,
        'url': `https://www.aura-perfumes.online/perfume/${generateProductSlug(p.name, p.id)}`,
        'image': p.imageUrl,
        'offers': {
          '@type': 'Offer',
          'price': p.price,
          'priceCurrency': 'EGP',
          'availability': 'https://schema.org/InStock',
        },
      },
    })),
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const toggleNote = (note: string) => {
    setFilters(prev => ({
      ...prev,
      selectedNotes: prev.selectedNotes.includes(note)
        ? prev.selectedNotes.filter(n => n !== note)
        : [...prev.selectedNotes, note]
    }));
  };

  const clearFilters = () => {
    setFilters({
      notes: '',
      brand: '',
      minPrice: '',
      maxPrice: '',
      gender: category || 'all',
      selectedNotes: []
    });
    setSearchQuery('');
  };

  const activeFilterCount = [filters.brand, filters.notes, filters.minPrice, filters.maxPrice, ...(filters.gender !== (category || 'all') ? ['g'] : []), ...filters.selectedNotes].filter(Boolean).length;

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
      <section className="pt-16 pb-12 px-12 max-w-[1400px] mx-auto">
        <Breadcrumbs items={breadcrumbItems} />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mt-8"
        >
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-serif text-primary">{getCategoryTitle()}</h1>
            <p className="text-on-surface/50 font-light">{t('اكتشف مجموعتنا المميزة من العطور المستوحاة')}</p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className={`absolute ${language === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 h-4 w-4 text-outline`} />
              <input 
                type="text" 
                placeholder={t('ابحث عن عطر أو ماركة...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full ${language === 'ar' ? 'pl-4 pr-12' : 'pr-4 pl-12'} py-3 bg-surface-container-low border border-outline-variant/20 rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary/20 outline-none transition-all text-sm`}
                aria-label={t('البحث في العطور')}
              />
            </div>
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters(!showFilters)}
              className={`relative p-3 border rounded-lg transition-all ${showFilters ? 'bg-primary border-primary text-white' : 'bg-white border-outline-variant/20 hover:bg-surface-container-low text-primary'}`}
              aria-label="عرض الفلاتر"
              aria-expanded={showFilters}
            >
              <SlidersHorizontal className="h-5 w-5" />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-tertiary-gold text-[#241a00] text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">{activeFilterCount}</span>
              )}
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* Advanced Filters Panel */}
      <div className="max-w-[1400px] mx-auto px-12">
        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="bg-white p-6 rounded-lg shadow-luxury mb-8 border border-outline-variant/10" role="search" aria-label={t('بحث متقدم')}>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-serif text-primary flex items-center gap-2">
                    <Filter className="h-5 w-5 text-tertiary" />
                    {t('بحث متقدم')}
                  </h3>
                  <button onClick={clearFilters} className="text-sm text-error hover:text-[#93000a] flex items-center gap-1 bg-[#ffdad6]/30 px-3 py-1.5 rounded-lg hover:bg-[#ffdad6]/50 transition-colors">
                    <X className="h-4 w-4" /> {t('مسح الكل')}
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                  <div>
                    <label htmlFor="brand-filter" className="block text-xs font-bold text-primary/70 mb-2 uppercase tracking-widest">{t('الماركة (مستوحى من)')}</label>
                    <input id="brand-filter" type="text" name="brand" value={filters.brand} onChange={handleFilterChange} placeholder={t('مثال: Chanel, Dior...')} className="w-full p-3 bg-surface-container-low border border-outline-variant/20 rounded-lg text-sm focus:ring-2 focus:ring-primary/10 outline-none transition-all" />
                  </div>
                  <div>
                    <label htmlFor="notes-filter" className="block text-xs font-bold text-primary/70 mb-2 uppercase tracking-widest">{t('بحث بالنوتات')}</label>
                    <input id="notes-filter" type="text" name="notes" value={filters.notes} onChange={handleFilterChange} placeholder={t('مثال: ياسمين، عود، فانيليا...')} className="w-full p-3 bg-surface-container-low border border-outline-variant/20 rounded-lg text-sm focus:ring-2 focus:ring-primary/10 outline-none transition-all" />
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label htmlFor="min-price" className="block text-xs font-bold text-primary/70 mb-2 uppercase tracking-widest">{t('الأدنى')}</label>
                      <input id="min-price" type="number" name="minPrice" value={filters.minPrice} onChange={handleFilterChange} placeholder={`0 ${t('ج.م')}`} className="w-full p-3 bg-surface-container-low border border-outline-variant/20 rounded-lg text-sm focus:ring-2 focus:ring-primary/10 outline-none transition-all" />
                    </div>
                    <div className="flex-1">
                      <label htmlFor="max-price" className="block text-xs font-bold text-primary/70 mb-2 uppercase tracking-widest">{t('الأعلى')}</label>
                      <input id="max-price" type="number" name="maxPrice" value={filters.maxPrice} onChange={handleFilterChange} placeholder={`1000 ${t('ج.م')}`} className="w-full p-3 bg-surface-container-low border border-outline-variant/20 rounded-lg text-sm focus:ring-2 focus:ring-primary/10 outline-none transition-all" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="gender-filter" className="block text-xs font-bold text-primary/70 mb-2 uppercase tracking-widest">{t('الفئة')}</label>
                    <select title={t('تصفية حسب الفئة')} id="gender-filter" name="gender" value={filters.gender} onChange={handleFilterChange} className="w-full p-3 bg-surface-container-low border border-outline-variant/20 rounded-lg text-sm focus:ring-2 focus:ring-primary/10 outline-none transition-all">
                      <option value="all">{t('الجميع')}</option>
                      <option value="men">{t('رجالي')}</option>
                      <option value="women">{t('نسائي')}</option>
                      <option value="unisex">{t('للجنسين')}</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-xs font-bold text-primary/70 mb-3 uppercase tracking-widest">{t('النوتات الشائعة')}</label>
                  <div className="flex flex-wrap gap-2" role="group" aria-label={t('فلتر النوتات')}>
                    {commonNotes.map(note => (
                      <motion.button
                        key={note}
                        whileTap={{ scale: 0.93 }}
                        onClick={() => toggleNote(note)}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                          filters.selectedNotes.includes(note)
                            ? 'bg-primary text-white shadow-md shadow-primary/20'
                            : 'bg-surface-variant text-on-surface-variant hover:bg-outline-variant/40'
                        }`}
                        aria-pressed={filters.selectedNotes.includes(note)}
                      >
                        {note}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Product Grid */}
      <section className="max-w-[1400px] mx-auto px-12 pb-32">
        {/* AI Personalized Recommendations */}
        {!loading && filteredPerfumes.length > 0 && (
          <AIRecommendations variant="shop" perfumes={perfumes} />
        )}

        {/* Category Tabs */}
        <div className="mb-12 flex justify-center">
          <div className="inline-flex bg-surface-container-low p-1.5 rounded-2xl overflow-x-auto max-w-full hide-scrollbar">
            {[
              { id: 'all', label: t('الكل') },
              { id: 'men', label: t('رجالي') },
              { id: 'women', label: t('نسائي') },
              { id: 'unisex', label: t('للجنسين') }
            ].map(tab => {
              const isActive = (category || 'all') === tab.id;
              return (
                <Link
                  key={tab.id}
                  to={`/shop/${tab.id === 'all' ? 'all' : tab.id}`}
                  className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${isActive ? 'bg-primary text-white shadow-md' : 'text-on-surface-variant hover:text-primary hover:bg-surface-variant'}`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <>
            <div className="mb-8 flex items-center gap-3">
              <span className="text-xs tracking-widest uppercase text-on-surface/40 font-bold">{filteredPerfumes.length} {t('عطر')}</span>
              {activeFilterCount > 0 && (
                <span className="text-xs text-primary bg-secondary-container/40 px-3 py-1 rounded-full font-bold">{activeFilterCount} {t('فلتر نشط')}</span>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {filteredPerfumes.slice(0, visibleCount).map((perfume) => (
                <PerfumeCard key={perfume.id} {...perfume} />
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
                  <h3 className="text-xl font-serif text-primary mb-2">{t('لا توجد نتائج')}</h3>
                  <p className="text-on-surface/50 mb-6 font-light">{t('لا توجد عطور تطابق بحثك. حاول تغيير الفلاتر.')}</p>
                  <button onClick={clearFilters} className="px-6 py-3 bg-primary text-white rounded-lg font-bold hover:opacity-90 transition-opacity uppercase tracking-widest text-xs">
                    {t('مسح الفلاتر')}
                  </button>
                </motion.div>
              )}
            </div>

            {visibleCount < filteredPerfumes.length && (
              <div className="mt-16 flex justify-center">
                <button
                  onClick={() => setVisibleCount(v => v + 12)}
                  className="px-8 py-3 bg-surface-container-low text-primary border border-outline-variant/20 rounded-xl font-bold hover:bg-surface-variant transition-colors"
                >
                   {t('عرض المزيد')}
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
