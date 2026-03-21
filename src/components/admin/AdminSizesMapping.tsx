import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Plus, Trash2, Save, Ruler } from 'lucide-react';

export default function AdminSizesMapping() {
  const [mappings, setMappings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ raw: '', displayEn: '', displayAr: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const fetch_ = async () => {
    try {
      const snap = await getDocs(collection(db, 'size_mappings'));
      setMappings(snap.docs.map(d => ({ id: d.id, ...d.data() as any })));
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetch_(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'size_mappings'), { ...form, createdAt: new Date().toISOString() });
      setForm({ raw: '', displayEn: '', displayAr: '' });
      fetch_();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, 'size_mappings', id));
    fetch_();
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-white flex items-center gap-2"><Ruler className="w-5 h-5 text-amber-400" /> خريطة المقاسات</h3>

      <div className="bg-[#1e293b] rounded-2xl p-6 border border-white/5">
        <form onSubmit={handleAdd} className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs text-slate-400 mb-1.5">القيمة الخام (DB/Stripe)</label>
            <input required value={form.raw} onChange={e => setForm({...form, raw: e.target.value})} dir="ltr" placeholder="50ml"
              className="w-full p-3 bg-[#0f172a] border border-white/5 rounded-xl text-white focus:border-indigo-500/50 outline-none text-sm font-mono" />
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs text-slate-400 mb-1.5">العرض (EN)</label>
            <input required value={form.displayEn} onChange={e => setForm({...form, displayEn: e.target.value})} dir="ltr" placeholder="50 ML"
              className="w-full p-3 bg-[#0f172a] border border-white/5 rounded-xl text-white focus:border-indigo-500/50 outline-none text-sm" />
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs text-slate-400 mb-1.5">العرض (AR)</label>
            <input required value={form.displayAr} onChange={e => setForm({...form, displayAr: e.target.value})} placeholder="٥٠ مل"
              className="w-full p-3 bg-[#0f172a] border border-white/5 rounded-xl text-white focus:border-indigo-500/50 outline-none text-sm" />
          </div>
          <button type="submit" className="px-5 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 text-sm font-medium flex items-center gap-2">
            <Plus className="w-4 h-4" /> إضافة
          </button>
        </form>
      </div>

      <div className="bg-[#1e293b] rounded-2xl border border-white/5 overflow-hidden">
        {loading ? <div className="py-16 text-center text-slate-500">جاري التحميل...</div> : mappings.length === 0 ? (
          <div className="py-16 text-center text-slate-500">لا توجد تعيينات مقاسات</div>
        ) : (
          <table className="w-full text-right">
            <thead><tr className="border-b border-white/5 text-slate-400 text-xs uppercase tracking-wider">
              <th className="py-4 px-4 font-medium">القيمة الخام</th>
              <th className="py-4 px-4 font-medium">العرض (EN)</th>
              <th className="py-4 px-4 font-medium">العرض (AR)</th>
              <th className="py-4 px-4 font-medium">إجراء</th>
            </tr></thead>
            <tbody>
              {mappings.map(m => (
                <tr key={m.id} className="border-b border-white/5 hover:bg-white/2">
                  <td className="py-3 px-4 font-mono text-amber-400 text-sm">{m.raw}</td>
                  <td className="py-3 px-4 text-white text-sm" dir="ltr">{m.displayEn}</td>
                  <td className="py-3 px-4 text-white text-sm">{m.displayAr}</td>
                  <td className="py-3 px-4">
                    <button onClick={() => handleDelete(m.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg" title="حذف"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
