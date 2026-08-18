import React, { useEffect, useState } from 'react';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { useStoreSettings } from '../context/StoreSettingsContext';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { mockPerfumes } from '../data/mockData';
import PerfumeCard from './PerfumeCard';
import { Clock, Eye } from 'lucide-react';
import { useTranslation } from '../context/TranslationContext';
import { motion } from 'motion/react';

interface Props {
  currentProductId?: string;
}

export default function RecentlyViewed({ currentProductId }: Props) {
  const { viewedProducts } = useUserPreferences();
  const { settings } = useStoreSettings();
  const { t } = useTranslation();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If recently viewed is disabled in store settings or empty, do nothing
    if (settings.recentlyViewed === false || !viewedProducts || viewedProducts.length === 0) {
      setLoading(false);
      return;
    }

    const fetchViewed = async () => {
      try {
        // Filter out current product
        const filteredIds = viewedProducts.filter(id => id !== currentProductId);
        if (filteredIds.length === 0) {
          setProducts([]);
          setLoading(false);
          return;
        }

        // Fetch from Firestore or fallback to mock
        const snap = await getDocs(collection(db, 'perfumes'));
        let allProducts: any[] = [];
        if (!snap.empty) {
          allProducts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        } else {
          allProducts = mockPerfumes;
        }

        // Maintain view order
        const matched = filteredIds
          .map(id => allProducts.find(p => p.id === id))
          .filter(Boolean);

        setProducts(matched.slice(0, 6));
      } catch (err) {
        console.error('Error fetching recently viewed products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchViewed();
  }, [viewedProducts, currentProductId, settings.recentlyViewed]);

  if (settings.recentlyViewed === false || loading || products.length === 0) {
    return null;
  }

  return (
    <section className="py-12 border-t border-outline-variant/10">
      <div className="flex items-center gap-2 mb-8">
        <Clock className="w-5 h-5 text-tertiary" />
        <h2 className="text-2xl md:text-3xl font-serif text-primary font-bold">
          {t('شوهدت مؤخراً')}
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((perfume, idx) => (
          <motion.div
            key={perfume.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <PerfumeCard {...perfume} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
