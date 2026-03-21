import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Save, Globe, Sparkles, MapPin, Search, Code, MessageSquareText } from 'lucide-react';
import { generateSEOMetadata, generateGEOData } from '../../utils/geminiUtils';

export default function AdminSEO() {
  const [mainTab, setMainTab] = useState<'seo' | 'geo'>('seo');
  const [subTab, setSubTab] = useState('global');
  const [data, setData] = useState<any>({
    global: { titleEn: '', titleAr: '', descEn: '', descAr: '', keywordsEn: '', keywordsAr: '', ogImage: '', googleConsole: '', bingWebmaster: '', gaId: '', fbPixel: '', tiktokPixel: '' },
    home: { titleEn: '', titleAr: '', descEn: '', descAr: '', keywordsEn: '', keywordsAr: '' },
    shop: { titleEn: '', titleAr: '', descEn: '', descAr: '', keywordsEn: '', keywordsAr: '' },
  });
  const [geo, setGeo] = useState<any>({
    businessNameEn: '', businessNameAr: '', businessDescEn: '', businessDescAr: '',
    googleCategory: '', serviceAreas: '', schemaJsonLd: '',
    localKeywordsAr: '', localKeywordsEn: '',
    geoDescEn: '', geoDescAr: '', faqJson: '', citations: '',
    phone: '', email: '', address: '', city: '', mapUrl: ''
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const seoSnap = await getDoc(doc(db, 'settings', 'seo'));
        if (seoSnap.exists()) setData((prev: any) => ({ ...prev, ...seoSnap.data() }));
        const geoSnap = await getDoc(doc(db, 'settings', 'geo'));
        if (geoSnap.exists()) setGeo((prev: any) => ({ ...prev, ...geoSnap.data() }));
      } catch (e) { console.error(e); }
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'seo'), { ...data, updatedAt: new Date().toISOString() }, { merge: true });
      await setDoc(doc(db, 'settings', 'geo'), { ...geo, updatedAt: new Date().toISOString() }, { merge: true });
      setSaved(true); setTimeout(() => setSaved(false), 2000);
    } catch (e: any) {
      console.error(e);
      alert("حدث خطأ أثناء الحفظ (ربما بسبب صلاحيات قاعدة البيانات): " + (e.message || ""));
    }
    setSaving(false);
  };

  const update = (section: string, key: string, value: string) => {
    setData({ ...data, [section]: { ...data[section], [key]: value } });
  };

  const updateGeo = (key: string, value: string) => {
    setGeo({ ...geo, [key]: value });
  };

  const handleAISEO = async () => {
    setGenerating(true);
    try {
      const res = await generateSEOMetadata(subTab, data[subTab] || {});
      setData((prev: any) => ({
        ...prev,
        [subTab]: {
          ...prev[subTab],
          titleEn: res.titleEn || prev[subTab]?.titleEn || '',
          titleAr: res.titleAr || prev[subTab]?.titleAr || '',
          descEn: res.descEn || prev[subTab]?.descEn || '',
          descAr: res.descAr || prev[subTab]?.descAr || '',
          keywordsEn: res.keywordsEn || prev[subTab]?.keywordsEn || '',
          keywordsAr: res.keywordsAr || prev[subTab]?.keywordsAr || '',
        }
      }));
    } catch (e) {
      console.error(e);
      alert("حدث خطأ أثناء التوليد بالذكاء الاصطناعي");
    }
    setGenerating(false);
  };

  const handleAIGEO = async () => {
    setGenerating(true);
    try {
      const res = await generateGEOData(geo);
      setGeo((prev: any) => ({
        ...prev,
        businessNameEn: res.businessNameEn || prev.businessNameEn,
        businessNameAr: res.businessNameAr || prev.businessNameAr,
        businessDescEn: res.businessDescEn || prev.businessDescEn,
        businessDescAr: res.businessDescAr || prev.businessDescAr,
        googleCategory: res.googleCategory || prev.googleCategory,
        serviceAreas: res.serviceAreas || prev.serviceAreas,
        schemaJsonLd: res.schemaJsonLd || prev.schemaJsonLd,
        localKeywordsAr: res.localKeywordsAr || prev.localKeywordsAr,
        localKeywordsEn: res.localKeywordsEn || prev.localKeywordsEn,
        geoDescEn: res.geoDescEn || prev.geoDescEn,
        geoDescAr: res.geoDescAr || prev.geoDescAr,
        faqJson: res.faqJson || prev.faqJson,
        citations: res.citations || prev.citations,
      }));
    } catch (e: any) {
      console.error(e);
      alert("حدث خطأ أثناء التوليد بالذكاء الاصطناعي: " + (e.message || ""));
    }
    setGenerating(false);
  };

  const Field = ({ label, value, onChange, dir }: { label: string; value: string; onChange: (v: string) => void; dir?: string }) => (
    <div>
      <label className="block text-xs text-slate-400 mb-1.5">{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} dir={dir} placeholder={label}
        className="w-full p-3 bg-[#0f172a] border border-white/5 rounded-xl text-white focus:border-indigo-500/50 outline-none text-sm" />
    </div>
  );

  const TextArea = ({ label, value, onChange, rows, dir, mono }: { label: string; value: string; onChange: (v: string) => void; rows?: number; dir?: string; mono?: boolean }) => (
    <div>
      <label className="block text-xs text-slate-400 mb-1.5">{label}</label>
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={label} dir={dir}
        className={`w-full p-3 bg-[#0f172a] border border-white/5 rounded-xl text-white focus:border-indigo-500/50 outline-none text-sm resize-none ${mono ? 'font-mono text-xs leading-relaxed' : ''}`}
        rows={rows || 3} />
    </div>
  );

  const currentData = data[subTab] || {};

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-white flex items-center gap-2"><Globe className="w-5 h-5 text-blue-400" /> SEO & GEO</h3>
        <button onClick={handleSave} disabled={saving}
          className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2 text-sm font-medium disabled:opacity-50">
          <Save className="w-4 h-4" /> {saved ? 'تم الحفظ ✓' : 'حفظ الكل'}
        </button>
      </div>

      {/* Main Tabs: SEO vs GEO */}
      <div className="flex gap-2">
        <button onClick={() => setMainTab('seo')}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 ${mainTab === 'seo' ? 'bg-blue-600 text-white' : 'bg-[#1e293b] text-slate-400 hover:text-white border border-white/5'}`}>
          <Search className="w-4 h-4" /> SEO
        </button>
        <button onClick={() => setMainTab('geo')}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 ${mainTab === 'geo' ? 'bg-emerald-600 text-white' : 'bg-[#1e293b] text-slate-400 hover:text-white border border-white/5'}`}>
          <MapPin className="w-4 h-4" /> GEO
        </button>
      </div>

      {/* ===== SEO Section ===== */}
      {mainTab === 'seo' && (
        <>
          <div className="flex gap-2">
            {[{ id: 'global', label: 'إعدادات عامة' }, { id: 'home', label: 'الصفحة الرئيسية' }, { id: 'shop', label: 'صفحة المتجر' }].map(t => (
              <button key={t.id} onClick={() => setSubTab(t.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${subTab === t.id ? 'bg-indigo-600 text-white' : 'bg-[#1e293b] text-slate-400 hover:text-white border border-white/5'}`}>
                {t.label}
              </button>
            ))}
          </div>

          <div className="bg-[#1e293b] rounded-2xl p-6 border border-white/5 space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-white font-bold">Meta Tags</h4>
              <button onClick={handleAISEO} disabled={generating}
                className="px-4 py-2 bg-indigo-500/10 text-indigo-400 rounded-lg text-xs font-medium hover:bg-indigo-500/20 border border-indigo-500/20 flex items-center gap-1.5 transition-colors disabled:opacity-50">
                <Sparkles className="w-3.5 h-3.5" />
                {generating ? 'جاري التوليد...' : 'توليد بالذكاء الاصطناعي'}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="العنوان (EN)" value={currentData.titleEn || ''} onChange={v => update(subTab, 'titleEn', v)} dir="ltr" />
              <Field label="العنوان (AR)" value={currentData.titleAr || ''} onChange={v => update(subTab, 'titleAr', v)} />
              <TextArea label="الوصف (EN)" value={currentData.descEn || ''} onChange={v => update(subTab, 'descEn', v)} />
              <TextArea label="الوصف (AR)" value={currentData.descAr || ''} onChange={v => update(subTab, 'descAr', v)} />
              <Field label="الكلمات المفتاحية (EN)" value={currentData.keywordsEn || ''} onChange={v => update(subTab, 'keywordsEn', v)} dir="ltr" />
              <Field label="الكلمات المفتاحية (AR)" value={currentData.keywordsAr || ''} onChange={v => update(subTab, 'keywordsAr', v)} />
            </div>

            {subTab === 'global' && (
              <>
                <h4 className="text-white font-bold pt-4 border-t border-white/5">التتبع والتحليلات</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Google Search Console" value={currentData.googleConsole || ''} onChange={v => update('global', 'googleConsole', v)} dir="ltr" />
                  <Field label="Bing Webmaster" value={currentData.bingWebmaster || ''} onChange={v => update('global', 'bingWebmaster', v)} dir="ltr" />
                  <Field label="Google Analytics ID" value={currentData.gaId || ''} onChange={v => update('global', 'gaId', v)} dir="ltr" />
                  <Field label="Facebook Pixel" value={currentData.fbPixel || ''} onChange={v => update('global', 'fbPixel', v)} dir="ltr" />
                  <Field label="TikTok Pixel" value={currentData.tiktokPixel || ''} onChange={v => update('global', 'tiktokPixel', v)} dir="ltr" />
                  <Field label="OG Image URL" value={currentData.ogImage || ''} onChange={v => update('global', 'ogImage', v)} dir="ltr" />
                </div>
              </>
            )}
          </div>
        </>
      )}

      {/* ===== GEO Section ===== */}
      {mainTab === 'geo' && (
        <div className="space-y-6">
          {/* AI Generate All GEO */}
          <div className="bg-linear-to-r from-emerald-500/10 to-teal-500/10 rounded-2xl p-5 border border-emerald-500/20">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-emerald-400 font-bold flex items-center gap-2 mb-1"><Sparkles className="w-4 h-4" /> توليد GEO بالكامل بالذكاء الاصطناعي</h4>
                <p className="text-xs text-slate-400">Gemini هيولد بيانات النشاط المحلي، Schema، الكلمات المفتاحية المحلية، الأسئلة الشائعة، ووصف GEO محسن لمحركات البحث التوليدية</p>
              </div>
              <button onClick={handleAIGEO} disabled={generating}
                className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-2 text-sm font-bold disabled:opacity-50 shrink-0">
                <Sparkles className="w-4 h-4" />
                {generating ? 'جاري التوليد...' : 'توليد الكل'}
              </button>
            </div>
          </div>

          {/* Local Business Info */}
          <div className="bg-[#1e293b] rounded-2xl p-6 border border-white/5 space-y-5">
            <h4 className="text-white font-bold flex items-center gap-2"><MapPin className="w-4 h-4 text-emerald-400" /> بيانات النشاط المحلي</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="اسم النشاط (EN)" value={geo.businessNameEn || ''} onChange={v => updateGeo('businessNameEn', v)} dir="ltr" />
              <Field label="اسم النشاط (AR)" value={geo.businessNameAr || ''} onChange={v => updateGeo('businessNameAr', v)} />
              <TextArea label="وصف النشاط - Google Maps (EN)" value={geo.businessDescEn || ''} onChange={v => updateGeo('businessDescEn', v)} dir="ltr" />
              <TextArea label="وصف النشاط - Google Maps (AR)" value={geo.businessDescAr || ''} onChange={v => updateGeo('businessDescAr', v)} />
              <Field label="فئة Google Business" value={geo.googleCategory || ''} onChange={v => updateGeo('googleCategory', v)} dir="ltr" />
              <Field label="مناطق الخدمة" value={geo.serviceAreas || ''} onChange={v => updateGeo('serviceAreas', v)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-white/5">
              <Field label="رقم الهاتف" value={geo.phone || ''} onChange={v => updateGeo('phone', v)} dir="ltr" />
              <Field label="البريد الإلكتروني" value={geo.email || ''} onChange={v => updateGeo('email', v)} dir="ltr" />
              <Field label="المدينة" value={geo.city || ''} onChange={v => updateGeo('city', v)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="العنوان الكامل" value={geo.address || ''} onChange={v => updateGeo('address', v)} />
              <Field label="رابط Google Maps" value={geo.mapUrl || ''} onChange={v => updateGeo('mapUrl', v)} dir="ltr" />
            </div>
          </div>

          {/* Local Keywords */}
          <div className="bg-[#1e293b] rounded-2xl p-6 border border-white/5 space-y-5">
            <h4 className="text-white font-bold flex items-center gap-2"><Search className="w-4 h-4 text-blue-400" /> الكلمات المفتاحية المحلية</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextArea label="كلمات محلية (EN)" value={geo.localKeywordsEn || ''} onChange={v => updateGeo('localKeywordsEn', v)} dir="ltr" />
              <TextArea label="كلمات محلية (AR)" value={geo.localKeywordsAr || ''} onChange={v => updateGeo('localKeywordsAr', v)} />
            </div>
          </div>

          {/* GEO Descriptions */}
          <div className="bg-[#1e293b] rounded-2xl p-6 border border-white/5 space-y-5">
            <h4 className="text-white font-bold flex items-center gap-2"><MessageSquareText className="w-4 h-4 text-violet-400" /> وصف GEO (لمحركات البحث التوليدية)</h4>
            <p className="text-xs text-slate-500">هذا النص يظهر في AI Overviews / Bing Chat / Perplexity عند السؤال عن متجرك</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextArea label="GEO Description (EN)" value={geo.geoDescEn || ''} onChange={v => updateGeo('geoDescEn', v)} dir="ltr" rows={5} />
              <TextArea label="وصف GEO (AR)" value={geo.geoDescAr || ''} onChange={v => updateGeo('geoDescAr', v)} rows={5} />
            </div>
          </div>

          {/* Schema JSON-LD */}
          <div className="bg-[#1e293b] rounded-2xl p-6 border border-white/5 space-y-5">
            <h4 className="text-white font-bold flex items-center gap-2"><Code className="w-4 h-4 text-amber-400" /> Schema.org JSON-LD</h4>
            <p className="text-xs text-slate-500">كود الـ Structured Data الخاص بالنشاط المحلي — يتم إدراجه في الـ HTML</p>
            <TextArea label="LocalBusiness Schema" value={geo.schemaJsonLd || ''} onChange={v => updateGeo('schemaJsonLd', v)} dir="ltr" rows={10} mono />
          </div>

          {/* FAQ */}
          <div className="bg-[#1e293b] rounded-2xl p-6 border border-white/5 space-y-5">
            <h4 className="text-white font-bold flex items-center gap-2"><MessageSquareText className="w-4 h-4 text-cyan-400" /> الأسئلة الشائعة (FAQ Schema)</h4>
            <p className="text-xs text-slate-500">أسئلة وأجوبة تظهر في نتائج البحث — يجب أن تكون بصيغة JSON Array</p>
            <TextArea label="FAQ JSON" value={geo.faqJson || ''} onChange={v => updateGeo('faqJson', v)} dir="ltr" rows={8} mono />
          </div>

          {/* Citations */}
          <div className="bg-[#1e293b] rounded-2xl p-6 border border-white/5 space-y-5">
            <h4 className="text-white font-bold flex items-center gap-2"><Globe className="w-4 h-4 text-pink-400" /> Citations & مصادر موثوقة</h4>
            <p className="text-xs text-slate-500">مواقع خارجية مقترحة لتسجيل النشاط وزيادة الموثوقية (NAP Consistency)</p>
            <TextArea label="Citations" value={geo.citations || ''} onChange={v => updateGeo('citations', v)} dir="ltr" rows={5} />
          </div>
        </div>
      )}
    </div>
  );
}

