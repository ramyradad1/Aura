import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { MessageCircle, Save, Settings2, Truck } from 'lucide-react';
import { useStoreSettings } from '../../context/StoreSettingsContext';
import { sanitizeWhatsAppNumber, StoreSettings } from '../../config/store';

/**
 * Defined at module scope on purpose: declaring these inside AdminSettings would
 * remount the input on every keystroke and drop focus.
 */
function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-sm text-slate-300">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        aria-label={label}
        aria-pressed={checked}
        className={`w-11 h-6 rounded-full transition-colors relative ${checked ? 'bg-indigo-600' : 'bg-slate-600'}`}
      >
        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${checked ? 'right-1' : 'right-6'}`} />
      </button>
    </div>
  );
}

function InputField({
  label, value, onChange, dir, hint, type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  dir?: string;
  hint?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-xs text-slate-400 mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        dir={dir}
        placeholder={label}
        className="w-full p-3 bg-[#0f172a] border border-white/5 rounded-xl text-white focus:border-indigo-500/50 outline-none text-sm"
      />
      {hint && <p className="text-[11px] text-slate-500 mt-1.5">{hint}</p>}
    </div>
  );
}

/**
 * Live commercial settings (`settings/store`): WhatsApp number, currency and
 * shipping. Saving here changes the storefront immediately, no redeploy needed.
 */
function StoreCommercialSettings() {
  const { settings, isLoaded, saveSettings } = useStoreSettings();
  const [draft, setDraft] = useState<StoreSettings>(settings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Sync once the first Firestore snapshot lands, without clobbering edits.
  useEffect(() => {
    if (isLoaded) setDraft(settings);
  }, [isLoaded, settings]);

  const set = <K extends keyof StoreSettings>(key: K, value: StoreSettings[K]) =>
    setDraft(prev => ({ ...prev, [key]: value }));

  const waDigits = sanitizeWhatsAppNumber(draft.whatsappNumber);
  const waValid = waDigits.length >= 10;

  const handleSave = async () => {
    if (!waValid) {
      setError('رقم الواتساب غير صالح. اكتبه بالصيغة الدولية بدون + مثل 201030769960');
      return;
    }
    setError('');
    setSaving(true);
    try {
      await saveSettings({
        whatsappNumber: waDigits,
        storeName: draft.storeName,
        storeUrl: draft.storeUrl,
        currency: draft.currency,
        shippingFee: Number(draft.shippingFee) || 0,
        freeShippingThreshold: Number(draft.freeShippingThreshold) || 0,
        onlinePaymentEnabled: draft.onlinePaymentEnabled,
        whatsappGreeting: draft.whatsappGreeting,
        deliveryTimeText: draft.deliveryTimeText,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error(e);
      setError('فشل الحفظ. تأكد أن حسابك أدمن وأن الاتصال بالإنترنت يعمل.');
    }
    setSaving(false);
  };

  return (
    <div className="bg-[#1e293b] rounded-2xl p-6 border border-white/5">
      <div className="flex flex-wrap gap-3 justify-between items-center mb-1">
        <h4 className="text-white font-bold flex items-center gap-2">
          <Truck className="w-4 h-4 text-emerald-400" /> الإعدادات التجارية (تظهر فوراً في المتجر)
        </h4>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-2 text-sm font-medium disabled:opacity-50"
        >
          <Save className="w-4 h-4" /> {saved ? 'تم الحفظ ✓' : saving ? 'جاري الحفظ...' : 'حفظ'}
        </button>
      </div>
      <p className="text-xs text-slate-500 mb-5">
        رقم الواتساب هنا هو اللي بيستقبل الطلبات من صفحة الدفع وزر الدعم العائم.
      </p>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="رقم واتساب الطلبات"
          value={draft.whatsappNumber}
          onChange={v => set('whatsappNumber', v)}
          dir="ltr"
          hint={`بالصيغة الدولية بدون +. مثال: 201030769960 — سيتم الإرسال إلى wa.me/${waDigits || '...'}`}
        />
        <InputField label="اسم المتجر" value={draft.storeName} onChange={v => set('storeName', v)} />
        <InputField label="رابط المتجر" value={draft.storeUrl} onChange={v => set('storeUrl', v)} dir="ltr" />
        <InputField
          label="العملة"
          value={draft.currency}
          onChange={v => set('currency', v)}
          hint="تظهر بجانب الأسعار، مثال: ج.م"
        />
        <InputField
          label="مصاريف الشحن"
          type="number"
          value={String(draft.shippingFee)}
          onChange={v => set('shippingFee', Number(v) || 0)}
          dir="ltr"
        />
        <InputField
          label="حد الشحن المجاني"
          type="number"
          value={String(draft.freeShippingThreshold)}
          onChange={v => set('freeShippingThreshold', Number(v) || 0)}
          dir="ltr"
          hint="الطلبات من هذا المبلغ وأعلى شحنها مجاني. اكتب 0 لتعطيل الميزة."
        />
        <InputField
          label="مدة التوصيل"
          value={draft.deliveryTimeText}
          onChange={v => set('deliveryTimeText', v)}
          hint="تظهر في صفحة الدفع، مثال: 2-5 أيام عمل"
        />
        <InputField
          label="رسالة الترحيب على واتساب"
          value={draft.whatsappGreeting}
          onChange={v => set('whatsappGreeting', v)}
          hint="الرسالة الجاهزة عند الضغط على زر الدعم العائم."
        />
      </div>

      <div className="mt-4 border-t border-white/5 pt-2">
        <Toggle
          label="تفعيل الدفع الإلكتروني (لو مقفول، كل الطلبات تمر عبر واتساب)"
          checked={draft.onlinePaymentEnabled}
          onChange={v => set('onlinePaymentEnabled', v)}
        />
      </div>

      <div className="mt-4 p-3 rounded-xl bg-[#0f172a] border border-white/5 flex items-start gap-2">
        <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <p className="text-xs text-slate-400">
          للتجربة:{' '}
          <a
            href={`https://wa.me/${waDigits}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 hover:underline"
            dir="ltr"
          >
            wa.me/{waDigits || '—'}
          </a>
        </p>
      </div>
    </div>
  );
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<any>({
    storeName: 'Aura Perfumes', supportEmail: '', supportPhone: '', socialLinks: { instagram: '', facebook: '', tiktok: '' },
    currency: 'EGP', lowStockThreshold: 5, guestCheckout: true, storePickup: false,
    features: { recentlyViewed: true, relatedProducts: true, wishlist: true, reviews: true, backInStock: true },
    notifications: { emailOnOrder: true, emailOnShip: true, pushNotifications: false },
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'general'));
        if (snap.exists()) setSettings((prev: any) => ({ ...prev, ...snap.data() }));
      } catch (e) { console.error(e); }
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'general'), { ...settings, updatedAt: new Date().toISOString() }, { merge: true });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-white flex items-center gap-2"><Settings2 className="w-5 h-5 text-slate-400" /> الإعدادات</h3>
        <button onClick={handleSave} disabled={saving}
          className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2 text-sm font-medium disabled:opacity-50">
          <Save className="w-4 h-4" /> {saved ? 'تم الحفظ ✓' : saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
        </button>
      </div>

      {/* Live storefront settings, saved separately in settings/store */}
      <StoreCommercialSettings />

      {/* Identity & Contact */}
      <div className="bg-[#1e293b] rounded-2xl p-6 border border-white/5">
        <h4 className="text-white font-bold mb-4">الهوية والتواصل</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="اسم المتجر" value={settings.storeName} onChange={v => setSettings({ ...settings, storeName: v })} />
          <InputField label="البريد الإلكتروني" value={settings.supportEmail} onChange={v => setSettings({ ...settings, supportEmail: v })} dir="ltr" />
          <InputField label="رقم الهاتف" value={settings.supportPhone} onChange={v => setSettings({ ...settings, supportPhone: v })} dir="ltr" />
          <InputField label="Instagram" value={settings.socialLinks?.instagram || ''} onChange={v => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, instagram: v } })} dir="ltr" />
          <InputField label="Facebook" value={settings.socialLinks?.facebook || ''} onChange={v => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, facebook: v } })} dir="ltr" />
          <InputField label="TikTok" value={settings.socialLinks?.tiktok || ''} onChange={v => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, tiktok: v } })} dir="ltr" />
        </div>
      </div>

      {/* Business Settings */}
      <div className="bg-[#1e293b] rounded-2xl p-6 border border-white/5">
        <h4 className="text-white font-bold mb-4">إعدادات الأعمال</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="حد المخزون المنخفض" value={String(settings.lowStockThreshold)} onChange={v => setSettings({ ...settings, lowStockThreshold: Number(v) || 0 })} />
        </div>
        <div className="mt-4 border-t border-white/5 pt-4">
          <Toggle label="السماح بالدفع كزائر (Guest Checkout)" checked={settings.guestCheckout} onChange={v => setSettings({ ...settings, guestCheckout: v })} />
          <Toggle label="الاستلام من المتجر (Store Pickup)" checked={settings.storePickup} onChange={v => setSettings({ ...settings, storePickup: v })} />
        </div>
      </div>

      {/* Feature Toggles */}
      <div className="bg-[#1e293b] rounded-2xl p-6 border border-white/5">
        <h4 className="text-white font-bold mb-4">تفعيل الميزات</h4>
        <Toggle label="شوهد مؤخراً (Recently Viewed)" checked={settings.features?.recentlyViewed ?? true} onChange={v => setSettings({ ...settings, features: { ...settings.features, recentlyViewed: v } })} />
        <Toggle label="منتجات ذات صلة (Related Products)" checked={settings.features?.relatedProducts ?? true} onChange={v => setSettings({ ...settings, features: { ...settings.features, relatedProducts: v } })} />
        <Toggle label="قائمة الأمنيات (Wishlist)" checked={settings.features?.wishlist ?? true} onChange={v => setSettings({ ...settings, features: { ...settings.features, wishlist: v } })} />
        <Toggle label="التقييمات (Reviews)" checked={settings.features?.reviews ?? true} onChange={v => setSettings({ ...settings, features: { ...settings.features, reviews: v } })} />
        <Toggle label="إشعار عند التوفر (Back in Stock)" checked={settings.features?.backInStock ?? true} onChange={v => setSettings({ ...settings, features: { ...settings.features, backInStock: v } })} />
      </div>

      {/* Notifications */}
      <div className="bg-[#1e293b] rounded-2xl p-6 border border-white/5">
        <h4 className="text-white font-bold mb-4">الإشعارات</h4>
        <Toggle label="إيميل عند استلام طلب جديد" checked={settings.notifications?.emailOnOrder ?? true} onChange={v => setSettings({ ...settings, notifications: { ...settings.notifications, emailOnOrder: v } })} />
        <Toggle label="إيميل عند شحن الطلب" checked={settings.notifications?.emailOnShip ?? true} onChange={v => setSettings({ ...settings, notifications: { ...settings.notifications, emailOnShip: v } })} />
        <Toggle label="إشعارات Push" checked={settings.notifications?.pushNotifications ?? false} onChange={v => setSettings({ ...settings, notifications: { ...settings.notifications, pushNotifications: v } })} />
      </div>
    </div>
  );
}
