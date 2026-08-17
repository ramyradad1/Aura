import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/TranslationContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { CheckCircle, HelpCircle, MessageCircle, ShieldCheck } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import { useStoreSettings } from '../context/StoreSettingsContext';

import {
  buildWhatsAppOrderLink,
  generateOrderNumber,
  type WhatsAppOrderPayload,
} from '../utils/whatsappOrder';

const GOVERNORATES = [
  "Cairo", "Giza", "Alexandria", "Qalyubia", "Dakahlia", "Sharqia", "Damietta", "Kafr El-Sheikh",
  "Gharbia", "Monufia", "Beheira", "Ismailia", "Port Said", "Suez", "North Sinai", "South Sinai",
  "Beni Suef", "Faiyum", "Minya", "Asyut", "Sohag", "Qena", "Luxor", "Aswan", "Red Sea", "New Valley", "Matrouh"
];

type FormData = {
  email: string;
  country: string;
  firstName: string;
  lastName: string;
  address: string;
  apartment: string;
  landmark: string;
  city: string;
  governorate: string;
  postalCode: string;
  phone: string;
  altPhone: string;
  notes: string;
  saveInfo: boolean;
};

/**
 * Defined at module scope on purpose: declaring it inside Checkout would remount
 * the input on every keystroke and drop focus.
 */
function Field({
  name, label, value, onChange, onBlur, error, type = 'text', dir = 'auto',
  isRTL, infoIcon = false, required = false, autoComplete,
}: {
  name: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (name: string) => void;
  error?: string;
  type?: string;
  dir?: string;
  isRTL: boolean;
  infoIcon?: boolean;
  required?: boolean;
  autoComplete?: string;
}) {
  const isFloating = value !== '';
  return (
    <div className="relative mb-3">
      <label
        htmlFor={name}
        className={`absolute top-2 ${isRTL ? 'right-3' : 'left-3'} text-xs text-gray-500 transition-all ${!isFloating ? 'top-3.5 text-[15px]' : ''} pointer-events-none`}
      >
        {label}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={() => onBlur(name)}
        required={required}
        dir={dir}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        className={`w-full px-3 pb-2 pt-6 bg-white border rounded-md shadow-sm appearance-none outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow ${error ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'}`}
      />
      {infoIcon && <HelpCircle className={`absolute top-3.5 ${isRTL ? 'left-3' : 'right-3'} w-5 h-5 text-gray-400`} />}
      {error && <p id={`${name}-error`} className="text-red-500 text-xs mt-1 px-1">{error}</p>}
    </div>
  );
}

