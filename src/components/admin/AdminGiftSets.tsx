import React, { useState, useEffect, useMemo } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Plus, Trash2, Edit3, Gift, Search, Check, AlertTriangle, Loader2, Sparkles, X, PackageCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export interface GiftSet {
  id: string;
  name: string;
  nameAr?: string;
  description?: string;
  price: number;
  originalPrice?: number;
  image?: string;
  itemIds: string[]; // List of perfume IDs included in the set
  itemNames?: string[]; // Cached list of names
  status: 'active' | 'inactive';
  isSampleSet?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface Props {
  perfumes?: any[];
}

export default function AdminGiftSets({ perfumes: propsPerfumes }: Props) {
  const { can } = useAuth();
  const canEdit = can('products.edit') || can('settings.manage');

  const [giftSets, setGiftSets] = useState<GiftSet[]>([]);
  const [perfumes, setPerfumes] = useState<any[]>(propsPerfumes || []);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [productSearch, setProductSearch] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    nameAr: '',
    description: '',
    price: '',
    originalPrice: '',
    image: '',
    itemIds: [] as string[],
    isSampleSet: true,
    status: 'active' as 'active' | 'inactive',
  });

  // Fetch gift sets from Firestore
  const fetchGiftSets = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const snap = await getDocs(collection(db, 'gift_sets'));
      const list = snap.docs.map(d => {
        const data = d.data() as any;
        // backwards compatibility with old format
        const itemIds = Array.isArray(data.itemIds)
          ? data.itemIds
          : Array.isArray(data.items)
            ? data.items
            : [];
        return { id: d.id, ...data, itemIds };
      }) as GiftSet[];
      setGiftSets(list);
    } catch (e: any) {
      console.error('Error fetching gift sets:', e);
      setErrorMessage('تعذر تحميل أطقم العطور والعروض: ' + (e?.message || 'خطأ غير معروف'));
    } finally {
      setLoading(false);
    }
  };

  // Fetch perfumes if not provided via props
  useEffect(() => {
    if (!propsPerfumes || propsPerfumes.length === 0) {
      getDocs(collection(db, 'perfumes'))
        .then(snap => setPerfumes(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
        .catch(err => console.error('Error loading perfumes for picker:', err));
    } else {
      setPerfumes(propsPerfumes);
    }
    fetchGiftSets();
  }, [propsPerfumes]);

  const resetForm = () => {
    setForm({
      name: '',
      nameAr: '',
      description: '',
      price: '',
      originalPrice: '',
      image: '',
      itemIds: [],
      isSampleSet: true,
      status: 'active',
    });
    setEditId(null);
    setShowForm(false);
    setProductSearch('');
  };

  const handleOpenEdit = (g: GiftSet) => {
    setForm({
      name: g.name || '',
      nameAr: g.nameAr || '',
      description: g.description || '',
      price: g.price != null ? String(g.price) : '',
      originalPrice: g.originalPrice != null ? String(g.originalPrice) : '',
      image: g.image || '',
      itemIds: g.itemIds || [],
      isSampleSet: g.isSampleSet !== false,
      status: g.status || 'active',
    });
    setEditId(g.id);
    setShowForm(true);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  // Filtered perfumes for search picker
  const filteredPerfumes = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    if (!q) return perfumes;
    return perfumes.filter(p =>
      p.name?.toLowerCase().includes(q) ||
      p.nameEn?.toLowerCase().includes(q) ||
      p.inspiredBy?.toLowerCase().includes(q)
    );
  }, [perfumes, productSearch]);

  // Selected perfumes details
  const selectedPerfumes = useMemo(() => {
    return perfumes.filter(p => form.itemIds.includes(p.id));
  }, [perfumes, form.itemIds]);

  // Calculate sum of selected perfumes' prices
  const calculatedSum = useMemo(() => {
    return selectedPerfumes.reduce((acc, p) => acc + (Number(p.price) || 0), 0);
  }, [selectedPerfumes]);

  const toggleProduct = (productId: string) => {
    setForm(prev => {
      const exists = prev.itemIds.includes(productId);
      const nextIds = exists
        ? prev.itemIds.filter(id => id !== productId)
        : [...prev.itemIds, productId];

      // Auto-populate originalPrice sum if empty
      const nextSelected = perfumes.filter(p => nextIds.includes(p.id));
      const newSum = nextSelected.reduce((acc, p) => acc + (Number(p.price) || 0), 0);

      // Auto-set image to first selected perfume image if empty
      let nextImage = prev.image;
      if (!nextImage && nextSelected.length > 0) {
        nextImage = nextSelected[0].images?.[0] || nextSelected[0].imageUrl || '';
      }

      return {
        ...prev,
        itemIds: nextIds,
        originalPrice: prev.originalPrice || (newSum > 0 ? String(newSum) : ''),
        image: nextImage,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = Number(form.price);
    const origPriceNum = Number(form.originalPrice) || calculatedSum || priceNum;

    if (!form.name && !form.nameAr) {
      setErrorMessage('يرجى كتابة اسم الطقم / العرض');
      return;
    }
    if (isNaN(priceNum) || priceNum <= 0) {
      setErrorMessage('سعر العرض يجب أن يكون رقماً أكبر من صفر');
      return;
    }
    if (form.itemIds.length === 0) {
      setErrorMessage('يرجى اختيار عطر واحد على الأقل من قائمة المنتجات');
      return;
    }

    setSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const selectedNames = selectedPerfumes.map(p => p.name || p.nameAr || p.inspiredBy);
      const fallbackImage = form.image || selectedPerfumes[0]?.images?.[0] || selectedPerfumes[0]?.imageUrl || '';

      const payload: Record<string, any> = {
        name: form.name.trim() || form.nameAr.trim(),
        nameAr: form.nameAr.trim() || form.name.trim(),
        description: form.description.trim(),
        price: priceNum,
        originalPrice: origPriceNum > priceNum ? origPriceNum : null,
        image: fallbackImage,
        itemIds: form.itemIds,
        itemNames: selectedNames,
        isSampleSet: form.isSampleSet,
        status: form.status,
        updatedAt: new Date().toISOString(),
      };

      if (editId) {
        await updateDoc(doc(db, 'gift_sets', editId), payload);
        setSuccessMessage(`تم تحديث عرض "${payload.nameAr}" بنجاح ✓`);
      } else {
        payload.createdAt = new Date().toISOString();
        await addDoc(collection(db, 'gift_sets'), payload);
        setSuccessMessage(`تمت إضافة عرض "${payload.nameAr}" بنجاح ✓`);
      }

      resetForm();
      await fetchGiftSets();
    } catch (e: any) {
      console.error('Error saving gift set:', e);
      setErrorMessage('فشل حفظ العرض: ' + (e?.message || 'تأكد من صلاحيات الحساب'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف العرض "${name}"؟`)) return;
    setErrorMessage(null);
    try {
      await deleteDoc(doc(db, 'gift_sets', id));
      setSuccessMessage(`تم حذف العرض "${name}" بنجاح`);
      fetchGiftSets();
    } catch (e: any) {
      console.error('Error deleting gift set:', e);
      setErrorMessage('فشل حذف العرض: ' + (e?.message || 'خطأ غير معروف'));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap gap-3 justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Gift className="w-5 h-5 text-amber-400" /> أطقم الهدايا وباقات السامبل ست ({giftSets.length})
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            إنشاء باقات وعروض مكونة من منتجات وعطور متوفرة في المتجر بسعر خاص
          </p>
        </div>

        {canEdit && (
          <button
            type="button"
            onClick={() => {
              if (showForm) resetForm();
              else {
                resetForm();
                setShowForm(true);
              }
            }}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <Plus className="w-4 h-4" /> {showForm ? 'إغلاق النموذج' : 'طقم / عرض جديد'}
          </button>
        )}
      </div>

      {/* Messages */}
      {errorMessage && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}
      {successMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-sm flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Form */}
      {showForm && canEdit && (
        <div className="bg-[#1e293b] rounded-2xl p-6 border border-white/5 shadow-xl space-y-6">
          <h4 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            {editId ? 'تعديل بيانات الطقم / العرض' : 'إنشاء طقم هدايا / سامبل ست جديد'}
          </h4>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">اسم العرض بالعربي *</label>
                <input
                  required
                  value={form.nameAr}
                  onChange={e => setForm({ ...form, nameAr: e.target.value })}
                  placeholder="مثال: مجموعة عطور النخبة (3 عطور)"
                  className="w-full p-3 bg-[#0f172a] border border-white/5 rounded-xl text-white focus:border-indigo-500/50 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1.5">الاسم بالإنجليزية (اختياري)</label>
                <input
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  dir="ltr"
                  placeholder="Elite Sample Set (3 Perfumes)"
                  className="w-full p-3 bg-[#0f172a] border border-white/5 rounded-xl text-white focus:border-indigo-500/50 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1.5">سعر العرض النهائي (ج.م) *</label>
                <input
                  required
                  type="number"
                  min="1"
                  value={form.price}
                  onChange={e => setForm({ ...form, price: e.target.value })}
                  placeholder="مثال: 950"
                  className="w-full p-3 bg-[#0f172a] border border-white/5 rounded-xl text-white focus:border-indigo-500/50 outline-none text-sm font-bold text-emerald-400"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1.5">
                  السعر الأصلي قبل الخصم (ج.م)
                  {calculatedSum > 0 && (
                    <span className="text-slate-500 font-normal mr-2">
                      (مجموع العطور المختارة: {calculatedSum} ج.م)
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.originalPrice}
                  onChange={e => setForm({ ...form, originalPrice: e.target.value })}
                  placeholder={calculatedSum > 0 ? String(calculatedSum) : '0'}
                  className="w-full p-3 bg-[#0f172a] border border-white/5 rounded-xl text-white focus:border-indigo-500/50 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1.5">رابط صورة العرض (اختياري)</label>
                <input
                  value={form.image}
                  onChange={e => setForm({ ...form, image: e.target.value })}
                  dir="ltr"
                  placeholder="https://... (سيتم استخدام صورة أول عطر تلقائياً إن تركت فارغة)"
                  className="w-full p-3 bg-[#0f172a] border border-white/5 rounded-xl text-white focus:border-indigo-500/50 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1.5">الحالة</label>
                <select
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value as 'active' | 'inactive' })}
                  className="w-full p-3 bg-[#0f172a] border border-white/5 rounded-xl text-white focus:border-indigo-500/50 outline-none text-sm"
                >
                  <option value="active">مفعّل ومعروض في المتجر</option>
                  <option value="inactive">معطّل (مسودة)</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs text-slate-400 mb-1.5">وصف العرض والمميزات</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="اكتب وصفاً جذاباً لمحتوى الباقة والروائح المتضمنة..."
                  className="w-full p-3 bg-[#0f172a] border border-white/5 rounded-xl text-white focus:border-indigo-500/50 outline-none text-sm h-20 resize-none"
                />
              </div>
            </div>

            {/* Product Selector Section */}
            <div className="border-t border-white/5 pt-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h5 className="text-sm font-bold text-white flex items-center gap-2">
                    <PackageCheck className="w-4 h-4 text-indigo-400" />
                    العطور المتضمنة في هذا الطقم ({form.itemIds.length} عطور مختارة)
                  </h5>
                  <p className="text-xs text-slate-400 mt-0.5">اختر العطور المتوفرة في المتجر لإضافتها داخل العرض</p>
                </div>

                <div className="relative min-w-[220px]">
                  <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={e => setProductSearch(e.target.value)}
                    placeholder="بحث في المنتجات..."
                    className="w-full pr-9 pl-3 py-1.5 bg-[#0f172a] border border-white/10 rounded-lg text-xs text-white placeholder:text-slate-500 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Selected Chips */}
              {selectedPerfumes.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-[#0f172a] rounded-xl border border-indigo-500/20">
                  {selectedPerfumes.map(p => (
                    <div
                      key={p.id}
                      className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-200 px-2.5 py-1 rounded-lg text-xs"
                    >
                      <img
                        src={p.images?.[0] || p.imageUrl || `https://picsum.photos/seed/${p.id}/30/30`}
                        alt=""
                        className="w-5 h-5 rounded object-cover"
                      />
                      <span>{p.name || p.nameAr}</span>
                      <span className="text-indigo-400 font-mono">({p.price} ج.م)</span>
                      <button
                        type="button"
                        onClick={() => toggleProduct(p.id)}
                        className="text-slate-400 hover:text-red-400 p-0.5 rounded transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Perfume Grid Picker */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[320px] overflow-y-auto pr-1">
                {filteredPerfumes.map(p => {
                  const isSelected = form.itemIds.includes(p.id);
                  const img = p.images?.[0] || p.imageUrl || `https://picsum.photos/seed/${p.id}/60/60`;

                  return (
                    <div
                      key={p.id}
                      onClick={() => toggleProduct(p.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                        isSelected
                          ? 'bg-indigo-600/15 border-indigo-500 shadow-sm shadow-indigo-500/20'
                          : 'bg-[#0f172a]/60 border-white/5 hover:border-white/20 hover:bg-[#0f172a]'
                      }`}
                    >
                      <div className="relative shrink-0">
                        <img src={img} alt="" className="w-12 h-12 rounded-lg object-cover" />
                        {isSelected && (
                          <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center text-white">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-bold truncate ${isSelected ? 'text-indigo-200' : 'text-white'}`}>
                          {p.name || p.nameAr || 'عطر بدون اسم'}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">{p.inspiredBy || p.brand || '-'}</p>
                        <p className="text-xs font-bold text-amber-400 font-mono mt-0.5">{p.price} ج.م</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-4 border-t border-white/5">
              <button
                type="button"
                onClick={resetForm}
                className="px-5 py-2.5 text-slate-300 hover:bg-white/5 rounded-xl text-sm transition-colors"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editId ? 'تحديث العرض' : 'حفظ العرض'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Gift Sets List */}
      <div className="bg-[#1e293b] rounded-2xl border border-white/5 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-500 flex flex-col items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
            <span>جاري تحميل العروض...</span>
          </div>
        ) : giftSets.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            لا توجد أطقم أو عروض مضافة حالياً. اضغط "طقم / عرض جديد" لإنشاء أول عرض.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="border-b border-white/5 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="py-4 px-4 font-medium">العرض / الطقم</th>
                  <th className="py-4 px-4 font-medium">العطور المتضمنة</th>
                  <th className="py-4 px-4 font-medium">سعر العرض</th>
                  <th className="py-4 px-4 font-medium">الحالة</th>
                  <th className="py-4 px-4 font-medium">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {giftSets.map(g => {
                  const setPerfumes = perfumes.filter(p => g.itemIds?.includes(p.id));
                  const displayImage = g.image || setPerfumes[0]?.images?.[0] || setPerfumes[0]?.imageUrl || `https://picsum.photos/seed/${g.id}/60/60`;

                  return (
                    <tr key={g.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img src={displayImage} alt="" className="w-12 h-12 rounded-xl object-cover bg-[#0f172a]" />
                          <div>
                            <p className="text-white font-bold text-sm">{g.nameAr || g.name}</p>
                            {g.description && (
                              <p className="text-xs text-slate-400 line-clamp-1 max-w-[280px]">{g.description}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap max-w-xs">
                          {setPerfumes.length > 0 ? (
                            setPerfumes.slice(0, 4).map(p => (
                              <span
                                key={p.id}
                                className="inline-flex items-center gap-1 text-[11px] bg-white/5 border border-white/10 px-2 py-0.5 rounded-md text-slate-300"
                              >
                                {p.name || p.inspiredBy}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-500">{g.itemIds?.length || 0} عطور</span>
                          )}
                          {setPerfumes.length > 4 && (
                            <span className="text-[10px] text-indigo-400 font-bold">+{setPerfumes.length - 4}</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-sm">
                        <span className="font-mono font-bold text-emerald-400 text-sm">{g.price} ج.م</span>
                        {g.originalPrice && g.originalPrice > g.price && (
                          <span className="block text-[11px] text-slate-500 line-through font-mono">
                            {g.originalPrice} ج.م
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                            g.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}
                        >
                          {g.status === 'active' ? 'مفعّل' : 'معطّل'}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          {canEdit && (
                            <>
                              <button
                                onClick={() => handleOpenEdit(g)}
                                className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                title="تعديل"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(g.id, g.nameAr || g.name)}
                                className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                title="حذف"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
