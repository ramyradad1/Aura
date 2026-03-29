import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/TranslationContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { CreditCard, Truck, CheckCircle } from 'lucide-react';
import SEOHead from '../components/SEOHead';

export default function Checkout() {
  const { language, t } = useTranslation();

  const { items, total, clearCart } = useCart();
  const { user, openAuthModal } = useAuth();
  const navigate = useNavigate();
  
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const isPaymobSuccess = queryParams.get('success') === 'true';
  const isPaymobFailed = queryParams.get('success') === 'false';

  const [address, setAddress] = useState({ city: '', street: '', phone: '' });
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card'>('cod');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(isPaymobSuccess);

  const [error, setError] = useState(isPaymobFailed ? t('عفواً، لم تنجح عملية الدفع. يرجى المحاولة مرة أخرى.') : '');

  useEffect(() => {
    if (isPaymobSuccess && items.length > 0) {
      clearCart();
    }
  }, [isPaymobSuccess]);

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

    setLoading(true);
    try {
      const orderRef = await addDoc(collection(db, 'orders'), {
        userId: user.uid,
        items: items.map(i => ({ perfumeId: i.id, quantity: i.quantity, name: i.name, price: i.price })),
        totalAmount: total,
        status: 'pending',
        paymentMethod,
        paymentStatus: 'pending',
        shippingAddress: `المدينة: ${address.city}، الشارع: ${address.street}، هاتف: ${address.phone}`,
        createdAt: new Date().toISOString()
      });
      
      if (paymentMethod === 'card') {
        const response = await fetch('/api/paymob/create-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: total,
            orderId: orderRef.id,
            items: items.map(i => ({ name: i.name, amount_cents: i.price * 100, description: i.name, quantity: i.quantity })),
            billingData: {
              first_name: user.displayName?.split(' ')[0] || "Customer",
              last_name: user.displayName?.split(' ')[1] || "Aura",
              email: user.email || "test@test.com",
              phone_number: address.phone,
              apartment: "NA", floor: "NA", street: address.street, building: "NA",
              shipping_method: "NA", postal_code: "NA", city: address.city,
              country: "EG", state: "NA"
            }
          })
        });

        const data = await response.json();
        if (data.iframeUrl) {
          window.location.href = data.iframeUrl; // Redirect to Paymob Iframe
          return; // Prevents clearing cart locally before callback
        } else {
          throw new Error(data.error || "حدث خطأ في بوابة الدفع");
        }
      }

      setSuccess(true);
      clearCart();
    } catch (error: any) {
      console.error('Checkout error:', error);
      setError(error.message || 'حدث خطأ أثناء إتمام الطلب. يرجى المحاولة مرة أخرى.');
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
                <span className="font-medium text-primary">{t('البطاقة الائتمانية / تقسيط (Paymob)')}</span>
              </label>
            </div>
            {paymentMethod === 'card' && (
              <div className="mt-6 p-6 bg-surface-container-low border border-outline-variant/20 rounded-lg space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#c4eed0] rounded-full flex items-center justify-center shrink-0">
                    <CheckCircle className="w-6 h-6 text-[#006d3b]" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg text-primary mb-2">{t('الدفع الآمن عبر Paymob')}</h3>
                    <p className="text-sm text-on-surface/70 leading-relaxed font-light">
                      {t('عند النقر على "تأكيد الطلب"، سيتم توجيهك بأمان إلى بوابة الدفع الرسمية (Paymob) لإتمام عملية الدفع الخاصة بك. بمجرد الانتهاء، ستعود تلقائياً إلى موقعنا.')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-luxury border border-outline-variant/10 flex flex-col sm:flex-row justify-between items-center gap-6">
            <div>
              <p className="text-on-surface/40 text-xs uppercase tracking-widest font-bold mb-1">{t('الإجمالي المطلوب')}</p>
              <p className="text-3xl font-serif text-tertiary">{total} {t('ج.م')}</p>
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
