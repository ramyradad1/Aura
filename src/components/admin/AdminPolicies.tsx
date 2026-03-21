import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Save, FileText, Sparkles } from 'lucide-react';
import { generatePolicy } from '../../utils/geminiUtils';

export default function AdminPolicies() {
  const [policies, setPolicies] = useState({ refund: '', terms: '', privacy: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [activePolicy, setActivePolicy] = useState<'refund' | 'terms' | 'privacy'>('refund');

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'policies'));
        if (snap.exists()) setPolicies({ ...policies, ...snap.data() as any });
      } catch (e) { console.error(e); }
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'policies'), { ...policies, updatedAt: new Date().toISOString() }, { merge: true });
      setSaved(true); setTimeout(() => setSaved(false), 2000);
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const handleAIGenerate = async () => {
    setGenerating(true);
    try {
      const text = await generatePolicy(activePolicy);
      setPolicies({ ...policies, [activePolicy]: text });
    } catch (e) {
      console.error(e);
      alert('حدث خطأ أثناء التوليد بالذكاء الاصطناعي');
    }
    setGenerating(false);
  };

  const tabs = [
    { id: 'refund', label: 'سياسة الاسترجاع' },
    { id: 'terms', label: 'الشروط والأحكام' },
    { id: 'privacy', label: 'سياسة الخصوصية' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-white flex items-center gap-2"><FileText className="w-5 h-5 text-emerald-400" /> السياسات</h3>
        <button onClick={handleSave} disabled={saving}
          className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2 text-sm font-medium disabled:opacity-50">
          <Save className="w-4 h-4" /> {saved ? 'تم الحفظ ✓' : 'حفظ السياسات'}
        </button>
      </div>

      <div className="flex gap-2">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActivePolicy(t.id as any)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activePolicy === t.id ? 'bg-indigo-600 text-white' : 'bg-[#1e293b] text-slate-400 hover:text-white border border-white/5'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-[#1e293b] rounded-2xl p-6 border border-white/5">
        <div className="flex items-center justify-between mb-3">
          <label className="block text-xs text-slate-400">{tabs.find(t => t.id === activePolicy)?.label} (Markdown مدعوم)</label>
          <button onClick={handleAIGenerate} disabled={generating}
            className="px-4 py-2 bg-indigo-500/10 text-indigo-400 rounded-lg text-xs font-medium hover:bg-indigo-500/20 border border-indigo-500/20 flex items-center gap-1.5 transition-colors disabled:opacity-50">
            <Sparkles className="w-3.5 h-3.5" />
            {generating ? 'جاري الكتابة...' : 'كتابة بالذكاء الاصطناعي'}
          </button>
        </div>
        <textarea
          value={policies[activePolicy]}
          onChange={e => setPolicies({ ...policies, [activePolicy]: e.target.value })}
          className="w-full p-4 bg-[#0f172a] border border-white/5 rounded-xl text-white focus:border-indigo-500/50 outline-none text-sm h-[400px] resize-none font-mono leading-relaxed"
          dir="rtl"
          placeholder="اكتب السياسة هنا..."
        />
      </div>
    </div>
  );
}
