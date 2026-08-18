import React, { useState } from 'react';
import { X, ShoppingCart, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useStoreSettings } from '../context/StoreSettingsContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

interface QuickViewModalProps {
  perfume: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickViewModal({ perfume, isOpen, onClose }: QuickViewModalProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { formatPrice } = useStoreSettings();
  const navigate = useNavigate();

  const [selectedSize, setSelectedSize] = useState<string>(() => {
    return perfume?.sizes?.[0] || '100ml';
  });

  if (!perfume) return null;

  const isOutOfStock = perfume.stock !== undefined && perfume.stock <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) {
      toast('هذا العطر غير متوفر حالياً بالمخزون', 'error');
      return;
    }
    addToCart({
      id: perfume.id,
      name: perfume.name,
      price: perfume.price,
      quantity: 1,
      size: selectedSize,
      imageUrl: perfume.imageUrl || perfume.images?.[0],
      stock: perfume.stock,
    });
    toast(`تمت إضافة "${perfume.name}" إلى السلة 🛍️`, 'success', {
      label: 'عرض السلة',
      onClick: () => {
        onClose();
        navigate('/cart');
      },
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden relative flex flex-col md:flex-row border border-outline-variant/10"
            dir="rtl"
          >
            <button
              title="إغلاق النافذة"
              onClick={onClose}
              className="absolute top-4 left-4 z-10 p-2 bg-white/90 backdrop-blur-md rounded-full text-slate-600 hover:text-slate-900 shadow-md transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="md:w-1/2 h-64 md:h-auto bg-surface-container-low">
              <img
                src={perfume.imageUrl || perfume.images?.[0] || `https://picsum.photos/seed/${perfume.id}/400/500`}
                alt={perfume.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="md:w-1/2 p-8 flex flex-col justify-center text-right">
              <div className="mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-tertiary bg-tertiary-fixed/20 px-3 py-1 rounded-full">
                  {perfume.category === 'men' ? 'رجالي' : perfume.category === 'women' ? 'نسائي' : 'للجنسين'}
                </span>
              </div>
              <h2 className="text-2xl font-serif font-bold text-primary mb-1">{perfume.name}</h2>
              <p className="text-xs text-on-surface/50 mb-4">مستوحى من: {perfume.inspiredBy}</p>
              
              <div className="text-2xl font-bold font-mono text-tertiary mb-4">
                {formatPrice(perfume.price)}
              </div>

              {perfume.sizes && perfume.sizes.length > 0 && (
                <div className="mb-4">
                  <span className="block text-xs font-bold text-slate-500 mb-2">الحجم:</span>
                  <div className="flex gap-2">
                    {perfume.sizes.map((s: string) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSelectedSize(s)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                          selectedSize === s
                            ? 'bg-primary text-white border-primary'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-primary/40'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {perfume.notes?.top && (
                <div className="text-xs text-slate-600 mb-6 bg-slate-50 p-3 rounded-xl">
                  <span className="font-bold text-primary">الافتتاحية: </span>
                  <span>{perfume.notes.top}</span>
                </div>
              )}

              <button
                type="button"
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                  isOutOfStock
                    ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                    : 'bg-primary text-white hover:opacity-95 shadow-primary/20'
                }`}
              >
                {isOutOfStock ? (
                  <>
                    <AlertCircle className="h-4 w-4" />
                    نفذ من المخزون
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4" />
                    إضافة إلى السلة
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
