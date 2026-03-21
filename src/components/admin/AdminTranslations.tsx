import React, { useState } from 'react';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Languages, Save, RefreshCw, Sparkles } from 'lucide-react';
import { generateEgyptianTranslation } from '../../utils/geminiUtils';

interface Props {
  perfumes: any[];
  onRefresh: () => void;
}

export default function AdminTranslations({ perfumes, onRefresh }: Props) {
  const [translations, setTranslations] = useState<Record<string, { nameAr: string; descAr: string }>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [generating, setGenerating] = useState<string | null>(null);

  const missing = perfumes.filter(p => !p.nameAr || !p.descriptionAr);

  const getTranslation = (id: string) => translations[id] || { nameAr: '', descAr: '' };
  const setTranslation = (id: string, field: string, value: string) => {
    setTranslations({ ...translations, [id]: { ...getTranslation(id), [field]: value } });
  };

  const handleSave = async (id: string) => {
    setSaving(id);
    try {
      const t = getTranslation(id);
      await updateDoc(doc(db, 'perfumes', id), { nameAr: t.nameAr, descriptionAr: t.descAr, updatedAt: new Date().toISOString() });
      onRefresh();
    } catch (e) { console.error(e); }
    setSaving(null);
  };
  
  const handleAITranslate = async (p: any) => {
    setGenerating(p.id);
    try {
      const res = await generateEgyptianTranslation(p.name, p.description);
      setTranslations({
        ...translations,
        [p.id]: {
          nameAr: res.nameAr || getTranslation(p.id).nameAr,
          descAr: res.descAr || getTranslation(p.id).descAr
        }
      });
    } catch (e) {
      console.error(e);
      alert("حدث خطأ أثناء التوليد بالذكاء الاصطناعي");
    }
    setGenerating(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-white flex items-center gap-2"><Languages className="w-5 h-5 text-violet-400" /> الترجمات ({missing.length} ناقصة)</h3>
        <button onClick={onRefresh} className="px-4 py-2 bg-[#1e293b] border border-white/5 text-slate-300 rounded-xl text-sm flex items-center gap-2 hover:bg-white/5">
          <RefreshCw className="w-4 h-4" /> تحديث القائمة
        </button>
      </div>

      {missing.length === 0 ? (
        <div className="bg-[#1e293b] rounded-2xl p-12 border border-white/5 text-center">
          <p className="text-emerald-400 text-lg font-bold mb-2">كل المنتجات مترجمة ✓</p>
          <p className="text-slate-500 text-sm">لا توجد ترجمات ناقصة</p>
        </div>
      ) : (
        <div className="space-y-4">
          {missing.map(p => (
            <div key={p.id} className="bg-[#1e293b] rounded-2xl p-5 border border-white/5">
              <div className="flex items-center gap-3 mb-4">
                <img src={p.images?.[0] || `https://picsum.photos/seed/${p.id}/40/40`} alt="" className="w-10 h-10 rounded-lg object-cover" />
                <div className="flex-1">
                  <p className="text-white font-medium text-sm">{p.name}</p>
                  <p className="text-xs text-slate-500 truncate">{p.description}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">الاسم بالعربي</label>
                  <input value={getTranslation(p.id).nameAr} onChange={e => setTranslation(p.id, 'nameAr', e.target.value)}
                    placeholder={p.name}
                    className="w-full p-3 bg-[#0f172a] border border-white/5 rounded-xl text-white focus:border-indigo-500/50 outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">الوصف بالعربي</label>
                  <input value={getTranslation(p.id).descAr} onChange={e => setTranslation(p.id, 'descAr', e.target.value)} placeholder="الوصف بالعربي..."
                    className="w-full p-3 bg-[#0f172a] border border-white/5 rounded-xl text-white focus:border-indigo-500/50 outline-none text-sm" />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button onClick={() => handleAITranslate(p)} disabled={generating === p.id}
                  className="px-4 py-2 bg-indigo-500/10 text-indigo-400 rounded-lg text-xs font-medium hover:bg-indigo-500/20 border border-indigo-500/20 flex items-center gap-1.5 transition-colors disabled:opacity-50">
                  <Sparkles className="w-3.5 h-3.5" />
                  {generating === p.id ? 'جاري التوليد...' : 'ترجمة بالذكاء الاصطناعي'}
                </button>
                <button onClick={() => handleSave(p.id)} disabled={saving === p.id}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 flex items-center gap-1.5 transition-colors disabled:opacity-50">
                  <Save className="w-3.5 h-3.5" /> {saving === p.id ? 'جاري الحفظ...' : 'حفظ'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
