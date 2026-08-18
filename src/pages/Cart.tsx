import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, ArrowRight, Minus, Plus, ShoppingBag, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import SEOHead from '../components/SEOHead';
import { useTranslation } from '../context/TranslationContext';
import { useStoreSettings } from '../context/StoreSettingsContext';

export default function Cart() {
  const { language, t } = useTranslation();
  const { items, removeFromCart, updateQuantity, total, itemCount } = useCart();
  const { settings, getShippingFee, formatPrice } = useStoreSettings();

  const shippingFee = getShippingFee(total, items.length);
  const finalTotal = total + shippingFee;
  const isFreeShipping = shippingFee === 0 && items.length > 0;

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
          <p className="text-on-surface/50 mb-10 text-center max-w-md leading-relaxed font-light">
            {t('يبدو أنك لم تقم بإضافة أي عطور إلى سلة التسوق الخاصة بك حتى الآن.')}
          </p>
          <Link
            to="/shop/all"
            className="px-8 py-4 bg-primary text-white font-bold rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 justify-center shadow-lg shadow-primary/20 uppercase tracking-widest text-sm"
          >
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
          <p className="text-on-surface/40 font-light italic">
            {itemCount} {t('قطع في السلة')}
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence>
              {items.map((item, index) => {
                const itemKey = item.cartItemId || item.id;
                return (
                  <motion.div 
                    key={itemKey} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 100 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-6 group bg-white p-4 rounded-2xl shadow-sm border border-outline-variant/10"
                  >
                    <img
                      src={item.imageUrl || `https://picsum.photos/seed/${item.id}/200/260`}
                      alt={`${t('عطر')} ${item.name}`}
                      className="w-24 h-32 object-cover rounded-xl bg-surface-container-low shadow-sm"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif text-lg md:text-xl text-primary truncate">{item.name}</h3>
                      {item.size && (
                        <span className="inline-block mt-1 px-2.5 py-0.5 bg-surface-container-low text-primary/70 rounded-md text-xs font-semibold">
                          {item.size}
                        </span>
                      )}
                      <p className="text-xs text-on-surface/40 mt-1 font-mono">{formatPrice(item.price)} للقطعة</p>
                      <div className="flex items-center gap-3 mt-3">
                        <div className="flex items-center bg-surface-container-low rounded-full">
                          <button 
                            onClick={() => updateQuantity(itemKey, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="p-2 text-primary/60 hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            title={t('تقليل الكمية')}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="font-bold text-primary w-8 text-center text-sm">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(itemKey, item.quantity + 1)}
                            className="p-2 text-primary/60 hover:text-primary transition-colors"
                            title={t('زيادة الكمية')}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className={`text-${language === 'ar' ? 'left' : 'right'} space-y-3 shrink-0`}>
                      <p className="font-serif text-lg md:text-xl text-tertiary font-bold">{formatPrice(item.price * item.quantity)}</p>
                      <motion.button 
                        whileTap={{ scale: 0.85 }}
                        title={t('حذف المنتج')}
                        onClick={() => removeFromCart(itemKey)}
                        className="p-2 text-on-surface/30 hover:text-error hover:bg-[#ffdad6]/30 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
          
          {/* Summary Sidebar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 rounded-[32px] shadow-luxury h-fit sticky top-24 border border-outline-variant/10"
          >
            <h3 className="font-serif text-2xl text-primary mb-6">{t('ملخص الطلب')}</h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-on-surface/60 text-sm">
                <span>{t('المجموع الفرعي')}</span>
                <span className="font-medium text-on-surface">{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-on-surface/60 text-sm">
                <span>{t('الشحن')} ({settings.deliveryTimeText})</span>
                <span className={isFreeShipping ? 'text-emerald-600 font-bold text-xs uppercase tracking-wider' : 'font-medium text-on-surface'}>
                  {isFreeShipping ? t('شحن مجاني') : formatPrice(shippingFee)}
                </span>
              </div>
              
              <div className="h-px bg-outline-variant/20 w-full my-3" />
              
              <div className="flex justify-between items-baseline text-2xl font-serif text-primary">
                <span>{t('الإجمالي')}</span>
                <span className="text-tertiary font-bold">{formatPrice(finalTotal)}</span>
              </div>
              <p className="text-[11px] text-slate-400">الأسعار شاملة كافة الرسوم والضرائب</p>
            </div>
            
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                to="/checkout"
                className="block w-full py-4 bg-primary text-white font-bold rounded-xl transition-all text-center shadow-lg shadow-primary/20 uppercase tracking-widest text-sm hover:opacity-90"
              >
                {t('متابعة إلى الدفع')}
              </Link>
            </motion.div>

            <Link
              to="/shop/all"
              className="block w-full py-3.5 mt-3 text-primary border border-outline-variant/30 font-bold rounded-xl transition-all text-center uppercase tracking-widest text-xs hover:bg-surface-container-low"
            >
              {t('متابعة التسوق')}
            </Link>

            <div className="mt-6 pt-4 border-t border-outline-variant/15 flex items-center justify-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>دفع آمن عند الاستلام وتأكيد عبر واتساب</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
