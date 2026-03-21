import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, TrendingUp, Wand2, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { getSmartRecommendations, SmartRecommendationResult } from '../utils/geminiUtils';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { useCart } from '../context/CartContext';
import PerfumeCard from './PerfumeCard';

interface AIRecommendationsProps {
  variant: 'home' | 'shop' | 'detail';
  currentPerfumeId?: string;
  perfumes?: any[];
}

function SkeletonCard() {
  return (
    <div className="flex flex-col items-center min-w-[250px] snap-start">
      <div className="w-full aspect-4/5 skeleton rounded-lg" />
      <div className="mt-6 space-y-3 w-full text-center">
        <div className="h-3 w-1/2 skeleton mx-auto" />
        <div className="h-5 w-2/3 skeleton mx-auto" />
        <div className="h-4 w-1/4 skeleton mx-auto" />
      </div>
    </div>
  );
}

export default function AIRecommendations({ variant, currentPerfumeId, perfumes: propPerfumes }: AIRecommendationsProps) {
  const [allPerfumes, setAllPerfumes] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<SmartRecommendationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReasoning, setShowReasoning] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { viewedProducts, wishlist, quizResults } = useUserPreferences();
  const { items: cartItems } = useCart();

  // Fetch all perfumes if not provided
  useEffect(() => {
    if (propPerfumes && propPerfumes.length > 0) {
      setAllPerfumes(propPerfumes);
      return;
    }

    const fetchPerfumes = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'perfumes'));
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
        
        if (data.length === 0) {
          // Mock data fallback
          setAllPerfumes([
            { id: '1', name: 'Velvet Crimson', price: 85, category: 'women', inspiredBy: 'Baccarat Rouge 540', imageUrl: '/images/perfumes/aura_rose.png', notes: { top: 'Saffron, Jasmine', middle: 'Amberwood', base: 'Fir Resin, Cedar' } },
            { id: '2', name: 'Imperial Oud', price: 92, category: 'men', inspiredBy: 'Tom Ford Oud Wood', imageUrl: '/images/perfumes/aura_oud.png', notes: { top: 'Rosewood, Cardamom', middle: 'Oud, Sandalwood', base: 'Tonka Bean, Amber' } },
            { id: '3', name: 'Sovereign', price: 78, category: 'unisex', inspiredBy: 'Creed Aventus', imageUrl: '/images/perfumes/aura_noir.png', notes: { top: 'Pineapple, Bergamot', middle: 'Birch, Patchouli', base: 'Musk, Oakmoss' } },
            { id: '4', name: "L'Eternel", price: 89, category: 'women', inspiredBy: 'Chanel No. 5', imageUrl: '/images/perfumes/aura_blanc.png', notes: { top: 'Aldehydes, Ylang-Ylang', middle: 'Rose, Jasmine', base: 'Sandalwood, Vanilla' } },
            { id: '5', name: 'Midnight Bleu', price: 95, category: 'men', inspiredBy: 'Bleu de Chanel', imageUrl: '/images/perfumes/aura_bleu.png', notes: { top: 'Grapefruit, Lemon', middle: 'Ginger, Nutmeg', base: 'Incense, Cedar' } },
            { id: '6', name: 'Aurelia Gold', price: 110, category: 'unisex', inspiredBy: 'Amouage Reflection', imageUrl: '/images/perfumes/aura_gold.png', notes: { top: 'Rosemary, Red Pepper', middle: 'Orris Root, Jasmine', base: 'Sandalwood, Vetiver' } },
          ]);
        } else {
          setAllPerfumes(data);
        }
      } catch (error) {
        console.error('Failed to fetch perfumes for recommendations', error);
      }
    };
    fetchPerfumes();
  }, [propPerfumes]);

  // Get AI recommendations when perfumes are loaded
  useEffect(() => {
    if (allPerfumes.length === 0) return;

    const cacheKey = `ai_recs_${variant}_${currentPerfumeId || 'none'}_${viewedProducts.slice(0, 5).join(',')}`;
    
    // Check sessionStorage cache first
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        setRecommendations(JSON.parse(cached));
        setLoading(false);
        return;
      }
    } catch { /* ignore */ }

    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        const result = await getSmartRecommendations({
          perfumes: allPerfumes,
          viewedProductIds: viewedProducts,
          wishlistIds: wishlist,
          cartItemIds: cartItems.map(i => i.id),
          quizResults,
          currentPerfumeId,
        });
        
        setRecommendations(result);
        
        // Cache the result
        try {
          sessionStorage.setItem(cacheKey, JSON.stringify(result));
        } catch { /* ignore */ }
      } catch (error) {
        console.error('AI Recommendations failed:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [allPerfumes, currentPerfumeId]);

  const getPerfumesByIds = (ids: string[]) => {
    return ids
      .map(id => allPerfumes.find(p => p.id === id))
      .filter(Boolean);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  const bestSellers = recommendations ? getPerfumesByIds(recommendations.bestSellers) : [];
  const personalPicks = recommendations ? getPerfumesByIds(recommendations.personalPicks) : [];

  // ─── VARIANT: Shop (compact horizontal strip) ───
  if (variant === 'shop') {
    if (loading) {
      return (
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 skeleton rounded-lg" />
            <div className="h-5 w-40 skeleton" />
          </div>
          <div className="flex gap-6 overflow-hidden">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="min-w-[220px]"><SkeletonCard /></div>
            ))}
          </div>
        </div>
      );
    }

    if (personalPicks.length === 0 && bestSellers.length === 0) return null;

    const displayItems = personalPicks.length > 0 ? personalPicks : bestSellers;

    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-linear-to-br from-tertiary-gold to-[#d4a017] rounded-lg flex items-center justify-center shadow-lg shadow-tertiary-gold/20">
              <Wand2 className="h-4.5 w-4.5 text-[#241a00]" />
            </div>
            <div>
              <h3 className="text-lg font-serif text-primary">✨ مقترح لك</h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => scroll('right')} className="p-2 rounded-full bg-surface-container-low hover:bg-surface-variant transition-colors" aria-label="التمرير لليمين">
              <ChevronRight className="h-4 w-4 text-primary" />
            </button>
            <button onClick={() => scroll('left')} className="p-2 rounded-full bg-surface-container-low hover:bg-surface-variant transition-colors" aria-label="التمرير لليسار">
              <ChevronLeft className="h-4 w-4 text-primary" />
            </button>
          </div>
        </div>
        
        <div ref={scrollRef} className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
          {displayItems.map((perfume, idx) => (
            <motion.div 
              key={perfume.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="min-w-[250px] max-w-[250px] snap-start"
            >
              <PerfumeCard {...perfume} />
            </motion.div>
          ))}
        </div>

        {recommendations?.reasoning && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-4 text-xs text-on-surface/40 flex items-center gap-2 bg-surface-container-low py-2 px-4 rounded-full w-fit"
          >
            <Sparkles className="h-3 w-3 text-tertiary-gold shrink-0" />
            {recommendations.reasoning}
          </motion.p>
        )}
      </motion.div>
    );
  }

  // ─── VARIANT: Detail (related products) ───
  if (variant === 'detail') {
    if (loading) {
      return (
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-20">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 skeleton rounded-lg" />
            <div className="h-6 w-56 skeleton" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
          </div>
        </motion.section>
      );
    }

    const items = personalPicks.length > 0 ? personalPicks : bestSellers;
    if (items.length === 0) return null;

    return (
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-20"
      >
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-linear-to-br from-tertiary-gold to-[#d4a017] rounded-xl flex items-center justify-center shadow-lg shadow-tertiary-gold/20">
              <Sparkles className="h-5 w-5 text-[#241a00]" />
            </div>
            <div>
              <h2 className="text-3xl font-serif text-primary">عطور قد تعجبك أيضاً</h2>
              <p className="text-xs text-on-surface/40 mt-1">اقتراحات ذكية مبنية على ذوقك</p>
            </div>
          </div>
          {recommendations?.reasoning && (
            <button 
              onClick={() => setShowReasoning(!showReasoning)}
              className="flex items-center gap-1.5 text-xs text-tertiary hover:text-primary transition-colors bg-surface-container-low px-3 py-1.5 rounded-full"
            >
              <Info className="h-3.5 w-3.5" />
              ليه الاقتراحات دي؟
            </button>
          )}
        </div>

        <AnimatePresence>
          {showReasoning && recommendations?.reasoning && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-8"
            >
              <div className="bg-linear-to-l from-primary/5 to-tertiary-gold/5 border border-outline-variant/10 rounded-xl p-5 flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-tertiary-gold shrink-0 mt-0.5" />
                <p className="text-sm text-on-surface/60 leading-relaxed">{recommendations.reasoning}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {items.map((perfume, idx) => (
            <motion.div
              key={perfume.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <PerfumeCard {...perfume} />
            </motion.div>
          ))}
        </div>
      </motion.section>
    );
  }

  // ─── VARIANT: Home (full best-sellers + personalized sections) ───
  return (
    <div className="space-y-32">
      {/* Best Sellers Section */}
      <section className="py-32 bg-surface-container-low" aria-labelledby="ai-bestsellers-heading">
        <div className="max-w-[1400px] mx-auto px-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-linear-to-br from-red-500/80 to-orange-500/80 rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <span className="text-tertiary tracking-[0.2em] text-xs uppercase font-bold">اختيارات ذكية</span>
              </div>
              <h2 id="ai-bestsellers-heading" className="text-5xl font-serif text-primary">🔥 الأكثر مبيعاً</h2>
              <p className="text-on-surface/40 font-light text-sm max-w-md">عطور اختارها الذكاء الاصطناعي كأفضل وأشهر العطور في مجموعتنا</p>
            </div>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
              {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
              {bestSellers.map((perfume, idx) => (
                <motion.div
                  key={perfume.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <PerfumeCard {...perfume} />
                </motion.div>
              ))}
              {bestSellers.length === 0 && allPerfumes.slice(0, 4).map((perfume, idx) => (
                <motion.div
                  key={perfume.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <PerfumeCard {...perfume} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Personalized Picks Section */}
      <section className="pb-32 px-12 max-w-[1400px] mx-auto" aria-labelledby="ai-personal-heading">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="flex flex-col md:flex-row justify-between items-end gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-linear-to-br from-tertiary-gold to-[#d4a017] rounded-xl flex items-center justify-center shadow-lg shadow-tertiary-gold/30">
                  <Wand2 className="h-5 w-5 text-[#241a00]" />
                </div>
              </div>
              <h2 id="ai-personal-heading" className="text-5xl font-serif text-primary">✨ مقترح لك</h2>
              <p className="text-on-surface/40 font-light text-sm max-w-md">
                عطور مختارة خصيصاً ليك بناءً على ذوقك واهتماماتك
              </p>
            </div>
            {recommendations?.reasoning && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex items-center gap-2.5 bg-linear-to-l from-primary/5 to-tertiary-gold/5 border border-outline-variant/10 px-5 py-3 rounded-xl max-w-sm"
              >
                <Sparkles className="h-4 w-4 text-tertiary-gold shrink-0" />
                <p className="text-xs text-on-surface/50 leading-relaxed">{recommendations.reasoning}</p>
              </motion.div>
            )}
          </div>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {personalPicks.map((perfume, idx) => (
              <motion.div
                key={perfume.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.12 }}
              >
                <PerfumeCard {...perfume} />
              </motion.div>
            ))}
            {personalPicks.length === 0 && allPerfumes.slice(4, 8).length > 0 && allPerfumes.slice(4, 8).map((perfume, idx) => (
              <motion.div
                key={perfume.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.12 }}
              >
                <PerfumeCard {...perfume} />
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
