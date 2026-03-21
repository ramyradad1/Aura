import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Plus, Trash2, Edit3, Ticket, Sparkles } from 'lucide-react';
import { generateCouponCode } from '../../utils/geminiUtils';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [form, setForm] = useState({ code: '', discount: '', type: 'percentage', usageLimit: '', validUntil: '', status: 'active' });

  const fetch_ = async () => {
    try {
      const snap = await getDocs(collection(db, 'coupons'));
      setCoupons(snap.docs.map(d => ({ id: d.id, ...d.data() as any })));
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetch_(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = { ...form, discount: Number(form.discount), usageLimit: Number(form.usageLimit) || 0, usageCount: 0, updatedAt: new Date().toISOString() };
      if (editId) {
        await updateDoc(doc(db, 'coupons', editId), data);
      } else {
        await addDoc(collection(db, 'coupons'), { ...data, createdAt: new Date().toISOString() });
      }
      setForm({ code: '', discount: '', type: 'percentage', usageLimit: '', validUntil: '', status: 'active' });
      setEditId(null); setShowForm(false); setAiMessage(''); fetch_();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل تريد حذف هذا الكوبون؟')) return;
    await deleteDoc(doc(db, 'coupons', id));
    fetch_();
  };

  const handleAICoupon = async () => {
    const occasion = prompt('اكتب المناسبة أو الثيم (مثال: رمضان، صيف، عيد الأم، تخفيضات...)');
    if (!occasion) return;
    setGenerating(true);
    setAiMessage('');
    try {
      const res = await generateCouponCode(occasion);
      setForm({
        ...form,
        code: res.code || '',
        discount: String(res.discount || 10),
      });
      setAiMessage(res.message || '');
      setShowForm(true);
    } catch (e) {
      console.error(e);
      alert('حدث خطأ أثناء التوليد');
    }
    setGenerating(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-white flex items-center gap-2"><Ticket className="w-5 h-5 text-amber-400" /> الكوبونات ({coupons.length})</h3>
        <div className="flex gap-2">
          <button onClick={handleAICoupon} disabled={generating}
            className="px-4 py-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl hover:bg-indigo-500/20 border border-indigo-500/20 flex items-center gap-2 text-sm font-medium transition-colors disabled:opacity-50">
            <Sparkles className="w-4 h-4" /> {generating ? 'جاري التوليد...' : 'توليد كوبون بالذكاء الاصطناعي'}
          </button>
          <button onClick={() => { setShowForm(!showForm); setEditId(null); setAiMessage(''); setForm({ code: '', discount: '', type: 'percentage', usageLimit: '', validUntil: '', status: 'active' }); }}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2 text-sm font-medium">
            <Plus className="w-4 h-4" /> كوبون جديد
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-[#1e293b] rounded-2xl p-6 border border-white/5">
          {aiMessage && (
            <div className="mb-4 p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl">
              <p className="text-xs text-indigo-400 mb-1 flex items-center gap-1"><Sparkles className="w-3 h-3" /> رسالة ترويجية مقترحة</p>
              <p className="text-sm text-slate-300">{aiMessage}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="block text-xs text-slate-400 mb-1.5">الكود</label>
              <input required value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} dir="ltr" placeholder="SUMMER20"
                className="w-full p-3 bg-[#0f172a] border border-white/5 rounded-xl text-white focus:border-indigo-500/50 outline-none text-sm font-mono" /></div>
            <div><label className="block text-xs text-slate-400 mb-1.5">الخصم</label>
              <input required type="number" min="1" value={form.discount} onChange={e => setForm({...form, discount: e.target.value})} placeholder="10"
                className="w-full p-3 bg-[#0f172a] border border-white/5 rounded-xl text-white focus:border-indigo-500/50 outline-none text-sm" /></div>
            <div><label className="block text-xs text-slate-400 mb-1.5">نوع الخصم</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} title="نوع الخصم"
                className="w-full p-3 bg-[#0f172a] border border-white/5 rounded-xl text-white focus:border-indigo-500/50 outline-none text-sm">
                <option value="percentage">نسبة مئوية %</option><option value="fixed">مبلغ ثابت</option></select></div>
            <div><label className="block text-xs text-slate-400 mb-1.5">حد الاستخدام</label>
              <input type="number" min="0" value={form.usageLimit} onChange={e => setForm({...form, usageLimit: e.target.value})} placeholder="0 = غير محدود"
                className="w-full p-3 bg-[#0f172a] border border-white/5 rounded-xl text-white focus:border-indigo-500/50 outline-none text-sm" /></div>
            <div><label className="block text-xs text-slate-400 mb-1.5">صالح حتى</label>
              <input type="date" value={form.validUntil} onChange={e => setForm({...form, validUntil: e.target.value})} title="صالح حتى"
                className="w-full p-3 bg-[#0f172a] border border-white/5 rounded-xl text-white focus:border-indigo-500/50 outline-none text-sm" /></div>
            <div><label className="block text-xs text-slate-400 mb-1.5">الحالة</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} title="الحالة"
                className="w-full p-3 bg-[#0f172a] border border-white/5 rounded-xl text-white focus:border-indigo-500/50 outline-none text-sm">
                <option value="active">مفعّل</option><option value="inactive">معطّل</option></select></div>
            <div className="md:col-span-3 flex gap-3 justify-end">
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 text-slate-300 hover:bg-white/5 rounded-xl text-sm">إلغاء</button>
              <button type="submit" className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 text-sm font-medium">{editId ? 'تحديث' : 'إضافة'}</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-[#1e293b] rounded-2xl border border-white/5 overflow-hidden">
        {loading ? <div className="py-16 text-center text-slate-500">جاري التحميل...</div> : coupons.length === 0 ? (
          <div className="py-16 text-center text-slate-500">لا توجد كوبونات</div>
        ) : (
          <table className="w-full text-right">
            <thead><tr className="border-b border-white/5 text-slate-400 text-xs uppercase tracking-wider">
              <th className="py-4 px-4 font-medium">الكود</th><th className="py-4 px-4 font-medium">الخصم</th><th className="py-4 px-4 font-medium">الاستخدام</th><th className="py-4 px-4 font-medium">صالح حتى</th><th className="py-4 px-4 font-medium">الحالة</th><th className="py-4 px-4 font-medium">إجراء</th>
            </tr></thead>
            <tbody>
              {coupons.map(c => (
                <tr key={c.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-amber-400 text-sm">{c.code}</td>
                  <td className="py-3 px-4 text-white text-sm">{c.discount}{c.type === 'percentage' ? '%' : ' ج.م'}</td>
                  <td className="py-3 px-4 text-slate-400 text-sm">{c.usageCount || 0}/{c.usageLimit || '∞'}</td>
                  <td className="py-3 px-4 text-slate-400 text-sm" dir="ltr">{c.validUntil || 'غير محدد'}</td>
                  <td className="py-3 px-4"><span className={`px-2 py-1 rounded-lg text-xs font-medium ${c.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>{c.status === 'active' ? 'مفعّل' : 'معطّل'}</span></td>
                  <td className="py-3 px-4 flex gap-1">
                    <button onClick={() => { setForm({ code: c.code, discount: String(c.discount), type: c.type || 'percentage', usageLimit: String(c.usageLimit || ''), validUntil: c.validUntil || '', status: c.status || 'active' }); setEditId(c.id); setShowForm(true); }} className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors" title="تعديل"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(c.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="حذف"><Trash2 className="w-4 h-4" /></button>
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
