import React, { useMemo, useState } from 'react';
import {
  Plus, Trash2, Search, Sparkles, ImagePlus, Loader2, Pencil, X,
  Star, Package, DollarSign, FlaskConical, Image as ImageIcon, Globe
} from 'lucide-react';
import { generateProductDescription } from '../../utils/geminiUtils';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../firebase';
import { compressAndConvertToWebP } from '../../utils/imageUtils';
import { useAuth } from '../../context/AuthContext';

interface Props {
  perfumes: any[];
  loading: boolean;
  onAdd: (data: any) => void;
  onUpdate?: (id: string, data: any) => void;
  onDelete: (id: string) => void;
}

type Category = 'men' | 'women' | 'unisex';

interface FormState {
  name: string;
  nameEn: string;
  inspiredBy: string;
  brand: string;
  category: Category;
  concentration: string;
  sku: string;
  price: string;
  compareAtPrice: string;
  stock: string;
  sizes: string[];
  notesTop: string;
  notesMiddle: string;
  notesBase: string;
  description: string;
  descriptionEn: string;
  images: string[];
  metaTitle: string;
  metaDescription: string;
  isActive: boolean;
  isFeatured: boolean;
  isNew: boolean;
  isBestSeller: boolean;
}

const CONCENTRATIONS = ['Eau de Parfum', 'Eau de Toilette', 'Extrait de Parfum', 'Eau de Cologne'];
const SIZE_PRESETS = ['30ml', '50ml', '100ml', '125ml'];

const emptyForm: FormState = {
  name: '', nameEn: '', inspiredBy: '', brand: '', category: 'men',
  concentration: 'Eau de Parfum', sku: '',
  price: '', compareAtPrice: '', stock: '100',
  sizes: ['50ml', '100ml'],
  notesTop: '', notesMiddle: '', notesBase: '',
  description: '', descriptionEn: '',
  images: [],
  metaTitle: '', metaDescription: '',
  isActive: true, isFeatured: false, isNew: true, isBestSeller: false,
};

/** Maps an existing firestore document back into the flat form shape. */
function toFormState(p: any): FormState {
  return {
    name: p.name || '',
    nameEn: p.nameEn || '',
    inspiredBy: p.inspiredBy || '',
    brand: p.brand || '',
    category: (p.category as Category) || 'men',
    concentration: p.concentration || 'Eau de Parfum',
    sku: p.sku || '',
    price: p.price != null ? String(p.price) : '',
    compareAtPrice: p.compareAtPrice != null ? String(p.compareAtPrice) : '',
    stock: p.stock != null ? String(p.stock) : '0',
    sizes: Array.isArray(p.sizes) && p.sizes.length ? p.sizes : ['50ml', '100ml'],
    notesTop: p.notes?.top || '',
    notesMiddle: p.notes?.middle || '',
    notesBase: p.notes?.base || '',
    description: p.description || '',
    descriptionEn: p.descriptionEn || '',
    images: Array.isArray(p.images) ? p.images.filter(Boolean) : (p.imageUrl ? [p.imageUrl] : []),
    metaTitle: p.metaTitle || '',
    metaDescription: p.metaDescription || '',
    isActive: p.isActive !== false,
    isFeatured: !!p.isFeatured,
    isNew: !!p.isNew,
    isBestSeller: !!p.isBestSeller,
  };
}

const inputCls = 'w-full p-3 bg-[#0f172a] border border-white/5 rounded-xl text-white placeholder:text-slate-600 focus:border-indigo-500/50 outline-none text-sm';
const labelCls = 'block text-xs text-slate-400 mb-1.5';

