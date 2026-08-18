import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Plus, Trash2, Edit3, Ticket, Sparkles, Copy, Check, AlertTriangle, Loader2 } from 'lucide-react';
import { generateCouponCode } from '../../utils/geminiUtils';
import { useAuth } from '../../context/AuthContext';

export interface Coupon {
  id: string;
  code: string;
  discount: number;
  type: 'percentage' | 'fixed';
  minOrderAmount?: number;
  usageLimit?: number;
  usageCount?: number;
  validUntil?: string;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export default function AdminCoupons() {
  const { can } = useAuth();
  const canEdit = can('settings.manage') || can('products.edit');

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [form, setForm] = useState({
    code: '',
    discount: '',
    type: 'percentage' as 'percentage' | 'fixed',
    minOrderAmount: '',
    usageLimit: '',
    validUntil: '',
    status: 'active' as 'active' | 'inactive',
  });

  const fetchCoupons = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const snap = await getDocs(collection(db, 'coupons'));
      const list = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as Coupon[];
      setCoupons(list);
    } catch (e: any) {
      console.error('Error fetching coupons:', e);
      setErrorMessage('تعذر تحميل الكوبونات من قاعدة البيانات: ' + (e?.message || 'خطأ غير معروف'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const resetForm = () => {
    setForm({
      code: '',
      discount: '',
      type: 'percentage',
      minOrderAmount: '',
      usageLimit: '',
      validUntil: '',
      status: 'active',
    });
    setEditId(null);
    setShowForm(false);
    setAiMessage('');
  };

  const handleOpenEdit = (c: Coupon) => {
    setForm({
      code: c.code,
      discount: String(c.discount || ''),
      type: c.type || 'percentage',
      minOrderAmount: c.minOrderAmount ? String(c.minOrderAmount) : '',
      usageLimit: c.usageLimit ? String(c.usageLimit) : '',
      validUntil: c.validUntil || '',
      status: c.status || 'active',
    });
    setEditId(c.id);
    setShowForm(true);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = form.code.trim().toUpperCase();
    const discountNum = Number(form.discount);

    if (!cleanCode) {
      setErrorMessage('كود الكوبون مطلوب');
      return;
    }
    if (isNaN(discountNum) || discountNum <= 0) {
      setErrorMessage('قيمة الخصم يجب أن تكون رقماً أكبر من صفر');
      return;
    }
    if (form.type === 'percentage' && discountNum > 100) {
      setErrorMessage('نسبة الخصم لا يمكن أن تتجاوز 100%');
      return;
    }

    setSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const payload: Record<string, any> = {
        code: cleanCode,
        discount: discountNum,
        type: form.type,
        minOrderAmount: Number(form.minOrderAmount) || 0,
        usageLimit: Number(form.usageLimit) || 0,
        validUntil: form.validUntil || null,
        status: form.status,
        updatedAt: new Date().toISOString(),
      };

      if (editId) {
        await updateDoc(doc(db, 'coupons', editId), payload);
        setSuccessMessage(`تم تحديث الكوبون ${cleanCode} بنجاح ✓`);
      } else {
        payload.usageCount = 0;
        payload.createdAt = new Date().toISOString();
        const docRef = await addDoc(collection(db, 'coupons'), payload);
        setSuccessMessage(`تم إنشاء الكوبون ${cleanCode} بنجاح ✓`);
      }

      resetForm();
      await fetchCoupons();
    } catch (e: any) {
      console.error('Error saving coupon:', e);
      setErrorMessage('فشل حفظ الكوبون: ' + (e?.message || 'تأكد من صلاحيات الحساب'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`هل أنت متأكد من حذف الكوبون "${code}"؟`)) return;
    setErrorMessage(null);
    try {
      await deleteDoc(doc(db, 'coupons', id));
      setSuccessMessage(`تم حذف الكوبون "${code}" بنجاح`);
      fetchCoupons();
    } catch (e: any) {
      console.error('Error deleting coupon:', e);
      setErrorMessage('فشل حذف الكوبون: ' + (e?.message || 'تأكد من صلاحيات الحساب'));
    }
  };

  const handleAICoupon = async () => {
    const occasion = prompt('اكتب المناسبة أو نوع العرض (مثال: رمضان، صيف، عيد الفطر، رأس السنة، تخفيضات خاصة...)');
    if (!occasion) return;
    setGenerating(true);
    setAiMessage('');
    setErrorMessage(null);
    try {
      const res = await generateCouponCode(occasion);
      setForm(prev => ({
        ...prev,
        code: (res.code || 'AURA10').toUpperCase(),
        discount: String(res.discount || 10),
      }));
      setAiMessage(res.message || '');
      setShowForm(true);
    } catch (e: any) {
      console.error(e);
      setErrorMessage('حدث خطأ أثناء توليد الكوبون بالذكاء الاصطناعي');
    } finally {
      setGenerating(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap gap-3 justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Ticket className="w-5 h-5 text-amber-400" /> الكوبونات وقسائم الخصم ({coupons.length})
          </h3>
          <p className="text-xs text-slate-400 mt-1">إنشاء وإدارة أكواد الخصم الترويجية لمتجر Aura</p>
        </div>

        {canEdit && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleAICoupon}
              disabled={generating}
              className="px-4 py-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl hover:bg-indigo-500/20 border border-indigo-500/20 flex items-center gap-2 text-sm font-medium transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" /> {generating ? 'جاري التوليد...' : 'توليد بالذكاء الاصطناعي'}
            </button>
            <button
              type="button"
              onClick={() => {
                if (showForm) resetForm();
                else {
                  resetForm();
                  setShowForm(true);
                }
              }}
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <Plus className="w-4 h-4" /> {showForm ? 'إغلاق النموذج' : 'كوبون جديد'}
            </button>
          </div>
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

      {/* Add / Edit Form */}
      {showForm && canEdit && (
        <div className="bg-[#1e293b] rounded-2xl p-6 border border-white/5 shadow-xl">
          <h4 className="text-sm font-bold text-white mb-4">
            {editId ? 'تعديل بيانات الكوبون' : 'إضافة كوبون خصم جديد'}
          </h4>

          {aiMessage && (
            <div className="mb-4 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
              <p className="text-xs text-indigo-400 mb-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> رسالة ترويجية مقترحة للكوبون:
              </p>
              <p className="text-sm text-slate-300">{aiMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">كود الكوبون *</label>
              <input
                required
                value={form.code}
                onChange={e => setForm({ ...form, code: e.target.value.toUpperCase().replace(/\s/g, '') })}
                dir="ltr"
                placeholder="AURA20"
                className="w-full p-3 bg-[#0f172a] border border-white/5 rounded-xl text-white focus:border-indigo-500/50 outline-none text-sm font-mono tracking-wider font-bold uppercase"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1.5">قيمة الخصم *</label>
              <input
                required
                type="number"
                min="1"
                step="any"
                value={form.discount}
                onChange={e => setForm({ ...form, discount: e.target.value })}
                placeholder={form.type === 'percentage' ? 'مثال: 15' : 'مثال: 100'}
                className="w-full p-3 bg-[#0f172a] border border-white/5 rounded-xl text-white focus:border-indigo-500/50 outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1.5">نوع الخصم</label>
              <select
                value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value as 'percentage' | 'fixed' })}
                className="w-full p-3 bg-[#0f172a] border border-white/5 rounded-xl text-white focus:border-indigo-500/50 outline-none text-sm"
              >
                <option value="percentage">نسبة مئوية (%)</option>
                <option value="fixed">مبلغ ثابت (ج.م)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1.5">الحد الأدنى للطلب (ج.م)</label>
              <input
                type="number"
                min="0"
                value={form.minOrderAmount}
                onChange={e => setForm({ ...form, minOrderAmount: e.target.value })}
                placeholder="0 = بدون حد أدنى"
                className="w-full p-3 bg-[#0f172a] border border-white/5 rounded-xl text-white focus:border-indigo-500/50 outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1.5">الحد الأقصى لمرات الاستخدام</label>
              <input
                type="number"
                min="0"
                value={form.usageLimit}
                onChange={e => setForm({ ...form, usageLimit: e.target.value })}
                placeholder="0 = استخدام غير محدود"
                className="w-full p-3 bg-[#0f172a] border border-white/5 rounded-xl text-white focus:border-indigo-500/50 outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1.5">تاريخ الانتهاء</label>
              <input
                type="date"
                value={form.validUntil}
                onChange={e => setForm({ ...form, validUntil: e.target.value })}
                className="w-full p-3 bg-[#0f172a] border border-white/5 rounded-xl text-white focus:border-indigo-500/50 outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1.5">حالة الكوبون</label>
              <select
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value as 'active' | 'inactive' })}
                className="w-full p-3 bg-[#0f172a] border border-white/5 rounded-xl text-white focus:border-indigo-500/50 outline-none text-sm"
              >
                <option value="active">مفعّل</option>
                <option value="inactive">معطّل</option>
              </select>
            </div>

            <div className="md:col-span-3 flex gap-3 justify-end pt-2 border-t border-white/5">
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
                {editId ? 'تحديث الكوبون' : 'حفظ الكوبون'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Coupons List */}
      <div className="bg-[#1e293b] rounded-2xl border border-white/5 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-500 flex flex-col items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
            <span>جاري تحميل الكوبونات...</span>
          </div>
        ) : coupons.length === 0 ? (
          <div className="py-16 text-center text-slate-500">لا توجد كوبونات مضافة حالياً. اضغط "كوبون جديد" لإضافة أول كوبون.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="border-b border-white/5 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="py-4 px-4 font-medium">الكود</th>
                  <th className="py-4 px-4 font-medium">قيمة الخصم</th>
                  <th className="py-4 px-4 font-medium">الحد الأدنى</th>
                  <th className="py-4 px-4 font-medium">مرات الاستخدام</th>
                  <th className="py-4 px-4 font-medium">تاريخ الانتهاء</th>
                  <th className="py-4 px-4 font-medium">الحالة</th>
                  <th className="py-4 px-4 font-medium">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map(c => {
                  const isExpired = c.validUntil && new Date(c.validUntil) < new Date(new Date().toDateString());
                  return (
                    <tr key={c.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-amber-400 text-sm bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                            {c.code}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyCode(c.code)}
                            title="نسخ الكود"
                            className="p-1 rounded text-slate-400 hover:text-white transition-colors"
                          >
                            {copiedCode === c.code ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-white text-sm font-bold">
                        {c.type === 'percentage' ? `${c.discount}%` : `${c.discount} ج.م`}
                      </td>

                      <td className="py-3 px-4 text-slate-300 text-sm">
                        {c.minOrderAmount ? `${c.minOrderAmount} ج.م` : 'بدون حد'}
                      </td>

                      <td className="py-3 px-4 text-slate-300 text-sm">
                        {c.usageCount || 0} / {c.usageLimit ? c.usageLimit : '∞'}
                      </td>

                      <td className="py-3 px-4 text-sm" dir="ltr">
                        {c.validUntil ? (
                          <span className={isExpired ? 'text-red-400 font-medium' : 'text-slate-300'}>
                            {c.validUntil} {isExpired ? '(منتهي)' : ''}
                          </span>
                        ) : (
                          <span className="text-slate-500">دائم</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                            c.status === 'active' && !isExpired
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}
                        >
                          {c.status === 'active' && !isExpired ? 'مفعّل' : 'معطّل'}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          {canEdit && (
                            <>
                              <button
                                onClick={() => handleOpenEdit(c)}
                                className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                title="تعديل"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(c.id, c.code)}
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
