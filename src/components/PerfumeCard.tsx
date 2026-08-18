import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShoppingCart, Heart, GitCompare, Eye, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { useToast } from '../context/ToastContext';
import QuickViewModal from './QuickViewModal';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { generateProductSlug } from '../utils/slugUtils';
import { useTranslation } from '../context/TranslationContext';
import { useStoreSettings } from '../context/StoreSettingsContext';

interface PerfumeCardProps {
  id: string;
  name: string;
  price: number;
  category: string;
  inspiredBy: string;
  imageUrl: string;
  stock?: number;
  sizes?: string[];
  notes?: any;
}

export default function PerfumeCard({
  id,
  name,
  price,
  category,
  inspiredBy,
  imageUrl,
  stock,
  sizes,
  notes,
}: PerfumeCardProps) {
  const { addToCart } = useCart();
  const { toggleWishlist, toggleCompare, isInWishlist, isInCompare } = useUserPreferences();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { formatPrice } = useStoreSettings();
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const isOutOfStock = stock !== undefined && stock <= 0;
  const categoryLabel = category === 'men' ? 'رجالي' : category === 'women' ? 'نسائي' : 'للجنسين';
  const defaultSize = Array.isArray(sizes) && sizes.length > 0 ? sizes[0] : undefined;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) {
      toast(t('هذا المنتج غير متوفر حالياً بالمخزون'), 'error');
      return;
    }
    addToCart({
      id,
      name,
      price,
      quantity: 1,
      size: defaultSize,
      imageUrl,
      stock,
    });
    toast(`تمت إضافة "${name}" إلى السلة 🛍️`, 'success', {
      label: 'عرض السلة',
      onClick: () => navigate('/cart'),
    });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const willBeInWishlist = !isInWishlist(id);
    toggleWishlist(id);
    toast(
      willBeInWishlist ? `تمت إضافة "${name}" إلى المفضلة ❤️` : `تمت إزالة "${name}" من المفضلة`,
      'info'
    );
  };

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const willBeInCompare = !isInCompare(id);
    toggleCompare(id);
    toast(
      willBeInCompare ? `تمت إضافة "${name}" إلى المقارنة ⚖️` : `تمت إزالة "${name}" من المقارنة`,
      'info'
    );
  };

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -6 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="group relative flex flex-col items-center w-full"
      >
        {/* Image Container */}
        <div className="w-full aspect-4/5 bg-white rounded-2xl overflow-hidden mb-4 relative shadow-sm border border-outline-variant/10 transition-all duration-500 group-hover:shadow-glow group-hover:shadow-primary/20">
          <Link to={`/perfume/${generateProductSlug(name, id)}`} className="block w-full h-full">
            <img 
              src={imageUrl || `https://picsum.photos/seed/${id}/400/500`} 
              alt={`${name} — عطر مستوحى من ${inspiredBy} | Aura Perfumes`} 
              className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${
                isOutOfStock ? 'grayscale opacity-75' : ''
              }`}
              referrerPolicy="no-referrer"
              loading="lazy"
              decoding="async"
              width={400}
              height={500}
            />
          </Link>

          {/* Out of Stock Ribbon */}
          {isOutOfStock && (
            <div className="absolute top-3 left-3 bg-red-600/90 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-lg">
              <AlertCircle className="w-3 h-3" />
              <span>نفذ من المخزون</span>
            </div>
          )}
          
          {/* Favorite Button (Visible on mobile, hover on desktop) */}
          <div className="absolute top-3 right-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
            <button 
              type="button"
              onClick={handleWishlist}
              aria-label={isInWishlist(id) ? 'إزالة من المفضلة' : 'أضف للمفضلة'}
              className={`w-10 h-10 rounded-full shadow-md backdrop-blur-md transition-all flex items-center justify-center cursor-pointer ${
                isInWishlist(id) 
                  ? 'bg-red-500 text-white' 
                  : 'bg-white/90 text-primary hover:bg-white hover:scale-110'
              }`}
            >
              <Heart className={`h-4 w-4 ${isInWishlist(id) ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Compare Button (Visible on mobile, hover on desktop) */}
          <div className="absolute top-14 right-3 md:top-3 md:left-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
            <button 
              type="button"
              onClick={handleCompare}
              aria-label={isInCompare(id) ? 'إزالة من المقارنة' : 'أضف للمقارنة'}
              className={`w-10 h-10 rounded-full shadow-md backdrop-blur-md transition-all flex items-center justify-center cursor-pointer ${
                isInCompare(id) 
                  ? 'bg-primary text-white' 
                  : 'bg-white/90 text-primary hover:bg-white hover:scale-110'
              }`}
            >
              <GitCompare className="h-4 w-4" />
            </button>
          </div>

          {/* Quick View (Desktop) */}
          <button 
            type="button"
            onClick={() => setIsQuickViewOpen(true)}
            className="hidden md:flex absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md text-primary px-4 py-2 rounded-xl text-xs font-bold shadow-xl opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-300 items-center gap-1.5 hover:bg-white uppercase tracking-wider cursor-pointer"
          >
            <Eye className="h-3.5 w-3.5" />
            عرض سريع
          </button>
        </div>
        
        {/* Text Content */}
        <div className="text-center space-y-1.5 w-full px-1">
          {inspiredBy && (
            <span className="text-[11px] tracking-wider text-on-surface/50 block font-medium">
              مستوحى من: {inspiredBy}
            </span>
          )}
          <Link to={`/perfume/${generateProductSlug(name, id)}`}>
            <h3 className="text-lg font-serif text-primary hover:text-tertiary transition-colors truncate font-bold">
              {name}
            </h3>
          </Link>
          
          {/* Admin Category Tag */}
          {isAdmin && (
            <div className="flex gap-2 justify-center">
              <span className="px-2.5 py-0.5 bg-surface-variant text-[10px] rounded-full uppercase tracking-tighter text-on-surface-variant font-medium">
                {categoryLabel}
              </span>
            </div>
          )}

          <p className="text-tertiary font-bold text-base mt-1 font-mono">
            {formatPrice(price)}
          </p>
          
          {/* Add to Cart Button (Always visible and usable on mobile, hover on desktop) */}
          <button 
            type="button"
            disabled={isOutOfStock}
            onClick={handleAddToCart}
            className={`w-full mt-3 py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
              isOutOfStock
                ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                : 'bg-tertiary-gold text-[#241a00] hover:brightness-110 shadow-tertiary-gold/20 md:opacity-0 md:group-hover:opacity-100'
            }`}
          >
            <ShoppingCart className="h-4 w-4" />
            {isOutOfStock ? 'نفذ من المخزون' : 'أضف للسلة'}
          </button>
        </div>
      </motion.div>

      <QuickViewModal 
        isOpen={isQuickViewOpen} 
        onClose={() => setIsQuickViewOpen(false)} 
        perfume={{ id, name, price, category, inspiredBy, imageUrl, notes, stock, sizes }}
      />
    </>
  );
}
