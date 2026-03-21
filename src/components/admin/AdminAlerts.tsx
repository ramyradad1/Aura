import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { AlertTriangle, Bell, Package } from 'lucide-react';

interface Props {
  perfumes: any[];
}

export default function AdminAlerts({ perfumes }: Props) {
  const [subTab, setSubTab] = useState<'lowStock' | 'backInStock'>('lowStock');
  const [requests, setRequests] = useState<any[]>([]);
  const [threshold, setThreshold] = useState(5);

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDocs(collection(db, 'back_in_stock_requests'));
        setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() as any })));
      } catch (e) { console.error(e); }
    };
    load();
  }, []);

  const lowStockProducts = perfumes.filter(p => (p.stock || 0) <= threshold && (p.stock || 0) >= 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2"><Bell className="w-5 h-5 text-amber-400" /> التنبيهات</h3>
        <div className="flex gap-2">
          <button onClick={() => setSubTab('lowStock')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${subTab === 'lowStock' ? 'bg-amber-600 text-white' : 'bg-[#1e293b] text-slate-400 border border-white/5'}`}>
            مخزون منخفض ({lowStockProducts.length})
          </button>
          <button onClick={() => setSubTab('backInStock')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${subTab === 'backInStock' ? 'bg-indigo-600 text-white' : 'bg-[#1e293b] text-slate-400 border border-white/5'}`}>
            طلبات إعادة التوفر ({requests.length})
          </button>
        </div>
      </div>

      {subTab === 'lowStock' && (
        <>
          <div className="flex items-center gap-3">
            <label className="text-sm text-slate-400">حد المخزون:</label>
            <input type="number" min="0" value={threshold} onChange={e => setThreshold(Number(e.target.value))} placeholder="5" title="حد المخزون"
              className="w-20 p-2 bg-[#1e293b] border border-white/5 rounded-lg text-white text-sm focus:border-indigo-500/50 outline-none" />
          </div>
          <div className="bg-[#1e293b] rounded-2xl border border-white/5 overflow-hidden">
            {lowStockProducts.length === 0 ? (
              <div className="py-16 text-center text-slate-500">لا توجد منتجات بمخزون منخفض</div>
            ) : (
              <table className="w-full text-right">
                <thead><tr className="border-b border-white/5 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="py-4 px-4 font-medium">المنتج</th>
                  <th className="py-4 px-4 font-medium">المخزون الحالي</th>
                  <th className="py-4 px-4 font-medium">الحالة</th>
                </tr></thead>
                <tbody>
                  {lowStockProducts.map(p => (
                    <tr key={p.id} className="border-b border-white/5 hover:bg-white/2">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <img src={p.images?.[0] || `https://picsum.photos/seed/${p.id}/40/40`} alt="" className="w-9 h-9 rounded-lg object-cover" />
                        <span className="text-white font-medium text-sm">{p.name}</span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-amber-400 text-sm">{p.stock || 0}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 w-fit ${(p.stock || 0) === 0 ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'}`}>
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
          {requests.length === 0 ? (
            <div className="py-16 text-center text-slate-500">لا توجد طلبات إعادة توفر</div>
          ) : (
            <table className="w-full text-right">
              <thead><tr className="border-b border-white/5 text-slate-400 text-xs uppercase tracking-wider">
                <th className="py-4 px-4 font-medium">المنتج</th>
                <th className="py-4 px-4 font-medium">البريد الإلكتروني</th>
                <th className="py-4 px-4 font-medium">التاريخ</th>
              </tr></thead>
              <tbody>
                {requests.map(r => (
                  <tr key={r.id} className="border-b border-white/5 hover:bg-white/2">
                    <td className="py-3 px-4 text-white text-sm">{r.productName || r.productId}</td>
                    <td className="py-3 px-4 text-slate-300 text-sm" dir="ltr">{r.email}</td>
                    <td className="py-3 px-4 text-slate-400 text-sm" dir="ltr">{r.createdAt ? new Date(r.createdAt).toLocaleDateString('ar-EG') : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
