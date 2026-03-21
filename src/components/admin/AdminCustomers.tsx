import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface Props {
  users: any[];
  orders: any[];
}

export default function AdminCustomers({ users, orders }: Props) {
  const [search, setSearch] = useState('');

  const customers = users.map(u => {
    const userOrders = orders.filter(o => o.userId === u.id || o.customerEmail === u.email);
    const totalSpend = userOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const lastOrder = userOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    return { ...u, ordersCount: userOrders.length, totalSpend, lastOrder: lastOrder?.createdAt };
  }).sort((a, b) => b.totalSpend - a.totalSpend);

  const filtered = customers.filter(c =>
    search === '' || c.displayName?.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <h3 className="text-lg font-bold text-white">العملاء ({customers.length})</h3>
        <div className="relative min-w-[240px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث بالاسم أو الإيميل..."
            className="w-full pr-10 pl-4 py-2.5 bg-[#1e293b] border border-white/5 rounded-xl text-white placeholder:text-slate-500 focus:border-indigo-500/50 outline-none text-sm" />
        </div>
      </div>

      <div className="bg-[#1e293b] rounded-2xl border border-white/5 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-500">لا يوجد عملاء</div>
        ) : (
          <table className="w-full text-right">
            <thead><tr className="border-b border-white/5 text-slate-400 text-xs uppercase tracking-wider">
              <th className="py-4 px-4 font-medium">العميل</th>
              <th className="py-4 px-4 font-medium">الهاتف</th>
              <th className="py-4 px-4 font-medium">الطلبات</th>
              <th className="py-4 px-4 font-medium">إجمالي الإنفاق</th>
              <th className="py-4 px-4 font-medium">آخر طلب</th>
            </tr></thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} className="border-b border-white/5 hover:bg-white/2">
                  <td className="py-3 px-4">
                    <p className="text-white font-medium text-sm">{c.displayName || 'بدون اسم'}</p>
                    <p className="text-xs text-slate-500" dir="ltr">{c.email}</p>
                  </td>
                  <td className="py-3 px-4 text-slate-300 text-sm" dir="ltr">{c.phone || '-'}</td>
                  <td className="py-3 px-4 text-white font-bold text-sm">{c.ordersCount}</td>
                  <td className="py-3 px-4 font-mono font-bold text-indigo-400 text-sm">{c.totalSpend.toLocaleString()} ج.م</td>
                  <td className="py-3 px-4 text-slate-400 text-sm" dir="ltr">{c.lastOrder ? new Date(c.lastOrder).toLocaleDateString('ar-EG') : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

