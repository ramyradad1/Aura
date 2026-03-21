import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Save, Settings2 } from 'lucide-react';

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
        if (snap.exists()) setSettings({ ...settings, ...snap.data() });
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

  const Toggle = ({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) => (
    <div className="flex items-center justify-between py-3">
      <span className="text-sm text-slate-300">{label}</span>
      <button onClick={() => onChange(!checked)} aria-label={label} className={`w-11 h-6 rounded-full transition-colors relative ${checked ? 'bg-indigo-600' : 'bg-slate-600'}`}>
        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${checked ? 'right-1' : 'right-6'}`} />
      </button>
    </div>
  );

  const InputField = ({ label, value, onChange, dir }: { label: string; value: string; onChange: (v: string) => void; dir?: string }) => (
    <div>
      <label className="block text-xs text-slate-400 mb-1.5">{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} dir={dir} placeholder={label}
        className="w-full p-3 bg-[#0f172a] border border-white/5 rounded-xl text-white focus:border-indigo-500/50 outline-none text-sm" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-white flex items-center gap-2"><Settings2 className="w-5 h-5 text-slate-400" /> الإعدادات</h3>
        <button onClick={handleSave} disabled={saving}
          className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2 text-sm font-medium disabled:opacity-50">
          <Save className="w-4 h-4" /> {saved ? 'تم الحفظ ✓' : saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
        </button>
      </div>

      {/* Identity & Contact */}
      <div className="bg-[#1e293b] rounded-2xl p-6 border border-white/5">
        <h4 className="text-white font-bold mb-4">الهوية والتواصل</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="اسم المتجر" value={settings.storeName} onChange={v => setSettings({...settings, storeName: v})} />
          <InputField label="البريد الإلكتروني" value={settings.supportEmail} onChange={v => setSettings({...settings, supportEmail: v})} dir="ltr" />
          <InputField label="رقم الهاتف" value={settings.supportPhone} onChange={v => setSettings({...settings, supportPhone: v})} dir="ltr" />
          <InputField label="Instagram" value={settings.socialLinks?.instagram || ''} onChange={v => setSettings({...settings, socialLinks: {...settings.socialLinks, instagram: v}})} dir="ltr" />
          <InputField label="Facebook" value={settings.socialLinks?.facebook || ''} onChange={v => setSettings({...settings, socialLinks: {...settings.socialLinks, facebook: v}})} dir="ltr" />
          <InputField label="TikTok" value={settings.socialLinks?.tiktok || ''} onChange={v => setSettings({...settings, socialLinks: {...settings.socialLinks, tiktok: v}})} dir="ltr" />
        </div>
      </div>

      {/* Business Settings */}
      <div className="bg-[#1e293b] rounded-2xl p-6 border border-white/5">
        <h4 className="text-white font-bold mb-4">إعدادات الأعمال</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="العملة" value={settings.currency} onChange={v => setSettings({...settings, currency: v})} dir="ltr" />
          <InputField label="حد المخزون المنخفض" value={String(settings.lowStockThreshold)} onChange={v => setSettings({...settings, lowStockThreshold: Number(v) || 0})} />
        </div>
        <div className="mt-4 border-t border-white/5 pt-4">
          <Toggle label="السماح بالدفع كزائر (Guest Checkout)" checked={settings.guestCheckout} onChange={v => setSettings({...settings, guestCheckout: v})} />
          <Toggle label="الاستلام من المتجر (Store Pickup)" checked={settings.storePickup} onChange={v => setSettings({...settings, storePickup: v})} />
        </div>
      </div>

      {/* Feature Toggles */}
      <div className="bg-[#1e293b] rounded-2xl p-6 border border-white/5">
        <h4 className="text-white font-bold mb-4">تفعيل الميزات</h4>
        <Toggle label="شوهد مؤخراً (Recently Viewed)" checked={settings.features?.recentlyViewed ?? true} onChange={v => setSettings({...settings, features: {...settings.features, recentlyViewed: v}})} />
        <Toggle label="منتجات ذات صلة (Related Products)" checked={settings.features?.relatedProducts ?? true} onChange={v => setSettings({...settings, features: {...settings.features, relatedProducts: v}})} />
        <Toggle label="قائمة الأمنيات (Wishlist)" checked={settings.features?.wishlist ?? true} onChange={v => setSettings({...settings, features: {...settings.features, wishlist: v}})} />
        <Toggle label="التقييمات (Reviews)" checked={settings.features?.reviews ?? true} onChange={v => setSettings({...settings, features: {...settings.features, reviews: v}})} />
        <Toggle label="إشعار عند التوفر (Back in Stock)" checked={settings.features?.backInStock ?? true} onChange={v => setSettings({...settings, features: {...settings.features, backInStock: v}})} />
      </div>

      {/* Notifications */}
      <div className="bg-[#1e293b] rounded-2xl p-6 border border-white/5">
        <h4 className="text-white font-bold mb-4">الإشعارات</h4>
        <Toggle label="إيميل عند استلام طلب جديد" checked={settings.notifications?.emailOnOrder ?? true} onChange={v => setSettings({...settings, notifications: {...settings.notifications, emailOnOrder: v}})} />
        <Toggle label="إيميل عند شحن الطلب" checked={settings.notifications?.emailOnShip ?? true} onChange={v => setSettings({...settings, notifications: {...settings.notifications, emailOnShip: v}})} />
        <Toggle label="إشعارات Push" checked={settings.notifications?.pushNotifications ?? false} onChange={v => setSettings({...settings, notifications: {...settings.notifications, pushNotifications: v}})} />
      </div>
    </div>
  );
}
