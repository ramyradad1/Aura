import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/TranslationContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../utils/firebaseUtils';
import { CreditCard, Truck, CheckCircle } from 'lucide-react';
import SEOHead from '../components/SEOHead';

export default function Checkout() {
  const { language, t } = useTranslation();

  const { items, total, clearCart } = useCart();
  const { user, openAuthModal } = useAuth();
  const navigate = useNavigate();
  
  const [address, setAddress] = useState({ city: '', street: '', phone: '' });
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card'>('cod');
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [error, setError] = useState('');
  const [errorState, setErrorState] = useState<Error | null>(null);

  if (errorState) {
    throw errorState;
  }

  if (items.length === 0 && !success) {
    navigate('/cart');
    return null;
  }

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!user) {
      openAuthModal();
      return;
    }

    if (paymentMethod === 'card') {
      if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv) {
        setError(t('يرجى إدخال جميع بيانات البطاقة الائتمانية'));
        return;
      }
      if (cardDetails.number.length < 16) {
        setError(t('رقم البطاقة غير صالح'));
        return;
      }
    }
    
    setLoading(true);
    try {
      await addDoc(collection(db, 'orders'), {
        userId: user.uid,
        items: items.map(i => ({ perfumeId: i.id, quantity: i.quantity, price: i.price })),
        totalAmount: total,
        status: 'pending',
        paymentMethod,
        shippingAddress: `المدينة: ${address.city}، الشارع: ${address.street}، هاتف: ${address.phone}`,
        createdAt: new Date().toISOString()
      });
      
      setSuccess(true);
      clearCart();
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.CREATE, 'orders');
      } catch (e: any) {
        setErrorState(e);
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-surface px-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="w-24 h-24 bg-[#c4eed0] rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-12 h-12 text-[#006d3b]" />
        </div>
        <h2 className="text-3xl font-serif text-primary mb-4">{t('تم الطلب بنجاح!')}</h2>
        <p className="text-on-surface/50 mb-8 text-center max-w-md font-light">{t('شكراً لتسوقك معنا. سيتم تجهيز طلبك وشحنه في أقرب وقت ممكن.')}</p>
        <button onClick={() => navigate('/')} className="px-8 py-3 bg-primary text-white font-bold rounded-lg hover:opacity-90 transition-opacity uppercase tracking-widest text-xs shadow-lg shadow-primary/20">
          {t('العودة للرئيسية')}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface py-16 px-6 md:px-12" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <SEOHead title={t('إتمام الطلب')} description={t('أكمل عملية الشراء من Aura Perfumes')} noindex={true} />
      <div className="max-w-[800px] mx-auto">
        <h1 className="text-4xl font-serif text-primary mb-10">{t('إتمام الطلب')}</h1>
        
        {error && (
          <div className="mb-6 p-4 bg-[#ffdad6] border border-error/20 text-[#93000a] rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleCheckout} className="space-y-8">
          <div className="bg-white p-8 rounded-2xl shadow-luxury border border-outline-variant/10">
            <h2 className="text-xl font-serif text-primary mb-6 flex items-center gap-2">
              <Truck className={`h-5 w-5 ${language === 'ar' ? 'ml-2' : 'mr-2'} text-tertiary`} /> {t('عنوان الشحن')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-primary/60 mb-2 uppercase tracking-widest">{t('المدينة')}</label>
                <input
                  required
                  type="text"
                  value={address.city}
                  onChange={(e) => setAddress({...address, city: e.target.value})}
                  placeholder={t('القاهرة، الإسكندرية...')}
                  className="w-full p-4 bg-surface-container-low border border-outline-variant/20 rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary/20 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-primary/60 mb-2 uppercase tracking-widest">{t('رقم الهاتف')}</label>
                <input
                  required
                  type="tel"
                  value={address.phone}
                  onChange={(e) => setAddress({...address, phone: e.target.value})}
                  placeholder={t('01xxxxxxxxx')}
                  className={`w-full p-4 bg-surface-container-low border border-outline-variant/20 rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary/20 outline-none text-sm text-${language === 'ar' ? 'right' : 'left'}`}
                  dir="ltr"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-primary/60 mb-2 uppercase tracking-widest">{t('العنوان بالتفصيل')}</label>
                <textarea
                  required
                  value={address.street}
                  onChange={(e) => setAddress({...address, street: e.target.value})}
                  placeholder={t('أدخل عنوانك بالتفصيل (الشارع، رقم المبنى، الدور، الشقة)...')}
                  className="w-full p-4 bg-surface-container-low border border-outline-variant/20 rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary/20 outline-none h-24 resize-none text-sm"
                />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-luxury border border-outline-variant/10">
            <h2 className="text-xl font-serif text-primary mb-6 flex items-center gap-2">
              <CreditCard className={`h-5 w-5 ${language === 'ar' ? 'ml-2' : 'mr-2'} text-tertiary`} /> {t('طريقة الدفع')}
            </h2>
            <div className="space-y-4">
              <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-primary bg-secondary-container/20' : 'border-outline-variant/20 hover:bg-surface-container-low'}`}>
                <input 
                  type="radio" 
                  name="payment" 
                  value="cod" 
                  checked={paymentMethod === 'cod'} 
                  onChange={() => setPaymentMethod('cod')}
                  className={`w-5 h-5 text-primary ${language === 'ar' ? 'ml-4' : 'mr-4'}`}
                />
                <span className="font-medium text-primary">{t('الدفع عند الاستلام')}</span>
              </label>
              
              <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'card' ? 'border-primary bg-secondary-container/20' : 'border-outline-variant/20 hover:bg-surface-container-low'}`}>
                <input 
                  type="radio" 
                  name="payment" 
                  value="card" 
                  checked={paymentMethod === 'card'} 
                  onChange={() => setPaymentMethod('card')}
                  className={`w-5 h-5 text-primary ${language === 'ar' ? 'ml-4' : 'mr-4'}`}
                />
                <span className="font-medium text-primary">{t('البطاقة الائتمانية (تجريبي)')}</span>
              </label>
            </div>
            
            {paymentMethod === 'card' && (
              <div className="mt-6 p-6 bg-surface-container-low border border-outline-variant/20 rounded-lg space-y-4">
                <h3 className="font-serif text-primary mb-4">{t('بيانات البطاقة (محاكاة)')}</h3>
                <div>
                  <label className="block text-xs text-primary/60 mb-1 uppercase tracking-widest font-bold">{t('رقم البطاقة')}</label>
                  <input 
                    type="text" 
                    maxLength={16}
                    placeholder="1234 5678 9101 1121"
                    value={cardDetails.number}
                    onChange={(e) => setCardDetails({...cardDetails, number: e.target.value.replace(/\D/g, '')})}
                    className={`w-full p-3 bg-white border border-outline-variant/20 rounded-lg outline-none focus:border-primary/30 text-${language === 'ar' ? 'left' : 'right'} text-sm`}
                    dir="ltr"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-primary/60 mb-1 uppercase tracking-widest font-bold">{t('تاريخ الانتهاء')}</label>
                    <input 
                      type="text" 
                      maxLength={5}
                      placeholder="MM/YY"
                      value={cardDetails.expiry}
                      onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
                      className={`w-full p-3 bg-white border border-outline-variant/20 rounded-lg outline-none focus:border-primary/30 text-${language === 'ar' ? 'left' : 'right'} text-sm`}
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-primary/60 mb-1 uppercase tracking-widest font-bold">{t('رمز الأمان (CVV)')}</label>
                    <input 
                      type="text" 
                      maxLength={3}
                      placeholder="123"
                      value={cardDetails.cvv}
                      onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value.replace(/\D/g, '')})}
                      className={`w-full p-3 bg-white border border-outline-variant/20 rounded-lg outline-none focus:border-primary/30 text-${language === 'ar' ? 'left' : 'right'} text-sm`}
                      dir="ltr"
                    />
                  </div>
                </div>
                <div className="mt-4 p-3 bg-tertiary-fixed/20 text-tertiary text-sm rounded-lg flex items-start gap-2">
                  <CheckCircle className={`h-5 w-5 shrink-0 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                  <p>{t('هذه محاكاة لعملية الدفع. لن يتم خصم أي مبالغ حقيقية. سيتم تسجيل الطلب بنجاح عند إدخال بيانات وهمية.')}</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-luxury border border-outline-variant/10 flex flex-col sm:flex-row justify-between items-center gap-6">
            <div>
              <p className="text-on-surface/40 text-xs uppercase tracking-widest font-bold mb-1">{t('الإجمالي المطلوب')}</p>
              <p className="text-3xl font-serif text-tertiary">${total}</p>
            </div>
            <button 
              type="submit" 
              disabled={loading || !address.city || !address.street || !address.phone}
              className="w-full sm:w-auto px-12 py-4 bg-primary hover:opacity-90 text-white font-bold rounded-lg transition-opacity disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-sm shadow-lg shadow-primary/20"
            >
              {loading ? t('جاري المعالجة...') : t('تأكيد الطلب')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
