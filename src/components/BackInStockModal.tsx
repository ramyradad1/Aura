import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Bell, CheckCircle2, Phone, Mail, User, Sparkles } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useToast } from '../context/ToastContext';
import { useTranslation } from '../context/TranslationContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  perfume: {
    id: string;
    name: string;
    inspiredBy?: string;
    imageUrl?: string;
    price?: number;
  };
}

export default function BackInStockModal({ isOpen, onClose, perfume }: Props) {
  const { toast } = useToast();
  const { t, language } = useTranslation();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      toast(t('يرجى إدخال رقم الهاتف أو الواتساب'), 'error');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'back_in_stock_requests'), {
        perfumeId: perfume.id,
        perfumeName: perfume.name,
        customerName: name.trim() || 'عميل مميز',
        phone: phone.trim(),
        email: email.trim() || null,
        createdAt: new Date().toISOString(),
        status: 'pending',
      });

      setSubmitted(true);
      toast(t('تم تسجيل طلبك بنجاح! سنقوم بتنبيهك فور توفر العطر 🔔'), 'success');
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 2000);
    } catch (err: any) {
      console.error('Error saving back in stock request:', err);
      toast(t('حدث خطأ أثناء حفظ الطلب، يرجى المحاولة لاحقاً'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-outline-variant/20 overflow-hidden"
          dir={language === 'ar' ? 'rtl' : 'ltr'}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-2 text-on-surface/40 hover:text-primary transition-colors rounded-full hover:bg-surface-container-low cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>

          {submitted ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-primary">
                {t('تم تسجيل طلبك بنجاح')}
              </h3>
              <p className="text-sm text-on-surface/60 max-w-xs mx-auto leading-relaxed">
                {t('سنرسل لك رسالة واتساب فور توفر هذا العطر بالمخزون مرة أخرى.')}
              </p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-secondary-container/40 text-primary flex items-center justify-center shrink-0">
                  <Bell className="w-6 h-6 text-tertiary" />
                </div>
                <div>
                  <h3 className="text-lg font-serif font-bold text-primary">
                    {t('أعلمني عند التوفر')}
                  </h3>
                  <p className="text-xs text-on-surface/50">
                    {t('كن أول من يعرف فور إعادة توفر العطر')}
                  </p>
                </div>
              </div>

              {/* Product preview */}
              <div className="flex items-center gap-3 p-3 bg-surface-container-low rounded-2xl mb-6 border border-outline-variant/10">
                {perfume.imageUrl && (
                  <img
                    src={perfume.imageUrl}
                    alt={perfume.name}
                    className="w-12 h-12 rounded-xl object-cover bg-white shrink-0"
                  />
                )}
                <div className="min-w-0">
                  <p className="font-bold text-sm text-primary truncate">{perfume.name}</p>
                  {perfume.inspiredBy && (
                    <p className="text-xs text-on-surface/50 truncate">
                      {t('مستوحى من')}: {perfume.inspiredBy}
                    </p>
                  )}
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-primary/70 mb-1.5 uppercase tracking-wider">
                    {t('الاسم')}
                  </label>
                  <div className="relative">
                    <User className={`absolute ${language === 'ar' ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 w-4 h-4 text-outline`} />
                    <input
                      type="text"
                      placeholder={t('اسمك الكريم')}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={`w-full ${language === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 bg-surface-container-low border border-outline-variant/20 rounded-xl text-sm focus-visible:ring-2 focus-visible:ring-primary outline-hidden`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-primary/70 mb-1.5 uppercase tracking-wider">
                    {t('رقم الواتساب / الهاتف')} <span className="text-tertiary">*</span>
                  </label>
                  <div className="relative">
                    <Phone className={`absolute ${language === 'ar' ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 w-4 h-4 text-outline`} />
                    <input
                      type="tel"
                      required
                      placeholder="01012345678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={`w-full ${language === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 bg-surface-container-low border border-outline-variant/20 rounded-xl text-sm focus-visible:ring-2 focus-visible:ring-primary outline-hidden font-mono`}
                      dir="ltr"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-primary/70 mb-1.5 uppercase tracking-wider">
                    {t('البريد الإلكتروني')} <span className="text-on-surface/30 font-normal">({t('اختياري')})</span>
                  </label>
                  <div className="relative">
                    <Mail className={`absolute ${language === 'ar' ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 w-4 h-4 text-outline`} />
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full ${language === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 bg-surface-container-low border border-outline-variant/20 rounded-xl text-sm focus-visible:ring-2 focus-visible:ring-primary outline-hidden`}
                      dir="ltr"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3.5 bg-primary text-white font-bold rounded-xl hover:opacity-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 cursor-pointer disabled:opacity-50 text-sm uppercase tracking-wider"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white" />
                  ) : (
                    <>
                      <Bell className="w-4 h-4" />
                      <span>{t('تأكيد الاشتراك في التنبيه')}</span>
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
