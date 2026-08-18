import React, { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { AlertTriangle, Bell, Package, Phone, MessageSquare, Trash2, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface Props {
  perfumes: any[];
}

export default function AdminAlerts({ perfumes }: Props) {
  const [subTab, setSubTab] = useState<'lowStock' | 'backInStock'>('lowStock');
  const [requests, setRequests] = useState<any[]>([]);
  const [threshold, setThreshold] = useState(5);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadRequests = async () => {
    try {
      setLoading(true);
      const snap = await getDocs(collection(db, 'back_in_stock_requests'));
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() as any }));
      list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setRequests(list);
    } catch (e) {
      console.error('Error loading back in stock requests:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleDeleteRequest = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'back_in_stock_requests', id));
      toast('تم حذف الطلب بنجاح', 'success');
      setRequests(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error(err);
      toast('تعذر حذف الطلب', 'error');
    }
  };

  const getWhatsAppLink = (phone: string, customerName: string, perfumeName: string) => {
    const cleanPhone = (phone || '').replace(/\D/g, '');
    const formattedPhone = cleanPhone.startsWith('01') ? `2${cleanPhone}` : cleanPhone;
    const message = encodeURIComponent(
      `مرحباً ${customerName || 'عميلنا العزيز'} 🌸\nنود إعلامك بأن عطر "${perfumeName || 'المطلوب'}" أصبح متوفراً الآن في Aura Perfumes ويمكنك طلبه مباشرة عبر متجرنا!\nhttps://auraperfumes.eg`
    );
    return `https://wa.me/${formattedPhone}?text=${message}`;
  };

  const lowStockProducts = perfumes.filter(p => (p.stock || 0) <= threshold && (p.stock || 0) >= 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Bell className="w-5 h-5 text-amber-400" /> التنبيهات وإدارة المخزون
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setSubTab('lowStock')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
              subTab === 'lowStock' ? 'bg-amber-600 text-white' : 'bg-[#1e293b] text-slate-400 border border-white/5'
            }`}
          >
            مخزون منخفض ({lowStockProducts.length})
          </button>
          <button
            onClick={() => setSubTab('backInStock')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
              subTab === 'backInStock' ? 'bg-indigo-600 text-white' : 'bg-[#1e293b] text-slate-400 border border-white/5'
            }`}
          >
            طلبات إعادة التوفر ({requests.length})
          </button>
        </div>
      </div>

      {subTab === 'lowStock' && (
        <>
          <div className="flex items-center gap-3">
            <label className="text-sm text-slate-400">حد التنبيه للمخزون:</label>
            <input
              type="number"
              min="0"
              value={threshold}
              onChange={e => setThreshold(Number(e.target.value))}
              placeholder="5"
              title="حد المخزون"
              className="w-20 p-2 bg-[#1e293b] border border-white/5 rounded-lg text-white text-sm focus:border-indigo-500/50 outline-none"
            />
          </div>
          <div className="bg-[#1e293b] rounded-2xl border border-white/5 overflow-hidden">
            {lowStockProducts.length === 0 ? (
              <div className="py-16 text-center text-slate-500">لا توجد منتجات بمخزون منخفض</div>
            ) : (
              <table className="w-full text-right">
                <thead>
                  <tr className="border-b border-white/5 text-slate-400 text-xs uppercase tracking-wider">
                    <th className="py-4 px-4 font-medium">المنتج</th>
                    <th className="py-4 px-4 font-medium">المخزون الحالي</th>
                    <th className="py-4 px-4 font-medium">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockProducts.map(p => (
                    <tr key={p.id} className="border-b border-white/5 hover:bg-white/2">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <img
                          src={p.images?.[0] || p.imageUrl || `https://picsum.photos/seed/${p.id}/40/40`}
                          alt=""
                          className="w-9 h-9 rounded-lg object-cover"
                        />
                        <span className="text-white font-medium text-sm">{p.name}</span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-amber-400 text-sm">{p.stock || 0}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 w-fit ${
                            (p.stock || 0) === 0 ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'
                          }`}
                        >
                          <AlertTriangle className="w-3 h-3" /> {(p.stock || 0) === 0 ? 'نفذ' : 'منخفض'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {subTab === 'backInStock' && (
        <div className="bg-[#1e293b] rounded-2xl border border-white/5 overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-slate-500">جاري التحميل...</div>
          ) : requests.length === 0 ? (
            <div className="py-16 text-center text-slate-500">لا توجد طلبات إعادة توفر مسجلة حالياً</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead>
                  <tr className="border-b border-white/5 text-slate-400 text-xs uppercase tracking-wider">
                    <th className="py-4 px-4 font-medium">المنتج المطلوب</th>
                    <th className="py-4 px-4 font-medium">اسم العميل</th>
                    <th className="py-4 px-4 font-medium">الهاتف / واتساب</th>
                    <th className="py-4 px-4 font-medium">البريد</th>
                    <th className="py-4 px-4 font-medium">تاريخ الطلب</th>
                    <th className="py-4 px-4 font-medium">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map(r => (
                    <tr key={r.id} className="border-b border-white/5 hover:bg-white/2">
                      <td className="py-3 px-4 text-white font-bold text-sm">
                        {r.perfumeName || r.productName || r.perfumeId || r.productId}
                      </td>
                      <td className="py-3 px-4 text-slate-300 text-sm">
                        {r.customerName || 'عميل'}
                      </td>
                      <td className="py-3 px-4 text-amber-400 font-mono text-sm" dir="ltr">
                        {r.phone || '-'}
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-sm" dir="ltr">
                        {r.email || '-'}
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-xs">
                        {r.createdAt ? new Date(r.createdAt).toLocaleString('ar-EG') : '-'}
                      </td>
                      <td className="py-3 px-4 flex items-center gap-2">
                        {r.phone && (
                          <a
                            href={getWhatsAppLink(r.phone, r.customerName, r.perfumeName)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/40 border border-emerald-500/30 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all"
                            title="إرسال رسالة تنبيه للعميل عبر واتساب"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>تنبيه واتساب</span>
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteRequest(r.id)}
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                          title="حذف الطلب"
                        >
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
      )}
    </div>
  );
}
