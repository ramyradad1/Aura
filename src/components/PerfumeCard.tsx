import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShoppingCart, Heart, GitCompare, Eye } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useUserPreferences } from '../context/UserPreferencesContext';
import QuickViewModal from './QuickViewModal';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { generateProductSlug } from '../utils/slugUtils';

interface PerfumeCardProps {
  id: string;
  name: string;
  price: number;
  category: string;
  inspiredBy: string;
  imageUrl: string;
  notes?: any;
}

export default function PerfumeCard({ id, name, price, category, inspiredBy, imageUrl, notes }: PerfumeCardProps) {
  const { addToCart } = useCart();
  const { toggleWishlist, toggleCompare, isInWishlist, isInCompare } = useUserPreferences();
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const { isAdmin } = useAuth();

  const categoryLabel = category === 'men' ? 'رجالي' : category === 'women' ? 'نسائي' : 'للجنسين';

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -8, scale: 1.02 }}
        transition={{ duration: 0.4, type: 'spring', stiffness: 300, damping: 20 }}
        className="group relative flex flex-col items-center"
      >
        {/* Image Container */}
        <div className="w-full aspect-4/5 bg-white rounded-lg overflow-hidden mb-6 relative shadow-sm transition-all duration-500 group-hover:shadow-glow group-hover:shadow-primary/20">
          <Link to={`/perfume/${generateProductSlug(name, id)}`} className="block w-full h-full">
            <img 
              src={imageUrl || `https://picsum.photos/seed/${id}/400/500`} 
              alt={`${name} — عطر مستوحى من ${inspiredBy} | Aura Perfumes`} 
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              referrerPolicy="no-referrer"
              loading="lazy"
              decoding="async"
              width={400}
              height={500}
            />
          </Link>
          
          {/* Favorite Button */}
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <motion.button 
              whileTap={{ scale: 0.85 }}
              onClick={() => toggleWishlist(id)}
              aria-label={isInWishlist(id) ? 'إزالة من المفضلة' : 'أضف للمفضلة'}
              className={`p-2.5 rounded-full shadow-lg backdrop-blur-md transition-all ${
                isInWishlist(id) 
                  ? 'bg-red-500 text-white' 
                  : 'bg-white/80 text-primary hover:bg-white'
              }`}
            >
              <Heart className={`h-4 w-4 ${isInWishlist(id) ? 'fill-current' : ''}`} />
            </motion.button>
          </div>

          {/* Compare Button */}
          <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <motion.button 
              whileTap={{ scale: 0.85 }}
              onClick={() => toggleCompare(id)}
              aria-label={isInCompare(id) ? 'إزالة من المقارنة' : 'أضف للمقارنة'}
              className={`p-2.5 rounded-full shadow-lg backdrop-blur-md transition-all ${
                isInCompare(id) 
                  ? 'bg-primary-container text-white' 
                  : 'bg-white/80 text-primary hover:bg-white'
              }`}
            >
              <GitCompare className="h-4 w-4" />
            </motion.button>
          </div>

          {/* Quick View */}
          <motion.button 
            initial={{ y: 20 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => setIsQuickViewOpen(true)}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md text-primary px-5 py-2.5 rounded-lg text-xs font-bold shadow-xl opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-2 hover:bg-white uppercase tracking-widest"
          >
            <Eye className="h-3.5 w-3.5" />
            عرض سريع
          </motion.button>
        </div>
        
        {/* Text Content */}
        <div className="text-center space-y-2 w-full">
          <span className="text-[10px] uppercase tracking-[0.2em] text-on-surface/40 font-bold">مستوحى من: {inspiredBy}</span>
          <h3 className="text-xl font-serif text-primary">{name}</h3>
          
          {/* Category Tag */}
          <div className="flex gap-2 justify-center">
            {isAdmin && (
              <span className="px-3 py-1 bg-surface-variant text-[10px] rounded-full uppercase tracking-tighter text-on-surface-variant font-medium">
                {categoryLabel}
              </span>
            )}
          </div>

          <p className="text-tertiary font-semibold mt-2">{price} ج.م</p>
          
          {/* Add to Cart — reveals on hover */}
          <motion.button 
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => addToCart({ id, name, price, quantity: 1, imageUrl })}
            className="mt-4 px-6 py-2.5 bg-tertiary-gold text-[#241a00] rounded-lg text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2 mx-auto shadow-md hover:shadow-glow hover:shadow-tertiary-gold/40"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            أضف للسلة
          </motion.button>
        </div>
      </motion.div>

      <QuickViewModal 
        isOpen={isQuickViewOpen} 
        onClose={() => setIsQuickViewOpen(false)} 
        perfume={{ id, name, price, category, inspiredBy, imageUrl, notes }}
      />
    </>
  );
}
