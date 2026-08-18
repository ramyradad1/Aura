import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/TranslationContext';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { CheckCircle, HelpCircle, MessageCircle, ShieldCheck, Ticket, Check, X, Loader2 } from 'lucide-react';
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

// Helper to convert Arabic-Indic numerals (٠-٩) to standard digits (0-9)
function normalizeNumerals(str: string): string {
  return str.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
}

// Clean phone input and format to standard 11-digit Egyptian mobile (01xxxxxxxxx)
function sanitizePhone(raw: string): string {
  const normalized = normalizeNumerals(raw).replace(/[\s\-\(\)\+]/g, '');
  if (normalized.startsWith('201') && normalized.length === 12) {
    return '0' + normalized.slice(2);
  }
  if (normalized.startsWith('00201') && normalized.length === 14) {
    return '0' + normalized.slice(4);
  }
  return normalized;
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

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
    type: 'percentage' | 'fixed';
    amount: number;
  } | null>(null);

  // Discount calculation
  const discountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.type === 'percentage') {
      return (total * appliedCoupon.discount) / 100;
    }
    return Math.min(total, appliedCoupon.discount);
  }, [appliedCoupon, total]);

  // Shipping honours the free-shipping threshold configured in the admin panel.
  const discountedSubtotal = Math.max(0, total - discountAmount);
  const shippingFee = getShippingFee(discountedSubtotal, items.length);
  const finalTotal = discountedSubtotal + shippingFee;
  const isFreeShipping = shippingFee === 0 && items.length > 0;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = couponInput.trim().toUpperCase();
    if (!cleanCode) return;

    setCouponLoading(true);
    setCouponError(null);

    try {
      const q = query(collection(db, 'coupons'), where('code', '==', cleanCode));
      const snap = await getDocs(q);

      if (snap.empty) {
        setCouponError('كود الكوبون غير صحيح أو غير موجود');
        setCouponLoading(false);
        return;
      }

      const couponDoc = snap.docs[0].data() as any;

      if (couponDoc.status !== 'active') {
        setCouponError('هذا الكوبون معطل حالياً');
        setCouponLoading(false);
        return;
      }

      if (couponDoc.validUntil && new Date(couponDoc.validUntil) < new Date()) {
        setCouponError('هذا الكوبون منتهي الصلاحية');
        setCouponLoading(false);
        return;
      }

      if (couponDoc.minOrderAmount && total < couponDoc.minOrderAmount) {
        setCouponError(`الحد الأدنى لتطبيق هذا الكوبون هو ${formatPrice(couponDoc.minOrderAmount)}`);
        setCouponLoading(false);
        return;
      }

      const discountVal = Number(couponDoc.discount) || 0;
      const type = couponDoc.type || 'percentage';
      const calcAmount = type === 'percentage' ? (total * discountVal) / 100 : discountVal;

      setAppliedCoupon({
        code: cleanCode,
        discount: discountVal,
        type,
        amount: calcAmount,
      });
      setCouponInput('');
    } catch (err: any) {
      console.error('Error applying coupon:', err);
      setCouponError('تعذر تطبيق الكوبون: ' + (err?.message || 'خطأ في الاتصال'));
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
  };

  const validateName = (name: string) => name.trim().length >= 2;
  const validatePhone = (phone: string) => {
    const s = sanitizePhone(phone);
    return /^01[0125]\d{8}$/.test(s);
  };

  const errors = {
    firstName: validateName(formData.firstName) ? '' : t('الاسم الأول مطلوب (حرفين على الأقل)'),
    lastName: validateName(formData.lastName) ? '' : t('اسم العائلة مطلوب (حرفين على الأقل)'),
    address: formData.address.trim().length >= 5 ? '' : t('العنوان بالتفصيل مطلوب'),
    city: validateName(formData.city) ? '' : t('اسم المدينة مطلوب'),
    phone: validatePhone(formData.phone) ? '' : t('رقم الهاتف غير صحيح (مثال: 01012345678)'),
    altPhone: !formData.altPhone || validatePhone(formData.altPhone) ? '' : t('الرقم الاحتياطي غير صحيح'),
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
    const allTouched = Object.keys(formData).reduce((acc, k) => ({ ...acc, [k]: true }), {});
    setTouched(allTouched);

    if (!isFormValid) {
      const firstInvalidKey = Object.keys(errors).find(k => (errors as any)[k] !== '');
      if (firstInvalidKey) {
        const el = document.getElementById(firstInvalidKey);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      setError(t('برجاء استكمال جميع الحقول المطلوبة بشكل صحيح'));
      return;
    }

    setError('');
    setLoading(true);

    const sanitizedPhone = sanitizePhone(formData.phone);
    const sanitizedAltPhone = formData.altPhone ? sanitizePhone(formData.altPhone) : undefined;
    const orderNumber = generateOrderNumber();

    const payload: WhatsAppOrderPayload = {
      orderNumber,
      items: items.map(i => ({
        name: i.name,
        quantity: i.quantity,
        price: i.price,
        size: i.size || (i as any).selectedSize || undefined,
      })),
      subtotal: total,
      discount: discountAmount > 0 ? discountAmount : undefined,
      couponCode: appliedCoupon ? appliedCoupon.code : undefined,
      shippingFee,
      total: finalTotal,
      customer: {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: sanitizedPhone,
        altPhone: sanitizedAltPhone,
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

    // Save order in Firestore in background
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
        items: items.map(i => ({
          perfumeId: i.id,
          quantity: i.quantity,
          name: i.name,
          price: i.price,
          size: i.size || (i as any).selectedSize || '',
        })),
        totalAmount: finalTotal,
        subtotal: total,
        discount: discountAmount,
        couponCode: appliedCoupon?.code || null,
        shippingFee,
        status: 'pending',
        paymentMethod: 'whatsapp',
        paymentStatus: 'pending',
        customerName: `${formData.firstName} ${formData.lastName}`.trim(),
        customerPhone: sanitizedPhone,
        shippingAddress: `الاسم: ${formData.firstName} ${formData.lastName}، الهاتف: ${sanitizedPhone}، العنوان: ${formattedAddress}`,
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

    // Open WhatsApp deep link
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = link;
    } else {
      window.open(link, '_blank', 'noopener,noreferrer');
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
              className="px-8 py-3 bg-[#25D366] text-white font-bold rounded-xl hover:opacity-90 transition-opacity uppercase tracking-widest text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              {t('إرسال الطلب على واتساب')}
            </a>
          )}
          <button
            onClick={() => navigate('/')}
            className="px-8 py-3 bg-primary text-white font-bold rounded-xl hover:opacity-90 transition-opacity uppercase tracking-widest text-xs shadow-lg shadow-primary/20 cursor-pointer"
          >
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
        <h1 className="text-3xl font-serif text-primary mb-8 font-bold text-center">{t('إتمام الطلب')}</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleCheckout} className="space-y-8" noValidate>
          {/* Delivery Address Section */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-primary">{t('عنوان التوصيل')}</h2>

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

            <Field name="address" label={t('العنوان بالتفصيل (الشارع / العمارة)')} value={formData.address} onChange={handleChange} onBlur={handleBlur} error={err('address')} isRTL={isRTL} autoComplete="street-address" required />
            <Field name="apartment" label={t('شقة، دور، إلخ (اختياري)')} value={formData.apartment} onChange={handleChange} onBlur={handleBlur} isRTL={isRTL} />
            <Field name="landmark" label={t('علامة مميزة قريبة (اختياري)')} value={formData.landmark} onChange={handleChange} onBlur={handleBlur} isRTL={isRTL} />

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Field name="city" label={t('المدينة / المنطقة')} value={formData.city} onChange={handleChange} onBlur={handleBlur} error={err('city')} isRTL={isRTL} autoComplete="address-level2" required />
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
                <Field name="phone" label={t('رقم الهاتف الأساسي')} type="tel" value={formData.phone} onChange={handleChange} onBlur={handleBlur} error={err('phone')} isRTL={isRTL} dir="ltr" autoComplete="tel" infoIcon required />
              </div>
              <div className="flex-1">
                <Field name="altPhone" label={t('رقم هاتف إضافي (اختياري)')} type="tel" value={formData.altPhone} onChange={handleChange} onBlur={handleBlur} error={err('altPhone')} isRTL={isRTL} dir="ltr" />
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
                rows={2}
                placeholder={t('مثال: يرجى الاتصال قبل التوصيل بنصف ساعة')}
                className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-md shadow-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
              />
            </div>
          </section>

          {/* Coupon Code Section */}
          <section className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h2 className="text-sm font-bold text-primary flex items-center gap-2 mb-2">
              <Ticket className="w-4 h-4 text-amber-500" />
              {t('كوبون الخصم')}
            </h2>

            {appliedCoupon ? (
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-bold font-mono text-emerald-800">{appliedCoupon.code}</span>
                  <span className="text-xs text-emerald-600">
                    (خصم {appliedCoupon.type === 'percentage' ? `${appliedCoupon.discount}%` : formatPrice(appliedCoupon.discount)})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="text-xs text-red-500 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" /> حذف الكوبون
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={e => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="ادخل كود الخصم (مثال: AURA10)"
                    dir="ltr"
                    className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm uppercase font-mono font-bold outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponInput.trim()}
                    className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:opacity-90 disabled:opacity-50 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    {couponLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    تطبيق
                  </button>
                </div>
                {couponError && (
                  <p className="text-xs text-red-500 mt-1">{couponError}</p>
                )}
              </div>
            )}
          </section>

          {/* Shipping Method Section */}
          <section>
            <h2 className="text-lg font-semibold mb-3 text-primary">{t('طريقة الشحن')}</h2>
            <div className="w-full px-4 py-3 bg-blue-50/70 border border-blue-500 rounded-xl flex justify-between items-center text-sm font-medium">
              <span>{`${t('توصيل')} (${settings.deliveryTimeText})`}</span>
              <span className="font-bold text-primary">
                {isFreeShipping ? t('شحن مجاني') : formatPrice(shippingFee)}
              </span>
            </div>
          </section>

          {/* Payment Method Section */}
          <section>
            <h2 className="text-lg font-semibold mb-3 text-primary">{t('طريقة الدفع')}</h2>
            <div className="border border-gray-300 rounded-xl overflow-hidden bg-white">
              <div className="flex items-start gap-3 p-4 bg-blue-50/50">
                <MessageCircle className="w-5 h-5 text-[#25D366] shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-primary">{t('الدفع عند الاستلام — التأكيد عبر واتساب')}</p>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    {t('عند النقر على "إرسال الطلب على واتساب"، سيتم فتح واتساب برسالة تحتوي تفاصيل طلبك كاملة مع الأحجام والأسعار لتأكيد الشحن فوراً.')}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Order Summary */}
          <section>
            <h2 className="text-lg font-semibold mb-3 text-primary">{t('ملخص الطلب')}</h2>
            <div className="border border-gray-200 rounded-xl divide-y divide-gray-100 overflow-hidden">
              {items.map(item => (
                <div key={item.cartItemId || item.id} className="flex justify-between items-center gap-3 px-4 py-3 text-sm">
                  <div className="min-w-0">
                    <span className="font-medium text-slate-800">{item.name}</span>
                    {item.size && (
                      <span className="mr-2 text-xs text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded">
                        {item.size}
                      </span>
                    )}
                    <span className="text-xs text-slate-400 mr-1">× {item.quantity}</span>
                  </div>
                  <span className="font-bold font-mono text-slate-800 shrink-0">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
              
              <div className="flex justify-between px-4 py-3 text-sm text-gray-600 bg-slate-50/50">
                <span>{t('المجموع الفرعي')}</span>
                <span className="font-mono">{formatPrice(total)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between px-4 py-3 text-sm text-emerald-600 font-semibold bg-emerald-50/40">
                  <span>خصم الكوبون {appliedCoupon?.code ? `(${appliedCoupon.code})` : ''}</span>
                  <span className="font-mono">-{formatPrice(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between px-4 py-3 text-sm text-gray-600 bg-slate-50/50">
                <span>{t('الشحن')}</span>
                <span className="font-mono">{isFreeShipping ? t('شحن مجاني') : formatPrice(shippingFee)}</span>
              </div>
            </div>
          </section>

          {/* Submit */}
          <div className="pt-6 mt-6 border-t border-gray-200">
            <div className="flex justify-between items-baseline mb-6">
              <span className="text-lg font-bold text-primary">{t('الإجمالي النهائي')}</span>
              <span className="text-3xl font-bold text-primary font-mono">{formatPrice(finalTotal)}</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#25D366] hover:bg-[#1eb355] text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed text-base cursor-pointer"
            >
              <MessageCircle className="w-5 h-5" />
              {loading ? t('جاري المعالجة...') : t('إرسال الطلب على واتساب')}
            </button>

            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>معاينة مجانية للمنتج عند الاستلام قبل الدفع</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
