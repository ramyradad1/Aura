import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useUserPreferences } from '../context/UserPreferencesContext';
import PerfumeCard from '../components/PerfumeCard';
import { Heart, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { mockPerfumes } from '../data/mockData';
import SEOHead from '../components/SEOHead';

export default function Wishlist() {

  const { wishlist } = useUserPreferences();
  const [perfumes, setPerfumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlistPerfumes = async () => {
      if (wishlist.length === 0) {
        setPerfumes([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const snapshot = await getDocs(collection(db, 'perfumes'));
        const allPerfumes = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
        
        // If snapshot is empty, use mock data for demonstration
        if (allPerfumes.length === 0) {
           const mockData = mockPerfumes;
          setPerfumes(mockData.filter(p => wishlist.includes(p.id)));
        } else {
          setPerfumes(allPerfumes.filter(p => wishlist.includes(p.id)));
        }
      } catch (error) {
        console.error("Error fetching wishlist:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlistPerfumes();
  }, [wishlist]);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4" dir="rtl">
      <SEOHead title="قائمة الأمنيات" description="العطور المفضلة لديك في Aura Perfumes — احفظ عطورك المفضلة لشرائها لاحقاً" ogUrl="/wishlist" />
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-red-50 rounded-2xl">
            <Heart className="h-8 w-8 text-red-500 fill-current" />
          </div>
          <div>
            <h1 className="text-4xl font-serif font-bold text-gray-900">قائمة الأمنيات</h1>
            <p className="text-gray-500">العطور التي نالت إعجابك</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : perfumes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {perfumes.map((perfume) => (
              <PerfumeCard key={perfume.id} {...perfume} />
            ))}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200"
          >
            <Heart className="h-16 w-16 text-gray-200 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">قائمة أمنياتك فارغة</h2>
            <p className="text-gray-500 mb-8">ابدأ باستكشاف عطورنا وأضف ما يعجبك هنا</p>
            <Link 
              to="/shop/all" 
              className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-600 transition-colors"
            >
              <ShoppingBag className="h-5 w-5" />
              تسوق الآن
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
