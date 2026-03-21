import React from 'react';
import { X, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'motion/react';

interface QuickViewModalProps {
  perfume: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickViewModal({ perfume, isOpen, onClose }: QuickViewModalProps) {
  const { addToCart } = useCart();

  if (!perfume) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden relative flex flex-col md:flex-row"
          >
            <button
              title="إغلاق النافذة"
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full text-gray-600 hover:text-gray-900 shadow-sm"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="md:w-1/2 h-64 md:h-auto">
              <img
                src={perfume.imageUrl}
                alt={perfume.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="md:w-1/2 p-8 flex flex-col justify-center">
              <div className="mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                  {perfume.category === 'men' ? 'رجالي' : perfume.category === 'women' ? 'نسائي' : 'للجنسين'}
                </span>
              </div>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">{perfume.name}</h2>
              <p className="text-sm text-gray-500 mb-4">مستوحى من: {perfume.inspiredBy}</p>
              
              <div className="text-2xl font-bold text-gray-900 mb-6">${perfume.price}</div>

              <div className="space-y-4">
                <div className="text-sm text-gray-600">
                  <p className="font-bold mb-1">النوتات العليا:</p>
                  <p>{perfume.notes?.top || 'غير متوفر'}</p>
                </div>
                
                <button
                  onClick={() => {
                    addToCart(perfume);
                    onClose();
                  }}
                  className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
                >
                  <ShoppingCart className="h-5 w-5" />
                  إضافة إلى السلة
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
