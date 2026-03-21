import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { GitCompare, X, ShoppingCart, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useCart } from '../context/CartContext';
import { mockPerfumes } from '../data/mockData';
import SEOHead from '../components/SEOHead';
import { useTranslation } from '../context/TranslationContext';

export default function Compare() {
  const { t, language } = useTranslation();
  const dir = language === 'ar' ? 'rtl' : 'ltr';
  const { compareList, toggleCompare, clearCompare } = useUserPreferences();
  const { addToCart } = useCart();
  const [perfumes, setPerfumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComparePerfumes = async () => {
      if (compareList.length === 0) {
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
          setPerfumes(mockData.filter(p => compareList.includes(p.id)));
        } else {
          setPerfumes(allPerfumes.filter(p => compareList.includes(p.id)));
        }
      } catch (error) {
        console.error("Error fetching compare list:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchComparePerfumes();
  }, [compareList]);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4" dir={dir}>
      <SEOHead title={t("مقارنة العطور")} description={t("قارن بين عطور Aura Perfumes المستوحاة جنبًا إلى جنب — قارن النوتات والأسعار والفئات لاختيار العطر المثالي")} keywords={t("مقارنة عطور, مقارنة عطور مستوحاة, Aura Perfumes")} ogUrl="/compare" />
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 rounded-2xl">
              <GitCompare className="h-8 w-8 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-4xl font-serif font-bold text-gray-900">{t('مقارنة العطور')}</h1>
              <p className="text-gray-500">{t('قارن بين عطورك المفضلة لاختيار الأنسب لك')}</p>
            </div>
          </div>
          {compareList.length > 0 && (
            <button 
              onClick={clearCompare}
              className="flex items-center gap-2 text-red-600 hover:text-red-800 font-medium"
            >
              <Trash2 className="h-5 w-5" />
              {t('مسح القائمة')}
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : perfumes.length > 0 ? (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className={`w-full ${language === 'ar' ? 'text-right' : 'text-left'} border-collapse`}>
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="p-6 border-b border-gray-100 min-w-[200px] text-gray-500 font-medium">{t('المواصفات')}</th>
                    {perfumes.map(perfume => (
                      <th key={perfume.id} className="p-6 border-b border-gray-100 min-w-[250px] relative">
                        <button 
                          title={t('إزالة من المقارنة')}
                          onClick={() => toggleCompare(perfume.id)}
                          className={`absolute top-4 ${language === 'ar' ? 'right-4' : 'left-4'} p-1 rounded-full bg-gray-100 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors`}
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <div className="flex flex-col items-center text-center">
                          <img 
                            src={perfume.imageUrl} 
                            alt={`عطر ${perfume.name}`} 
                            className="w-32 h-32 object-cover rounded-xl mb-4 shadow-sm"
                            referrerPolicy="no-referrer"
                            loading="lazy"
                          />
                          <h3 className="font-serif text-lg font-bold text-gray-900">{perfume.name}</h3>
                          <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider mb-2">
                            {t(perfume.category === 'men' ? 'عطور رجالية' : perfume.category === 'women' ? 'عطور نسائية' : 'عطور للجنسين')}
                          </p>
                          <div className="text-xl font-bold text-gray-900 mb-4">{perfume.price} {t('ج.م')}</div>
                          <button 
                            onClick={() => addToCart(perfume)}
                            className="w-full py-2 bg-gray-900 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-indigo-600 transition-colors"
                          >
                            <ShoppingCart className="h-4 w-4" />
                            {t('أضف للسلة')}
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-6 border-b border-gray-50 font-bold text-gray-900 bg-gray-50/30">{t('مستوحى من')}</td>
                    {perfumes.map(p => (
                      <td key={p.id} className="p-6 border-b border-gray-50 text-gray-600">{p.inspiredBy}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-6 border-b border-gray-50 font-bold text-gray-900 bg-gray-50/30">{t('النوتات العليا')}</td>
                    {perfumes.map(p => (
                      <td key={p.id} className="p-6 border-b border-gray-50 text-gray-600 text-sm leading-relaxed">{p.notes?.top ? t(p.notes.top) : '-'}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-6 border-b border-gray-50 font-bold text-gray-900 bg-gray-50/30">{t('النوتات الوسطى')}</td>
                    {perfumes.map(p => (
                      <td key={p.id} className="p-6 border-b border-gray-50 text-gray-600 text-sm leading-relaxed">{p.notes?.middle ? t(p.notes.middle) : '-'}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-6 border-b border-gray-50 font-bold text-gray-900 bg-gray-50/30">{t('النوتات القاعدية')}</td>
                    {perfumes.map(p => (
                      <td key={p.id} className="p-6 border-b border-gray-50 text-gray-600 text-sm leading-relaxed">{p.notes?.base ? t(p.notes.base) : '-'}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200"
          >
            <GitCompare className="h-16 w-16 text-gray-200 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">{t('قائمة المقارنة فارغة')}</h2>
            <p className="text-gray-500 mb-8">{t('أضف عطوراً من المتجر لتبدأ المقارنة بينهم')}</p>
            <Link 
              to="/shop/all" 
              className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-600 transition-colors"
            >
              {t('تسوق الآن')}
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
