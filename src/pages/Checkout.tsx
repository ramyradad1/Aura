import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/TranslationContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { CreditCard, CheckCircle, HelpCircle } from 'lucide-react';
import SEOHead from '../components/SEOHead';

const GOVERNORATES = [
  "Cairo", "Giza", "Alexandria", "Qalyubia", "Dakahlia", "Sharqia", "Damietta", "Kafr El-Sheikh", 
  "Gharbia", "Monufia", "Beheira", "Ismailia", "Port Said", "Suez", "North Sinai", "South Sinai", 
  "Beni Suef", "Faiyum", "Minya", "Asyut", "Sohag", "Qena", "Luxor", "Aswan", "Red Sea", "New Valley", "Matrouh"
];

const SHIPPING_FEE = 90;

export default function Checkout() {
  const { language, t } = useTranslation();
  const { items, total, clearCart } = useCart();
  const { user, openAuthModal } = useAuth();
  const navigate = useNavigate();
  
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const isPaymobSuccess = queryParams.get('success') === 'true';
  const isPaymobFailed = queryParams.get('success') === 'false';

  const [formData, setFormData] = useState({
    email: user?.email || '',
    country: 'Egypt',
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    city: '',
    governorate: 'Cairo',
    postalCode: '',
    phone: '',
    saveInfo: false
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card'>('cod');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(isPaymobSuccess);

  const finalTotal = total + (items.length > 0 ? SHIPPING_FEE : 0);

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validateName = (name: string) => name.trim().length >= 2;
  const validateAddress = (addr: string) => addr.trim().length >= 5;
  const validateCity = (city: string) => city.trim().length >= 2;
  const validatePhone = (phone: string) => /^01\d{9}$/.test(phone);

  const errors = {
    email: validateEmail(formData.email) ? '' : t('البريد الإلكتروني غير صالح'),
    firstName: validateName(formData.firstName) ? '' : t('الاسم الأول مطلوب'),
    lastName: validateName(formData.lastName) ? '' : t('اسم العائلة مطلوب'),
    address: validateAddress(formData.address) ? '' : t('العنوان مطلوب'),
    city: validateCity(formData.city) ? '' : t('اسم المدينة يجب أن يكون حرفين على الأقل'),
    phone: validatePhone(formData.phone) ? '' : t('رقم الهاتف يجب أن يتكون من 11 رقم ويبدأ بـ 01'),
  };

  const isFormValid = !errors.email && !errors.firstName && !errors.lastName && 
                      !errors.address && !errors.city && !errors.phone;

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

  const handleBlur = (field: string) => setTouched({ ...touched, [field]: true });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    Object.keys(formData).forEach(key => handleBlur(key));
    if (!isFormValid) return;

    setError('');
    if (!user) {
      openAuthModal();
      return;
    }

    setLoading(true);
    try {
      const formattedAddress = `${formData.address}${formData.apartment ? ', ' + formData.apartment : ''}, ${formData.city}, ${formData.governorate}, ${formData.country} ${formData.postalCode ? '- ' + formData.postalCode : ''}`;
      const fullName = `${formData.firstName} ${formData.lastName}`;

      const orderRef = await addDoc(collection(db, 'orders'), {
        userId: user.uid,
        items: items.map(i => ({ perfumeId: i.id, quantity: i.quantity, name: i.name, price: i.price })),
        totalAmount: finalTotal, // use finalTotal with shipping fee
        shippingFee: SHIPPING_FEE,
        status: 'pending',
        paymentMethod,
        paymentStatus: 'pending',
        shippingAddress: `الاسم: ${fullName}، الهاتف: ${formData.phone}، العنوان: ${formattedAddress}`,
        contactEmail: formData.email,
        createdAt: new Date().toISOString()
      });
      
      if (paymentMethod === 'card') {
        const response = await fetch('/api/paymob/create-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: finalTotal, // Pass the total with shipping to paymob
            orderId: orderRef.id,
            items: items.map(i => ({ name: i.name, amount_cents: i.price * 100, description: i.name, quantity: i.quantity })),
            billingData: {
              first_name: formData.firstName || user.displayName?.split(' ')[0] || "Customer",
              last_name: formData.lastName || user.displayName?.split(' ').slice(1).join(' ') || "Aura",
              email: formData.email || user.email || "test@test.com",
              phone_number: formData.phone,
              apartment: formData.apartment || "NA", floor: "NA", street: formData.address, building: "NA",
              shipping_method: "Delivery", postal_code: formData.postalCode || "NA", city: formData.city,
              country: "EG", state: formData.governorate || "NA"
            }
          })
        });

        const data = await response.json();
        if (data.iframeUrl) {
          window.location.href = data.iframeUrl;
          return;
        } else {
          const detailStr = data.details ? ` | Details: ${JSON.stringify(data.details)}` : '';
          throw new Error((data.error || "حدث خطأ في بوابة الدفع") + detailStr);
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

  const isRTL = language === 'ar';

  const CustomInput = ({ name, type = "text", label, required = false, dir = "auto", infoIcon = false }: any) => {
    const errorMsg = touched[name] && (errors as any)[name];
    const isFloating = formData[name as keyof typeof formData] !== '';
    return (
      <div className="relative mb-3">
        <label
          htmlFor={name}
          className={`absolute top-2 ${isRTL ? 'right-3' : 'left-3'} text-xs text-gray-500 transition-all ${!isFloating ? 'top-3.5 text-[15px]' : ''} pointer-events-none`}
          style={{ transformOrigin: isRTL ? 'right' : 'left' }}
        >
          {label}
        </label>
        <input
          type={type}
          id={name}
          name={name}
          value={(formData as any)[name]}
          onChange={handleChange}
          onBlur={() => handleBlur(name)}
          required={required}
          dir={dir}
          className={`w-full px-3 pb-2 pt-6 bg-white border rounded-md shadow-sm appearance-none outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow ${errorMsg ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'}`}
        />
        {infoIcon && <HelpCircle className={`absolute top-3.5 ${isRTL ? 'left-3' : 'right-3'} w-5 h-5 text-gray-400`} />}
        {errorMsg && <p className="text-red-500 text-xs mt-1 px-1">{errorMsg}</p>}
      </div>
    );
  };

  if (success) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-surface px-4" dir={isRTL ? 'rtl' : 'ltr'}>
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
    <div className="min-h-screen bg-white py-12 px-4 md:px-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <SEOHead title={t('إتمام الطلب')} description={t('أكمل عملية الشراء من Aura Perfumes')} noindex={true} />
      <div className="max-w-2xl mx-auto font-sans">
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleCheckout} className="space-y-8 text-gray-800">
          {/* Contact Section */}
          <section>
            <div className="flex justify-between items-baseline mb-4">
              <h2 className="text-2xl font-semibold">{t('تواصل')}</h2>
              {!user && <button type="button" onClick={openAuthModal} className="text-sm text-blue-600 hover:underline">{t('تسجيل الدخول')}</button>}
            </div>
            
            <div className="relative mb-3">
               <label
                htmlFor="email"
                className={`absolute top-2 ${isRTL ? 'right-3' : 'left-3'} text-xs text-gray-500 transition-all ${!formData.email ? 'top-3.5 text-[15px]' : ''} pointer-events-none`}
              >{t('البريد الإلكتروني')}</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={() => handleBlur('email')}
                className={`w-full px-3 pb-2 pt-6 bg-white border rounded-md shadow-sm appearance-none outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow ${touched.email && errors.email ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'}`}
                dir="ltr"
              />
              {touched.email && errors.email && <p className="text-red-500 text-xs mt-1 px-1">{errors.email}</p>}
            </div>
          </section>

          {/* Delivery Section */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">{t('التوصيل')}</h2>
            
            <div className="mb-3 relative">
              <label className={`absolute top-2 ${isRTL ? 'right-3' : 'left-3'} text-xs text-gray-500 pointer-events-none`}>{t('البلد/المنطقة')}</label>
              <select disabled aria-label={t('البلد/المنطقة')} className="w-full px-3 pb-2 pt-6 bg-white border border-gray-300 rounded-md shadow-sm appearance-none outline-none text-gray-800">
                <option>{t('مصر')}</option>
              </select>
              <div className={`pointer-events-none absolute inset-y-0 ${isRTL ? 'left-3' : 'right-3'} flex items-center px-2 text-gray-700`}>
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>

            <div className="flex gap-3 mb-3">
              <div className="flex-1"><CustomInput name="firstName" label={t('الاسم الأول')} /></div>
              <div className="flex-1"><CustomInput name="lastName" label={t('اسم العائلة')} /></div>
            </div>

            <CustomInput name="address" label={t('العنوان')} />
            <CustomInput name="apartment" label={t('شقة، جناح، إلخ (اختياري)')} />

            <div className="flex flex-col sm:flex-row gap-3 mb-3">
              <div className="flex-1"><CustomInput name="city" label={t('المدينة')} /></div>
              <div className="flex-1 relative">
                <label className={`absolute top-2 ${isRTL ? 'right-3' : 'left-3'} text-xs text-gray-500 pointer-events-none`}>{t('المحافظة')}</label>
                <select 
                  name="governorate" 
                  aria-label={t('المحافظة')}
                  value={formData.governorate} 
                  onChange={handleChange} 
                  className="w-full px-3 pb-2 pt-6 bg-white border border-gray-300 rounded-md shadow-sm appearance-none outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {GOVERNORATES.map(gov => (
                    <option key={gov} value={gov}>{t(gov)}</option>
                  ))}
                </select>
                <div className={`pointer-events-none absolute inset-y-0 ${isRTL ? 'left-3' : 'right-3'} flex items-center px-2 text-gray-700`}>
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
              <div className="flex-1"><CustomInput name="postalCode" label={t('الرمز البريدي (اختياري)')} dir="ltr" /></div>
            </div>

            <CustomInput name="phone" label={t('رقم الهاتف')} type="tel" dir="ltr" infoIcon />

            <label className="flex items-center gap-2 mt-4 cursor-pointer">
              <input type="checkbox" name="saveInfo" checked={formData.saveInfo} onChange={handleChange} className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
              <span className="text-sm">{t('حفظ هذه المعلومات للمرة القادمة')}</span>
            </label>
          </section>

          {/* Shipping Method Section */}
          <section>
            <h2 className="text-lg font-semibold mb-3">{t('طريقة الشحن')}</h2>
            <div className="w-full px-4 py-3 bg-blue-50 border border-blue-500 rounded-md flex justify-between items-center text-sm font-medium">
              <span>{t('توصيل (2-5 أيام عمل)')}</span>
              <span className="font-bold">E£{SHIPPING_FEE.toFixed(2)}</span>
            </div>
          </section>

          {/* Payment Method Section */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">{t('طريقة الدفع')}</h2>
            <div className="border border-gray-300 rounded-md overflow-hidden bg-white">
              <label className={`flex items-center p-4 cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}>
                <input 
                  type="radio" 
                  name="payment" 
                  value="cod" 
                  checked={paymentMethod === 'cod'} 
                  onChange={() => setPaymentMethod('cod')}
                  className={`w-4 h-4 text-blue-600 ${isRTL ? 'ml-3' : 'mr-3'} focus:ring-blue-500`}
                />
                <span className="text-sm font-medium">{t('الدفع عند الاستلام')}</span>
              </label>
              <div className="border-t border-gray-200"></div>
              <label className={`flex items-center p-4 cursor-pointer transition-colors ${paymentMethod === 'card' ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}>
                <input 
                  type="radio" 
                  name="payment" 
                  value="card" 
                  checked={paymentMethod === 'card'} 
                  onChange={() => setPaymentMethod('card')}
                  className={`w-4 h-4 text-blue-600 ${isRTL ? 'ml-3' : 'mr-3'} focus:ring-blue-500`}
                />
                <div className="flex flex-col">
                   <span className="text-sm font-medium">{t('البطاقة الائتمانية / تقسيط (Paymob)')}</span>
                   {paymentMethod === 'card' && <p className="text-xs text-gray-500 mt-1">{t('عند النقر على "تأكيد الطلب"، سيتم توجيهك بأمان إلى بوابة الدفع الرسمية (Paymob).')}</p>}
                </div>
              </label>
            </div>
          </section>

          {/* Submit */}
          <div className="pt-6 mt-6 border-t border-gray-200">
            <div className="flex justify-between items-center mb-6">
               <span className="text-lg font-medium">{t('الإجمالي')}</span>
               <span className="text-2xl font-bold">E£{finalTotal.toLocaleString()}</span>
            </div>
            
            <button 
              type="submit" 
              disabled={loading || !isFormValid}
              className={`w-full py-4 text-white rounded-md font-semibold transition-all ${(!loading && isFormValid) ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-300 cursor-not-allowed'}`}
            >
              {loading ? t('جاري المعالجة...') : t('تأكيد الطلب')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
