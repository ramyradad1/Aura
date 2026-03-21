import React, { useState } from 'react';
import { Plus, Trash2, Search, Sparkles, ImagePlus, Loader2 } from 'lucide-react';
import { generateProductDescription } from '../../utils/geminiUtils';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../firebase';
import { compressAndConvertToWebP } from '../../utils/imageUtils';

interface Props {
  perfumes: any[];
  loading: boolean;
  onAdd: (data: any) => void;
  onDelete: (id: string) => void;
}

export default function AdminProducts({ perfumes, loading, onAdd, onDelete }: Props) {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '', price: '', category: 'men', inspiredBy: '', images: [''], stock: '100', description: ''
  });

  const filtered = perfumes.filter(p =>
    search === '' || p.name?.toLowerCase().includes(search.toLowerCase()) || p.inspiredBy?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validImages = formData.images.filter(img => img.trim() !== '');
    onAdd({
      ...formData,
      images: validImages.length > 0 ? validImages : ['https://picsum.photos/seed/perfume/400/400'],
      price: Number(formData.price),
      stock: Number(formData.stock),
      createdAt: new Date().toISOString()
    });
    setFormData({ name: '', price: '', category: 'men', inspiredBy: '', images: [''], stock: '100', description: '' });
    setShowForm(false);
  };

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData({ ...formData, images: newImages });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    try {
      const optimizedFile = await compressAndConvertToWebP(file);
      const storageRef = ref(storage, `products/${Date.now()}_${optimizedFile.name}`);
      const snapshot = await uploadBytes(storageRef, optimizedFile);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      const newImages = [...formData.images];
      newImages[0] = downloadURL;
      setFormData({ ...formData, images: newImages });
    } catch (error) {
      console.error("Error uploading image: ", error);
      alert('فشل رفع الصورة');
    } finally {
      setUploading(false);
    }
  };

  const handleAIDescription = async () => {
    if (!formData.name || !formData.inspiredBy) {
      alert('اكتب اسم العطر واسم العطر الأصلي الأول');
      return;
    }
    setGenerating(true);
    try {
      const res = await generateProductDescription(formData.name, formData.inspiredBy, formData.category);
      setFormData({ ...formData, description: res.description || res.descriptionEn || '' });
    } catch (e) {
      console.error(e);
      alert('حدث خطأ أثناء التوليد');
    }
    setGenerating(false);
  };

  return (
    <div className="space-y-6">
      {/* Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-9999">
          <div className="bg-[#1e293b] p-8 rounded-2xl shadow-2xl max-w-sm w-full border border-white/10">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Trash2 className="text-red-400" /> تأكيد الحذف</h3>
            <p className="text-slate-300 mb-8">هل أنت متأكد من حذف هذا العطر؟</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteId(null)} className="px-5 py-2.5 text-slate-300 hover:bg-white/5 rounded-xl transition-colors">إلغاء</button>
              <button onClick={() => { onDelete(deleteId); setDeleteId(null); }} className="px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors">حذف</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث بالاسم..."
            className="w-full pr-10 pl-4 py-2.5 bg-[#1e293b] border border-white/5 rounded-xl text-white placeholder:text-slate-500 focus:border-indigo-500/50 outline-none text-sm" />
        </div>
        <button onClick={() => setShowForm(!showForm)} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2 text-sm font-medium">
          <Plus className="w-4 h-4" /> منتج جديد
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="bg-[#1e293b] rounded-2xl p-6 border border-white/5">
          <h3 className="text-lg font-bold text-white mb-5">إضافة عطر جديد</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">اسم العطر</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="اسم العطر"
                className="w-full p-3 bg-[#0f172a] border border-white/5 rounded-xl text-white focus:border-indigo-500/50 outline-none text-sm" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">السعر (ج.م)</label>
              <input required type="number" min="1" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="0"
                className="w-full p-3 bg-[#0f172a] border border-white/5 rounded-xl text-white focus:border-indigo-500/50 outline-none text-sm" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">الفئة</label>
              <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} title="الفئة"
                className="w-full p-3 bg-[#0f172a] border border-white/5 rounded-xl text-white focus:border-indigo-500/50 outline-none text-sm">
                <option value="men">رجالي</option>
                <option value="women">نسائي</option>
                <option value="unisex">للجنسين</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">مستوحى من</label>
              <input required type="text" value={formData.inspiredBy} onChange={e => setFormData({...formData, inspiredBy: e.target.value})} placeholder="اسم العطر الأصلي"
                className="w-full p-3 bg-[#0f172a] border border-white/5 rounded-xl text-white focus:border-indigo-500/50 outline-none text-sm" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">المخزون</label>
              <input required type="number" min="0" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} placeholder="100"
                className="w-full p-3 bg-[#0f172a] border border-white/5 rounded-xl text-white focus:border-indigo-500/50 outline-none text-sm" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">صورة المنتج</label>
              <div className="flex gap-2 items-center">
                <input type="url" value={formData.images[0]} onChange={e => handleImageChange(0, e.target.value)} placeholder="https://..."
                  className="flex-1 p-3 bg-[#0f172a] border border-white/5 rounded-xl text-white focus:border-indigo-500/50 outline-none text-sm" dir="ltr" />
                
                <label className={`flex items-center justify-center p-3 rounded-xl cursor-pointer transition-colors ${uploading ? 'bg-indigo-600/50' : 'bg-indigo-600 hover:bg-indigo-700'}`} title="رفع صورة">
                  {uploading ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : <ImagePlus className="w-5 h-5 text-white" />}
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                </label>
              </div>
            </div>
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs text-slate-400">الوصف</label>
                <button type="button" onClick={handleAIDescription} disabled={generating}
                  className="px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-lg text-xs font-medium hover:bg-indigo-500/20 border border-indigo-500/20 flex items-center gap-1.5 transition-colors disabled:opacity-50">
                  <Sparkles className="w-3 h-3" />
                  {generating ? 'جاري التوليد...' : 'توليد وصف بالذكاء الاصطناعي'}
                </button>
              </div>
              <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="وصف العطر..."
                className="w-full p-3 bg-[#0f172a] border border-white/5 rounded-xl text-white focus:border-indigo-500/50 outline-none text-sm h-24 resize-none" />
            </div>
            <div className="md:col-span-2 flex gap-3 justify-end">
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 text-slate-300 hover:bg-white/5 rounded-xl transition-colors text-sm">إلغاء</button>
              <button type="submit" className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors text-sm font-medium">إضافة المنتج</button>
            </div>
          </form>
        </div>
      )}

      {/* Products Grid */}
      <div className="bg-[#1e293b] rounded-2xl border border-white/5 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-500">جاري التحميل...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-500">لا توجد عطور</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="border-b border-white/5 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="py-4 px-4 font-medium">المنتج</th>
                  <th className="py-4 px-4 font-medium">الفئة</th>
                  <th className="py-4 px-4 font-medium">السعر</th>
                  <th className="py-4 px-4 font-medium">المخزون</th>
                  <th className="py-4 px-4 font-medium">الحالة</th>
                  <th className="py-4 px-4 font-medium">إجراء</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img src={p.images?.[0] || `https://picsum.photos/seed/${p.id}/40/40`} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        <div>
                          <p className="text-white font-medium text-sm">{p.name}</p>
                          <p className="text-xs text-slate-500">{p.inspiredBy}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-300">{p.category === 'men' ? 'رجالي' : p.category === 'women' ? 'نسائي' : 'للجنسين'}</td>
                    <td className="py-3 px-4 font-mono font-bold text-indigo-400 text-sm">{p.price} ج.م</td>
                    <td className="py-3 px-4 text-sm text-slate-300">{p.stock || '-'}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${(p.stock || 0) > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        {(p.stock || 0) > 0 ? 'متوفر' : 'نفذ'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button onClick={() => setDeleteId(p.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="حذف">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
