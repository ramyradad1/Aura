import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';

interface Props {
  orders: any[];
  loading: boolean;
  onUpdateStatus: (orderId: string, status: string) => void;
}

export default function AdminOrders({ orders, loading, onUpdateStatus }: Props) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = orders.filter(o => {
    const matchesSearch = search === '' || o.id.toLowerCase().includes(search.toLowerCase()) || 
      (o.customerName && o.customerName.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusLabel = (s: string) => {
    switch(s) {
      case 'pending': return 'قيد الانتظار';
      case 'processing': return 'جاري التجهيز';
      case 'shipped': return 'تم الشحن';
      case 'delivered': return 'مكتمل';
      default: return s;
    }
  };

  const statusColor = (s: string) => {
    switch(s) {
      case 'pending': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'processing': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'shipped': return 'bg-violet-500/10 text-violet-400 border-violet-500/20';
      case 'delivered': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="بحث برقم الطلب أو اسم العميل..."
            className="w-full pr-10 pl-4 py-2.5 bg-[#1e293b] border border-white/5 rounded-xl text-white placeholder:text-slate-500 focus:border-indigo-500/50 outline-none text-sm"
          />
        </div>
        <select
          value={statusFilter} onChange={e => setStatusFilter(e.target.value)} title="فلتر الحالة"
          className="px-4 py-2.5 bg-[#1e293b] border border-white/5 rounded-xl text-white text-sm focus:border-indigo-500/50 outline-none"
        >
          <option value="all">كل الحالات</option>
          <option value="pending">قيد الانتظار</option>
          <option value="processing">جاري التجهيز</option>
          <option value="shipped">تم الشحن</option>
          <option value="delivered">مكتمل</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-[#1e293b] rounded-2xl border border-white/5 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-500">جاري التحميل...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-500">لا توجد طلبات</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="border-b border-white/5 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="py-4 px-4 font-medium">رقم الطلب</th>
                  <th className="py-4 px-4 font-medium">التاريخ</th>
                  <th className="py-4 px-4 font-medium">الإجمالي</th>
                  <th className="py-4 px-4 font-medium">طريقة الدفع</th>
                  <th className="py-4 px-4 font-medium">الحالة</th>
                  <th className="py-4 px-4 font-medium">إجراء</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(order => (
                  <tr key={order.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                    <td className="py-4 px-4 font-mono text-xs text-slate-400">{order.id.slice(0, 8)}...</td>
                    <td className="py-4 px-4 text-sm text-slate-300" dir="ltr">{new Date(order.createdAt).toLocaleDateString('ar-EG')}</td>
                    <td className="py-4 px-4 font-mono font-bold text-indigo-400">{order.totalAmount} ج.م</td>
                    <td className="py-4 px-4 text-sm text-slate-300">{order.paymentMethod === 'cod' ? 'عند الاستلام' : 'بطاقة'}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-lg text-xs font-medium border ${statusColor(order.status)}`}>
                        {statusLabel(order.status)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <select
                        value={order.status}
                        onChange={e => onUpdateStatus(order.id, e.target.value)} title="تغيير الحالة"
                        className="text-sm px-3 py-1.5 bg-[#0f172a] border border-white/10 rounded-lg text-white outline-none focus:border-indigo-500/50"
                      >
                        <option value="pending">قيد الانتظار</option>
                        <option value="processing">جاري التجهيز</option>
                        <option value="shipped">تم الشحن</option>
                        <option value="delivered">مكتمل</option>
                      </select>
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
