import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Eye, EyeOff, GripVertical, Save } from 'lucide-react';

const DEFAULT_SECTIONS = [
  { id: 'hero', name: 'بانر رئيسي (Hero Banner)', visible: true },
  { id: 'gender', name: 'عرض حسب الجنس (Gender Showcase)', visible: true },
  { id: 'categoryFilter', name: 'شريط تصفية الفئات', visible: true },
  { id: 'categoryGrid', name: 'شبكة الفئات', visible: true },
  { id: 'featured', name: 'منتجات مميزة', visible: true },
  { id: 'productType', name: 'عرض حسب النوع', visible: true },
  { id: 'promo', name: 'بانر ترويجي', visible: true },
  { id: 'recentlyViewed', name: 'شوهد مؤخراً', visible: true },
];

export default function AdminSections() {
  const [sections, setSections] = useState(DEFAULT_SECTIONS);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'homepage_sections'));
        if (snap.exists() && snap.data().sections) setSections(snap.data().sections);
      } catch (e) { console.error(e); }
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'homepage_sections'), { sections, updatedAt: new Date().toISOString() });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const toggleVisibility = (idx: number) => {
    const updated = [...sections];
    updated[idx] = { ...updated[idx], visible: !updated[idx].visible };
    setSections(updated);
  };

  const moveSection = (from: number, to: number) => {
    if (to < 0 || to >= sections.length) return;
    const updated = [...sections];
    const [item] = updated.splice(from, 1);
    updated.splice(to, 0, item);
    setSections(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-white">أقسام الصفحة الرئيسية</h3>
        <button onClick={handleSave} disabled={saving}
          className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2 text-sm font-medium disabled:opacity-50">
          <Save className="w-4 h-4" /> {saved ? 'تم الحفظ ✓' : 'حفظ الترتيب'}
        </button>
      </div>

      <div className="bg-[#1e293b] rounded-2xl border border-white/5 overflow-hidden">
        {sections.map((section, idx) => (
          <div key={section.id}
            className={`flex items-center gap-4 px-6 py-4 border-b border-white/5 hover:bg-white/2 transition-colors ${!section.visible ? 'opacity-50' : ''}`}
            draggable
            onDragStart={() => setDraggedIdx(idx)}
            onDragOver={e => e.preventDefault()}
            onDrop={() => { if (draggedIdx !== null) { moveSection(draggedIdx, idx); setDraggedIdx(null); } }}
          >
            <GripVertical className="w-4 h-4 text-slate-500 cursor-grab" />
            <span className="text-sm text-slate-400 w-6">{idx + 1}</span>
            <span className="flex-1 text-white text-sm font-medium">{section.name}</span>
            <button onClick={() => toggleVisibility(idx)} className={`p-2 rounded-lg transition-colors ${section.visible ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-slate-500 hover:bg-white/5'}`}>
              {section.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-500">اسحب وأفلت لإعادة ترتيب الأقسام. اضغط على أيقونة العين لإظهار/إخفاء القسم.</p>
    </div>
  );
}