function Section({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <div className="md:col-span-2 border-t border-white/5 pt-5 first:border-0 first:pt-0">
      <h4 className="flex items-center gap-2 text-sm font-bold text-white mb-4">
        <Icon className="w-4 h-4 text-indigo-400" /> {title}
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

export default function AdminProducts({ perfumes, loading, onAdd, onUpdate, onDelete }: Props) {
  const { can } = useAuth();
  const canEdit = can('products.edit');
  const canDelete = can('products.delete');

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | Category>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [urlDraft, setUrlDraft] = useState('');
  const [sizeDraft, setSizeDraft] = useState('');
  const [formData, setFormData] = useState<FormState>(emptyForm);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setFormData(prev => ({ ...prev, [key]: value }));

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return perfumes.filter(p => {
      const matchesQuery = q === '' ||
        p.name?.toLowerCase().includes(q) ||
        p.nameEn?.toLowerCase().includes(q) ||
        p.inspiredBy?.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q);
      const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
      return matchesQuery && matchesCategory;
    });
  }, [perfumes, search, categoryFilter]);

  const openCreate = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setUrlDraft('');
    setShowForm(true);
  };

  const openEdit = (p: any) => {
    setFormData(toFormState(p));
    setEditingId(p.id);
    setUrlDraft('');
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(emptyForm);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;

    const images = formData.images.filter(img => img.trim() !== '');
    const price = Number(formData.price);
    const compareAtPrice = Number(formData.compareAtPrice);

    const payload: Record<string, any> = {
      name: formData.name.trim(),
      nameEn: formData.nameEn.trim(),
      inspiredBy: formData.inspiredBy.trim(),
      brand: formData.brand.trim(),
      category: formData.category,
      concentration: formData.concentration,
      sku: formData.sku.trim(),
      price,
      // Only stored when it is an actual discount, the storefront uses it as
      // the struck-through "before" price.
      compareAtPrice: compareAtPrice > price ? compareAtPrice : null,
      stock: Number(formData.stock),
      sizes: formData.sizes,
      notes: {
        top: formData.notesTop.trim(),
        middle: formData.notesMiddle.trim(),
        base: formData.notesBase.trim(),
      },
      description: formData.description.trim(),
      descriptionEn: formData.descriptionEn.trim(),
      images: images.length > 0 ? images : ['https://picsum.photos/seed/perfume/400/400'],
      // Kept in sync for the cards/compare views that read a single image.
      imageUrl: images[0] || 'https://picsum.photos/seed/perfume/400/400',
      metaTitle: formData.metaTitle.trim(),
      metaDescription: formData.metaDescription.trim(),
      isActive: formData.isActive,
      isFeatured: formData.isFeatured,
      isNew: formData.isNew,
      isBestSeller: formData.isBestSeller,
      updatedAt: new Date().toISOString(),
    };

    if (editingId && onUpdate) {
      onUpdate(editingId, payload);
    } else {
      onAdd({ ...payload, createdAt: new Date().toISOString() });
    }
    closeForm();
  };

  const handleMultiFileUpload = async (files: File[]) => {
    setUploading(true);
    try {
      const urls = await Promise.all(files.map(async (file) => {
        const optimizedFile = await compressAndConvertToWebP(file);
        const storageRef = ref(storage, `products/${Date.now()}_${Math.random().toString(36).slice(2)}_${optimizedFile.name}`);
        const snapshot = await uploadBytes(storageRef, optimizedFile);
        return getDownloadURL(snapshot.ref);
      }));
      setFormData(prev => ({ ...prev, images: [...prev.images.filter(Boolean), ...urls] }));
    } catch (error) {
      console.error('Error uploading images: ', error);
      alert('فشل رفع بعض الصور');
    } finally {
      setUploading(false);
    }
  };

  const addUrlImage = () => {
    const url = urlDraft.trim();
    if (!url) return;
    setFormData(prev => ({ ...prev, images: [...prev.images, url] }));
    setUrlDraft('');
  };

  const toggleSize = (size: string) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size) ? prev.sizes.filter(s => s !== size) : [...prev.sizes, size],
    }));
  };

  const addCustomSize = () => {
    const size = sizeDraft.trim();
    if (!size || formData.sizes.includes(size)) return;
    setFormData(prev => ({ ...prev, sizes: [...prev.sizes, size] }));
    setSizeDraft('');
  };

  const handleAIDescription = async () => {
    if (!formData.name || !formData.inspiredBy) {
      alert('اكتب اسم العطر واسم العطر الأصلي الأول');
      return;
    }
    setGenerating(true);
    try {
      const res = await generateProductDescription(formData.name, formData.inspiredBy, formData.category);
      setFormData(prev => ({
        ...prev,
        description: res.description || prev.description,
        descriptionEn: res.descriptionEn || prev.descriptionEn,
      }));
    } catch (e) {
      console.error(e);
      alert('حدث خطأ أثناء التوليد');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-9999 p-4">
          <div className="bg-[#1e293b] p-8 rounded-2xl shadow-2xl max-w-sm w-full border border-white/10">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Trash2 className="text-red-400" /> تأكيد الحذف</h3>
            <p className="text-slate-300 mb-8">هل أنت متأكد من حذف هذا العطر؟ لا يمكن الرجوع.</p>
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
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث بالاسم أو الكود..."
            className="w-full pr-10 pl-4 py-2.5 bg-[#1e293b] border border-white/5 rounded-xl text-white placeholder:text-slate-500 focus:border-indigo-500/50 outline-none text-sm" />
        </div>
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value as any)} title="تصفية بالفئة"
          className="px-4 py-2.5 bg-[#1e293b] border border-white/5 rounded-xl text-white outline-none text-sm">
          <option value="all">كل الفئات</option>
          <option value="men">رجالي</option>
          <option value="women">نسائي</option>
          <option value="unisex">للجنسين</option>
        </select>
        {canEdit && (
          <button onClick={showForm ? closeForm : openCreate}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2 text-sm font-medium">
            {showForm ? <><X className="w-4 h-4" /> إغلاق</> : <><Plus className="w-4 h-4" /> منتج جديد</>}
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && canEdit && (
        <div className="bg-[#1e293b] rounded-2xl p-6 border border-white/5">
          <h3 className="text-lg font-bold text-white mb-5">{editingId ? 'تعديل العطر' : 'إضافة عطر جديد'}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <Section icon={Package} title="البيانات الأساسية">
              <div>
                <label className={labelCls}>اسم العطر (عربي) *</label>
                <input required type="text" value={formData.name} onChange={e => set('name', e.target.value)} placeholder="أورا نوار" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>الاسم بالإنجليزية</label>
                <input type="text" value={formData.nameEn} onChange={e => set('nameEn', e.target.value)} placeholder="Aura Noir" className={inputCls} dir="ltr" />
              </div>
              <div>
                <label className={labelCls}>مستوحى من *</label>
                <input required type="text" value={formData.inspiredBy} onChange={e => set('inspiredBy', e.target.value)} placeholder="Creed Aventus" className={inputCls} dir="ltr" />
              </div>
              <div>
                <label className={labelCls}>البراند الأصلي</label>
                <input type="text" value={formData.brand} onChange={e => set('brand', e.target.value)} placeholder="Creed" className={inputCls} dir="ltr" />
              </div>
              <div>
                <label className={labelCls}>الفئة</label>
                <select value={formData.category} onChange={e => set('category', e.target.value as Category)} title="الفئة" className={inputCls}>
                  <option value="men">رجالي</option>
                  <option value="women">نسائي</option>
                  <option value="unisex">للجنسين</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>التركيز</label>
                <select value={formData.concentration} onChange={e => set('concentration', e.target.value)} title="التركيز" className={inputCls}>
                  {CONCENTRATIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </Section>

            <Section icon={DollarSign} title="السعر والمخزون">
              <div>
                <label className={labelCls}>السعر (ج.م) *</label>
                <input required type="number" min="1" value={formData.price} onChange={e => set('price', e.target.value)} placeholder="0" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>السعر قبل الخصم (اختياري)</label>
                <input type="number" min="0" value={formData.compareAtPrice} onChange={e => set('compareAtPrice', e.target.value)} placeholder="0" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>المخزون *</label>
                <input required type="number" min="0" value={formData.stock} onChange={e => set('stock', e.target.value)} placeholder="100" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>كود المنتج (SKU)</label>
                <input type="text" value={formData.sku} onChange={e => set('sku', e.target.value)} placeholder="AURA-001" className={inputCls} dir="ltr" />
              </div>
              <div className="md:col-span-2">
                <label className={labelCls}>الأحجام المتاحة</label>
                <div className="flex flex-wrap gap-2">
                  {Array.from(new Set([...SIZE_PRESETS, ...formData.sizes])).map(size => {
                    const active = formData.sizes.includes(size);
                    return (
                      <button key={size} type="button" onClick={() => toggleSize(size)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${active
                          ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/40'
                          : 'bg-[#0f172a] text-slate-400 border-white/5 hover:border-white/20'}`}>
                        {size}
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-2 mt-2">
                  <input type="text" value={sizeDraft} onChange={e => setSizeDraft(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomSize(); } }}
                    placeholder="حجم مخصص مثل 200ml" className={`${inputCls} text-xs py-2`} />
                  <button type="button" onClick={addCustomSize} className="px-4 rounded-xl bg-white/5 text-slate-300 text-xs hover:bg-white/10 transition-colors">إضافة</button>
                </div>
              </div>
            </Section>

            <Section icon={FlaskConical} title="النوتات العطرية">
              <div>
                <label className={labelCls}>النوتات الافتتاحية</label>
                <input type="text" value={formData.notesTop} onChange={e => set('notesTop', e.target.value)} placeholder="أناناس، برغموت، تفاح" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>نوتات القلب</label>
                <input type="text" value={formData.notesMiddle} onChange={e => set('notesMiddle', e.target.value)} placeholder="باتشولي، ياسمين، ورد" className={inputCls} />
              </div>
              <div className="md:col-span-2">
                <label className={labelCls}>النوتات القاعدية</label>
                <input type="text" value={formData.notesBase} onChange={e => set('notesBase', e.target.value)} placeholder="مسك، طحلب البلوط، فانيليا" className={inputCls} />
              </div>
            </Section>

            <Section icon={ImageIcon} title="الصور">
              <div className="md:col-span-2">
                <div
                  className="border-2 border-dashed border-white/10 hover:border-indigo-500/40 rounded-xl p-6 text-center transition-colors cursor-pointer bg-[#0f172a]/50"
                  onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-indigo-500/60', 'bg-indigo-500/5'); }}
                  onDragLeave={(e) => { e.currentTarget.classList.remove('border-indigo-500/60', 'bg-indigo-500/5'); }}
                  onDrop={async (e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('border-indigo-500/60', 'bg-indigo-500/5');
                    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
                    if (files.length > 0) await handleMultiFileUpload(files);
                  }}
                  onClick={() => document.getElementById('multi-file-input')?.click()}
                >
                  {uploading ? (
                    <div className="flex flex-col items-center gap-2 py-2">
                      <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                      <p className="text-sm text-indigo-400">جاري رفع الصور...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-2">
                      <ImagePlus className="w-8 h-8 text-slate-500" />
                      <p className="text-sm text-slate-400">اسحب الصور هنا أو اضغط للاختيار</p>
                      <p className="text-xs text-slate-600">PNG, JPG, WEBP — يتم ضغطها تلقائياً</p>
                    </div>
                  )}
                  <input id="multi-file-input" type="file" className="hidden" accept="image/*" multiple
                    aria-label="اختيار صور المنتج" disabled={uploading}
                    onChange={async (e) => {
                      const files = Array.from(e.target.files || []);
                      if (files.length > 0) await handleMultiFileUpload(files);
                      e.target.value = '';
                    }} />
                </div>

                {formData.images.length > 0 && (
                  <div className="flex flex-wrap gap-3 mt-4">
                    {formData.images.map((img, idx) => (
                      <div key={`${img}-${idx}`} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-white/10 bg-[#0f172a]">
                        <img src={img} alt={`صورة ${idx + 1}`} className="w-full h-full object-cover" />
                        <button type="button" aria-label="حذف الصورة"
                          onClick={() => set('images', formData.images.filter((_, i) => i !== idx))}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                        {idx === 0 && (
                          <span className="absolute bottom-0 inset-x-0 bg-indigo-600/80 text-[9px] text-white text-center py-0.5">رئيسية</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 items-center mt-3">
                  <input type="url" value={urlDraft} onChange={e => setUrlDraft(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addUrlImage(); } }}
                    placeholder="أو الصق رابط صورة https://..." className={`${inputCls} text-xs py-2.5`} dir="ltr" />
                  <button type="button" onClick={addUrlImage} className="px-4 rounded-xl bg-white/5 text-slate-300 text-xs hover:bg-white/10 transition-colors">إضافة</button>
                </div>
              </div>
            </Section>

            <Section icon={Sparkles} title="الوصف">
              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label className={labelCls}>الوصف (عربي)</label>
                  <button type="button" onClick={handleAIDescription} disabled={generating}
                    className="px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-lg text-xs font-medium hover:bg-indigo-500/20 border border-indigo-500/20 flex items-center gap-1.5 transition-colors disabled:opacity-50">
                    <Sparkles className="w-3 h-3" />
                    {generating ? 'جاري التوليد...' : 'توليد بالذكاء الاصطناعي'}
                  </button>
                </div>
                <textarea value={formData.description} onChange={e => set('description', e.target.value)} placeholder="وصف العطر..."
                  className={`${inputCls} h-24 resize-none`} />
              </div>
              <div className="md:col-span-2">
                <label className={labelCls}>الوصف بالإنجليزية</label>
                <textarea value={formData.descriptionEn} onChange={e => set('descriptionEn', e.target.value)} placeholder="Product description..."
                  className={`${inputCls} h-20 resize-none`} dir="ltr" />
              </div>
            </Section>

            <Section icon={Globe} title="SEO والعرض">
              <div>
                <label className={labelCls}>عنوان SEO</label>
                <input type="text" value={formData.metaTitle} onChange={e => set('metaTitle', e.target.value)} placeholder="يُترك فارغاً لتوليده تلقائياً" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>وصف SEO</label>
                <input type="text" value={formData.metaDescription} onChange={e => set('metaDescription', e.target.value)} placeholder="يُترك فارغاً لتوليده تلقائياً" className={inputCls} />
              </div>
              <div className="md:col-span-2 flex flex-wrap gap-4 pt-1">
                {([
                  ['isActive', 'معروض في المتجر'],
                  ['isFeatured', 'منتج مميز'],
                  ['isNew', 'جديد'],
                  ['isBestSeller', 'الأكثر مبيعاً'],
                ] as [keyof FormState, string][]).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input type="checkbox" checked={formData[key] as boolean}
                      onChange={e => set(key, e.target.checked as any)}
                      className="w-4 h-4 rounded accent-indigo-500" />
                    {label}
                  </label>
                ))}
              </div>
            </Section>

            <div className="md:col-span-2 flex gap-3 justify-end border-t border-white/5 pt-5">
              <button type="button" onClick={closeForm} className="px-5 py-2.5 text-slate-300 hover:bg-white/5 rounded-xl transition-colors text-sm">إلغاء</button>
              <button type="submit" disabled={uploading}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors text-sm font-medium disabled:opacity-50">
                {editingId ? 'حفظ التعديلات' : 'إضافة المنتج'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products Table */}
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
                        <img src={p.images?.[0] || p.imageUrl || `https://picsum.photos/seed/${p.id}/40/40`} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        <div>
                          <p className="text-white font-medium text-sm flex items-center gap-1.5">
                            {p.name}
                            {p.isFeatured && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
                          </p>
                          <p className="text-xs text-slate-500">{p.inspiredBy}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-300">{p.category === 'men' ? 'رجالي' : p.category === 'women' ? 'نسائي' : 'للجنسين'}</td>
                    <td className="py-3 px-4 text-sm">
                      <span className="font-mono font-bold text-indigo-400">{p.price} ج.م</span>
                      {p.compareAtPrice > p.price && (
                        <span className="block text-[10px] text-slate-500 line-through">{p.compareAtPrice} ج.م</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-300">{p.stock ?? '-'}</td>
                    <td className="py-3 px-4">
                      {p.isActive === false ? (
                        <span className="px-2 py-1 rounded-lg text-xs font-medium bg-slate-500/10 text-slate-400">مخفي</span>
                      ) : (
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${(p.stock || 0) > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                          {(p.stock || 0) > 0 ? 'متوفر' : 'نفذ'}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        {canEdit && onUpdate && (
                          <button onClick={() => openEdit(p)} className="p-2 text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors" title="تعديل">
                            <Pencil className="w-4 h-4" />
                          </button>
                        )}
                        {canDelete && (
                          <button onClick={() => setDeleteId(p.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="حذف">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
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
