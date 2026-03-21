import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Plus, Trash2, Edit3, Gift } from 'lucide-react';

export default function AdminGiftSets() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', nameAr: '', price: '', items: '', image: '', status: 'active' });

  const fetch_ = async () => {
    try {
      const snap = await getDocs(collection(db, 'gift_sets'));
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() as any })));
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetch_(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = { ...form, price: Number(form.price), items: form.items.split(',').map(s => s.trim()).filter(Boolean), updatedAt: new Date().toISOString() };
      if (editId) {
        await updateDoc(doc(db, 'gift_sets', editId), data);
      } else {
        await addDoc(collection(db, 'gift_sets'), { ...data, createdAt: new Date().toISOString() });
      }
      setForm({ name: '', nameAr: '', price: '', items: '', image: '', status: 'active' });
      setEditId(null); setShowForm(false); fetch_();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل تريد حذف هذه المجموعة الهدية؟')) return;
    await deleteDoc(doc(db, 'gift_sets', id));
    fetch_();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-white flex items-center gap-2"><Gift className="w-5 h-5 text-amber-400" /> طقم الهدايا ({items.length})</h3>
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ name: '', nameAr: '', price: '', items: '', image: '', status: 'active' }); }}
          className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2 text-sm font-medium">
          <Plus className="w-4 h-4" /> طقم جديد
        </button>
      </div>

      {showForm && (
        <div className="bg-[#1e293b] rounded-2xl p-6 border border-white/5">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-xs text-slate-400 mb-1.5">الاسم (EN)</label>
              <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Gift Set Name" className="w-full p-3 bg-[#0f172a] border border-white/5 rounded-xl text-white focus:border-indigo-500/50 outline-none text-sm" /></div>
            <div><label className="block text-xs text-slate-400 mb-1.5">الاسم (AR)</label>
              <input value={form.nameAr} onChange={e => setForm({...form, nameAr: e.target.value})} placeholder="اسم الطقم" className="w-full p-3 bg-[#0f172a] border border-white/5 rounded-xl text-white focus:border-indigo-500/50 outline-none text-sm" /></div>
            <div><label className="block text-xs text-slate-400 mb-1.5">السعر (ج.م)</label>
              <input required type="number" min="0" value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="0" className="w-full p-3 bg-[#0f172a] border border-white/5 rounded-xl text-white focus:border-indigo-500/50 outline-none text-sm" /></div>
            <div><label className="block text-xs text-slate-400 mb-1.5">رابط الصورة</label>
              <input value={form.image} onChange={e => setForm({...form, image: e.target.value})} dir="ltr" placeholder="https://..." className="w-full p-3 bg-[#0f172a] border border-white/5 rounded-xl text-white focus:border-indigo-500/50 outline-none text-sm" /></div>
            <div className="md:col-span-2"><label className="block text-xs text-slate-400 mb-1.5">العناصر (مفصولة بفواصل)</label>
              <input value={form.items} onChange={e => setForm({...form, items: e.target.value})} placeholder="عطر 1, عطر 2, عطر 3" className="w-full p-3 bg-[#0f172a] border border-white/5 rounded-xl text-white focus:border-indigo-500/50 outline-none text-sm" /></div>
            <div><label className="block text-xs text-slate-400 mb-1.5">الحالة</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} title="الحالة" className="w-full p-3 bg-[#0f172a] border border-white/5 rounded-xl text-white focus:border-indigo-500/50 outline-none text-sm">
                <option value="active">مفعّل</option><option value="inactive">معطّل</option></select></div>
            <div className="md:col-span-2 flex gap-3 justify-end">
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 text-slate-300 hover:bg-white/5 rounded-xl text-sm">إلغاء</button>
              <button type="submit" className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 text-sm font-medium">{editId ? 'تحديث' : 'إضافة'}</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-[#1e293b] rounded-2xl border border-white/5 overflow-hidden">
        {loading ? <div className="py-16 text-center text-slate-500">جاري التحميل...</div> : items.length === 0 ? (
          <div className="py-16 text-center text-slate-500">لا توجد أطقم هدايا</div>
        ) : (
          <table className="w-full text-right">
            <thead><tr className="border-b border-white/5 text-slate-400 text-xs uppercase tracking-wider">
              <th className="py-4 px-4 font-medium">الطقم</th><th className="py-4 px-4 font-medium">العناصر</th><th className="py-4 px-4 font-medium">السعر</th><th className="py-4 px-4 font-medium">الحالة</th><th className="py-4 px-4 font-medium">إجراء</th>
            </tr></thead>
            <tbody>
              {items.map(g => (
                <tr key={g.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                  <td className="py-3 px-4 text-white font-medium text-sm">{g.nameAr || g.name}</td>
                  <td className="py-3 px-4 text-slate-400 text-sm">{Array.isArray(g.items) ? g.items.length : 0} عناصر</td>
                  <td className="py-3 px-4 font-mono font-bold text-indigo-400 text-sm">{g.price} ج.م</td>
                  <td className="py-3 px-4"><span className={`px-2 py-1 rounded-lg text-xs font-medium ${g.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>{g.status === 'active' ? 'مفعّل' : 'معطّل'}</span></td>
                  <td className="py-3 px-4 flex gap-1">
                    <button onClick={() => { setForm({ name: g.name, nameAr: g.nameAr || '', price: String(g.price || ''), items: Array.isArray(g.items) ? g.items.join(', ') : '', image: g.image || '', status: g.status || 'active' }); setEditId(g.id); setShowForm(true); }} className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg" title="تعديل"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(g.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg" title="حذف"><Trash2 className="w-4 h-4" /></button>
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