export default function Checkout() {
  const { language, t } = useTranslation();
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const { settings, getShippingFee, formatPrice } = useStoreSettings();
  const navigate = useNavigate();


  const [formData, setFormData] = useState<FormData>({
    email: user?.email || '',
    country: 'Egypt',
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    landmark: '',
    city: '',
    governorate: 'Cairo',
    postalCode: '',
    phone: '',
    altPhone: '',
    notes: '',
    saveInfo: false,
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [whatsappLink, setWhatsappLink] = useState('');

  // Shipping honours the free-shipping threshold configured in the admin panel.
  const shippingFee = getShippingFee(total, items.length);
  const finalTotal = total + shippingFee;
  const isFreeShipping = shippingFee === 0 && items.length > 0;


  const validateName = (name: string) => name.trim().length >= 2;
  const validatePhone = (phone: string) => /^01\d{9}$/.test(phone);

  const errors = {
    firstName: validateName(formData.firstName) ? '' : t('الاسم الأول مطلوب'),
    lastName: validateName(formData.lastName) ? '' : t('اسم العائلة مطلوب'),
    address: formData.address.trim().length >= 5 ? '' : t('العنوان مطلوب'),
    city: validateName(formData.city) ? '' : t('اسم المدينة يجب أن يكون حرفين على الأقل'),
    phone: validatePhone(formData.phone) ? '' : t('رقم الهاتف يجب أن يتكون من 11 رقم ويبدأ بـ 01'),
    altPhone: !formData.altPhone || validatePhone(formData.altPhone) ? '' : t('رقم الهاتف يجب أن يتكون من 11 رقم ويبدأ بـ 01'),
    email: !formData.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) ? '' : t('البريد الإلكتروني غير صالح'),
  };

  const isFormValid = useMemo(
    () => Object.values(errors).every(e => e === ''),
    [errors]
  );

  const isRTL = language === 'ar';

  const handleBlur = (field: string) => setTouched(prev => ({ ...prev, [field]: true }));
  const err = (field: keyof typeof errors) => (touched[field] ? errors[field] : '');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  if (items.length === 0 && !success) {
    navigate('/cart');
    return null;
  }

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(Object.keys(formData).reduce((acc, k) => ({ ...acc, [k]: true }), {}));
    if (!isFormValid) return;

    setError('');
    setLoading(true);

    const orderNumber = generateOrderNumber();
    const payload: WhatsAppOrderPayload = {
      orderNumber,
      items: items.map(i => ({ name: i.name, quantity: i.quantity, price: i.price })),
      subtotal: total,
      shippingFee,
      total: finalTotal,
      customer: {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
        altPhone: formData.altPhone.trim() || undefined,
        email: formData.email.trim() || undefined,
      },
      address: {
        street: formData.address.trim(),
        apartment: formData.apartment.trim() || undefined,
        landmark: formData.landmark.trim() || undefined,
        city: formData.city.trim(),
        governorate: t(formData.governorate),
        postalCode: formData.postalCode.trim() || undefined,
        country: t('مصر'),
      },
      notes: formData.notes.trim() || undefined,
    };

    const link = buildWhatsAppOrderLink(payload, settings);

    // Open the WhatsApp tab synchronously, still inside the click gesture,
    // so mobile browsers don't treat it as a blocked popup.
    const waWindow = window.open(link, '_blank', 'noopener,noreferrer');

    // Persisting to Firestore is best effort: a failed write (e.g. guest rules)
    // must never block the customer from sending their order.
    try {
      const formattedAddress = [
        formData.address,
        formData.apartment,
        formData.landmark,
        formData.city,
        t(formData.governorate),
        formData.postalCode,
      ].filter(Boolean).join(', ');

      await addDoc(collection(db, 'orders'), {
        orderNumber,
        userId: user?.uid || 'guest',
        isGuest: !user,
        items: items.map(i => ({ perfumeId: i.id, quantity: i.quantity, name: i.name, price: i.price })),
        totalAmount: finalTotal,
        subtotal: total,
        shippingFee,
        status: 'pending',
        paymentMethod: 'whatsapp',
        paymentStatus: 'pending',
        customerName: `${formData.firstName} ${formData.lastName}`.trim(),
        customerPhone: formData.phone,
        shippingAddress: `الاسم: ${formData.firstName} ${formData.lastName}، الهاتف: ${formData.phone}، العنوان: ${formattedAddress}`,
        contactEmail: formData.email || '',
        notes: formData.notes || '',
        createdAt: new Date().toISOString(),
      });
    } catch (dbError) {
      console.warn('Order could not be saved to Firestore, WhatsApp order still sent:', dbError);
    }

    setWhatsappLink(link);
    setSuccess(true);
    clearCart();
    setLoading(false);

    if (!waWindow) {
      setError(t('لم يتم فتح واتساب تلقائياً. اضغط على الزر بالأسفل لإرسال الطلب.'));
    }
  };

  if (success) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-surface px-4" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="w-24 h-24 bg-[#c4eed0] rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-12 h-12 text-[#006d3b]" />
        </div>
        <h2 className="text-3xl font-serif text-primary mb-4">{t('تم تجهيز طلبك!')}</h2>
        <p className="text-on-surface/50 mb-8 text-center max-w-md font-light">
          {t('تم تحويلك إلى واتساب لإرسال تفاصيل الطلب. برجاء إرسال الرسالة لتأكيد الطلب معنا.')}
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          {whatsappLink && (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 bg-[#25D366] text-white font-bold rounded-lg hover:opacity-90 transition-opacity uppercase tracking-widest text-xs shadow-lg flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              {t('إرسال الطلب على واتساب')}
            </a>
          )}
          <button onClick={() => navigate('/')} className="px-8 py-3 bg-primary text-white font-bold rounded-lg hover:opacity-90 transition-opacity uppercase tracking-widest text-xs shadow-lg shadow-primary/20">
            {t('العودة للرئيسية')}
          </button>
        </div>
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

        <div className="mb-8 p-4 rounded-lg bg-emerald-50 border border-emerald-200 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-sm text-emerald-900">
            <p className="font-semibold mb-0.5">{t('لا حاجة لإنشاء حساب')}</p>
            <p className="text-emerald-800/80">{t('املأ بياناتك وسيتم إرسال تفاصيل الطلب على واتساب لتأكيده معك.')}</p>
          </div>
        </div>

        <form onSubmit={handleCheckout} className="space-y-8 text-gray-800">
          {/* Delivery Section */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">{t('التوصيل')}</h2>

            <div className="mb-3 relative">
              <label className={`absolute top-2 ${isRTL ? 'right-3' : 'left-3'} text-xs text-gray-500 pointer-events-none`}>{t('البلد/المنطقة')}</label>
              <select disabled aria-label={t('البلد/المنطقة')} className="w-full px-3 pb-2 pt-6 bg-white border border-gray-300 rounded-md shadow-sm appearance-none outline-none text-gray-800">
                <option>{t('مصر')}</option>
              </select>
              <div className={`pointer-events-none absolute inset-y-0 ${isRTL ? 'left-3' : 'right-3'} flex items-center px-2 text-gray-700`}>
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <Field name="firstName" label={t('الاسم الأول')} value={formData.firstName} onChange={handleChange} onBlur={handleBlur} error={err('firstName')} isRTL={isRTL} autoComplete="given-name" required />
              </div>
              <div className="flex-1">
                <Field name="lastName" label={t('اسم العائلة')} value={formData.lastName} onChange={handleChange} onBlur={handleBlur} error={err('lastName')} isRTL={isRTL} autoComplete="family-name" required />
              </div>
            </div>

            <Field name="address" label={t('العنوان')} value={formData.address} onChange={handleChange} onBlur={handleBlur} error={err('address')} isRTL={isRTL} autoComplete="street-address" required />
            <Field name="apartment" label={t('شقة، دور، إلخ (اختياري)')} value={formData.apartment} onChange={handleChange} onBlur={handleBlur} isRTL={isRTL} />
            <Field name="landmark" label={t('علامة مميزة قريبة (اختياري)')} value={formData.landmark} onChange={handleChange} onBlur={handleBlur} isRTL={isRTL} />

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Field name="city" label={t('المدينة')} value={formData.city} onChange={handleChange} onBlur={handleBlur} error={err('city')} isRTL={isRTL} autoComplete="address-level2" required />
              </div>
              <div className="flex-1 relative mb-3">
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
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                </div>
              </div>
              <div className="flex-1">
                <Field name="postalCode" label={t('الرمز البريدي (اختياري)')} value={formData.postalCode} onChange={handleChange} onBlur={handleBlur} isRTL={isRTL} dir="ltr" />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Field name="phone" label={t('رقم الهاتف')} type="tel" value={formData.phone} onChange={handleChange} onBlur={handleBlur} error={err('phone')} isRTL={isRTL} dir="ltr" autoComplete="tel" infoIcon required />
              </div>
              <div className="flex-1">
                <Field name="altPhone" label={t('رقم احتياطي (اختياري)')} type="tel" value={formData.altPhone} onChange={handleChange} onBlur={handleBlur} error={err('altPhone')} isRTL={isRTL} dir="ltr" />
              </div>
            </div>

            <Field name="email" label={t('البريد الإلكتروني (اختياري)')} type="email" value={formData.email} onChange={handleChange} onBlur={handleBlur} error={err('email')} isRTL={isRTL} dir="ltr" autoComplete="email" />

            <div className="relative mb-3">
              <label htmlFor="notes" className="block text-sm text-gray-600 mb-1.5">{t('ملاحظات على الطلب (اختياري)')}</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                placeholder={t('مثال: التوصيل بعد الساعة 5 مساءً')}
                className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-md shadow-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>
          </section>

          {/* Shipping Method Section */}
          <section>
            <h2 className="text-lg font-semibold mb-3">{t('طريقة الشحن')}</h2>
            <div className="w-full px-4 py-3 bg-blue-50 border border-blue-500 rounded-md flex justify-between items-center text-sm font-medium">
              <span>{`${t('توصيل')} (${settings.deliveryTimeText})`}</span>

              <span className="font-bold">
                {isFreeShipping ? t('شحن مجاني') : formatPrice(shippingFee)}
              </span>
            </div>
          </section>

          {/* Payment Method Section */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">{t('طريقة الدفع')}</h2>
            <div className="border border-gray-300 rounded-md overflow-hidden bg-white">
              <div className="flex items-start gap-3 p-4 bg-blue-50/50">
                <MessageCircle className="w-5 h-5 text-[#25D366] shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{t('الدفع عند الاستلام — التأكيد عبر واتساب')}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {t('عند النقر على "إرسال الطلب على واتساب"، سيتم فتح واتساب برسالة تحتوي كل تفاصيل طلبك جاهزة للإرسال.')}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Order Summary */}
          <section>
            <h2 className="text-lg font-semibold mb-3">{t('ملخص الطلب')}</h2>
            <div className="border border-gray-200 rounded-md divide-y divide-gray-100">
              {items.map(item => (
                <div key={item.id} className="flex justify-between items-center gap-3 px-4 py-3 text-sm">
                  <span className="truncate">{item.name} × {item.quantity}</span>
                  <span className="font-medium shrink-0">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
              <div className="flex justify-between px-4 py-3 text-sm text-gray-600">
                <span>{t('المجموع الفرعي')}</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between px-4 py-3 text-sm text-gray-600">
                <span>{t('الشحن')}</span>
                <span>{isFreeShipping ? t('شحن مجاني') : formatPrice(shippingFee)}</span>
              </div>
            </div>
          </section>

          {/* Submit */}
          <div className="pt-6 mt-6 border-t border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <span className="text-lg font-medium">{t('الإجمالي')}</span>
              <span className="text-2xl font-bold">{formatPrice(finalTotal)}</span>

            </div>

            <button
              type="submit"
              disabled={loading || !isFormValid}
              className={`w-full py-4 text-white rounded-md font-semibold transition-all flex items-center justify-center gap-2 ${(!loading && isFormValid) ? 'bg-[#25D366] hover:bg-[#1eb355]' : 'bg-gray-300 cursor-not-allowed'}`}
            >
              <MessageCircle className="w-5 h-5" />
              {loading ? t('جاري المعالجة...') : t('إرسال الطلب على واتساب')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
