import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, ArrowRight, Minus, Plus, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import SEOHead from '../components/SEOHead';
import { useTranslation } from '../context/TranslationContext';

export default function Cart() {
  const { language, t } = useTranslation();

  const { items, removeFromCart, updateQuantity, total } = useCart();
  
  const taxRate = 0.14;
  const taxAmount = total * taxRate;
  const finalTotal = total + taxAmount;

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-surface px-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-28 h-28 bg-surface-container-low rounded-full flex items-center justify-center mb-8 mx-auto">
            <ShoppingBag className="w-12 h-12 text-outline" />
          </div>
          <h2 className="text-3xl font-serif text-primary mb-4">{t('سلة التسوق فارغة')}</h2>
          <p className="text-on-surface/50 mb-10 text-center max-w-md leading-relaxed font-light">{t('يبدو أنك لم تقم بإضافة أي عطور إلى سلة التسوق الخاصة بك حتى الآن.')}</p>
          <Link to="/shop/all" className="px-8 py-4 bg-primary text-white font-bold rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 justify-center shadow-lg shadow-primary/20 uppercase tracking-widest text-sm">
            {t('بدء التسوق')} <ArrowRight className={`h-5 w-5 ${language === 'ar' ? 'rotate-180' : ''}`} />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface py-16 px-6 md:px-12" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <SEOHead title={t('سلة التسوق')} description={t('سلة التسوق الخاصة بك في Aura Perfumes')} noindex={true} />
      <div className="max-w-[1200px] mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 space-y-2"
        >
          <h1 className="text-5xl font-serif text-primary">{t('اختياراتك')}</h1>
          <p className="text-on-surface/40 font-light italic">{items.length} {t('قطع في السلة')}</p>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence>
              {items.map((item, index) => (
                <motion.div 
                  key={item.id} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 100 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-6 group"
                >
                  <img src={item.imageUrl} alt={`${t('عطر')} ${item.name}`} className="w-28 h-36 object-cover rounded-lg bg-white shadow-sm" referrerPolicy="no-referrer" loading="lazy" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif text-xl text-primary truncate">{item.name}</h3>
                    <div className="flex items-center gap-3 mt-4">
                      <div className="flex items-center bg-surface-container-low rounded-full">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="p-2 text-primary/60 hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          title={t('تقليل الكمية')}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-bold text-primary w-8 text-center text-sm">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-2 text-primary/60 hover:text-primary transition-colors"
                          title={t('زيادة الكمية')}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className={`text-${language === 'ar' ? 'left' : 'right'} space-y-3`}>
                    <p className="font-serif text-xl text-tertiary">{item.price * item.quantity} {t('ج.م')}</p>
                    <motion.button 
                      whileTap={{ scale: 0.85 }}
                      title={t('حذف المنتج')}
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-on-surface/20 hover:text-error hover:bg-[#ffdad6]/30 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 rounded-[32px] shadow-luxury h-fit sticky top-24"
          >
            <h3 className="font-serif text-2xl text-primary mb-8">{t('ملخص الطلب')}</h3>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-on-surface/50 text-sm">
                <span>{t('المجموع الفرعي')}</span>
                <span className="font-medium text-on-surface">{total.toFixed(2)} {t('ج.م')}</span>
              </div>
              <div className="flex justify-between text-on-surface/50 text-sm">
                <span>{t('ضريبة القيمة المضافة (14%)')}</span>
                <span className="font-medium text-on-surface">{taxAmount.toFixed(2)} {t('ج.م')}</span>
              </div>
              <div className="flex justify-between text-on-surface/50 text-sm">
                <span>{t('الشحن')}</span>
                <span className="text-tertiary font-bold text-xs uppercase tracking-widest">{t('مجاني')}</span>
              </div>
              <div className="h-px bg-outline-variant/20 w-full my-4" />
              <div className="flex justify-between text-2xl font-serif text-primary">
                <span>{t('الإجمالي')}</span>
                <span className="text-tertiary">{finalTotal.toFixed(2)} {t('ج.م')}</span>
              </div>
            </div>
            
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link to="/checkout" className="block w-full py-4 bg-primary text-white font-bold rounded-lg transition-all text-center shadow-lg shadow-primary/20 uppercase tracking-widest text-sm hover:opacity-90">
                {t('إتمام الطلب')}
              </Link>
            </motion.div>
            <Link to="/shop/all" className="block w-full py-4 mt-3 text-primary border border-outline-variant/20 font-bold rounded-lg transition-all text-center uppercase tracking-widest text-sm hover:bg-surface-container-low">
              {t('متابعة التسوق')}
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
