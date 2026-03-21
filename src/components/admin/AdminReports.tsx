import React, { useState } from 'react';
import { Download, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface Props {
  orders: any[];
  perfumes: any[];
  users: any[];
}

export default function AdminReports({ orders, perfumes, users }: Props) {
  const [subTab, setSubTab] = useState<'sales' | 'bestSellers' | 'topCategories' | 'ordersSummary' | 'topCustomers'>('sales');

  const subTabs = [
    { id: 'sales', label: 'تقرير المبيعات' },
    { id: 'bestSellers', label: 'الأكثر مبيعاً' },
    { id: 'topCategories', label: 'أفضل الفئات' },
    { id: 'ordersSummary', label: 'ملخص الطلبات' },
    { id: 'topCustomers', label: 'أفضل العملاء' },
  ];

  // Sales by date
  const salesByDate = orders.reduce((acc: any, o) => {
    const date = new Date(o.createdAt).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' });
    if (!acc[date]) acc[date] = { revenue: 0, orders: 0 };
    acc[date].revenue += o.totalAmount || 0;
    acc[date].orders += 1;
    return acc;
  }, {});
  const salesChartData = Object.entries(salesByDate).map(([date, d]: any) => ({ name: date, الإيرادات: d.revenue, الطلبات: d.orders })).slice(-14);

  // Best sellers
  const bestSellers = perfumes.map(p => {
    const sold = orders.reduce((sum, o) => sum + (o.items?.filter((i: any) => i.id === p.id).reduce((s: number, i: any) => s + (i.quantity || 1), 0) || 0), 0);
    return { ...p, sold };
  }).sort((a, b) => b.sold - a.sold).slice(0, 10);

  // Top categories
  const catData = perfumes.reduce((acc: any, p) => {
    const cat = p.category === 'men' ? 'رجالي' : p.category === 'women' ? 'نسائي' : 'للجنسين';
    if (!acc[cat]) acc[cat] = 0;
    acc[cat]++;
    return acc;
  }, {});
  const categoryChartData = Object.entries(catData).map(([name, value]) => ({ name, المنتجات: value }));

  // Orders summary
  const statusCounts = orders.reduce((acc: any, o) => { acc[o.status] = (acc[o.status] || 0) + 1; return acc; }, {});

  // Top customers
  const customerSpend = orders.reduce((acc: any, o) => {
    const uid = o.userId || o.customerEmail || 'anonymous';
    if (!acc[uid]) acc[uid] = { name: o.customerName || o.customerEmail || 'عميل', orders: 0, total: 0 };
    acc[uid].orders++;
    acc[uid].total += o.totalAmount || 0;
    return acc;
  }, {});
  const topCustomers = Object.values(customerSpend).sort((a: any, b: any) => b.total - a.total).slice(0, 10) as any[];

  const exportCSV = () => {
    let csv = '';
    if (subTab === 'sales') {
      csv = 'التاريخ,الإيرادات,الطلبات\n' + salesChartData.map(r => `${r.name},${r.الإيرادات},${r.الطلبات}`).join('\n');
    } else if (subTab === 'bestSellers') {
      csv = 'المنتج,المبيعات,السعر\n' + bestSellers.map(p => `${p.name},${p.sold},${p.price}`).join('\n');
    } else if (subTab === 'topCustomers') {
      csv = 'العميل,الطلبات,الإنفاق\n' + topCustomers.map(c => `${c.name},${c.orders},${c.total}`).join('\n');
    }
    if (csv) {
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `report-${subTab}.csv`; a.click();
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub-tabs */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {subTabs.map(t => (
            <button key={t.id} onClick={() => setSubTab(t.id as any)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${subTab === t.id ? 'bg-indigo-600 text-white' : 'bg-[#1e293b] text-slate-400 hover:text-white border border-white/5'}`}>
              {t.label}
            </button>
          ))}
        </div>
        <button onClick={exportCSV} className="px-4 py-2 bg-[#1e293b] border border-white/5 text-slate-300 rounded-xl text-sm flex items-center gap-2 hover:bg-white/5">
          <Download className="w-4 h-4" /> تصدير CSV
        </button>
      </div>

      {subTab === 'sales' && (
        <div className="space-y-6">
          <div className="bg-[#1e293b] rounded-2xl p-6 border border-white/5">
            <h3 className="text-lg font-bold text-white mb-4">اتجاه الإيرادات</h3>
            <div className="h-[300px]">
              {salesChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff' }} />
                    <Line type="monotone" dataKey="الإيرادات" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : <div className="h-full flex items-center justify-center text-slate-500">لا توجد بيانات</div>}
            </div>
          </div>
          <div className="bg-[#1e293b] rounded-2xl p-6 border border-white/5">
            <h3 className="text-lg font-bold text-white mb-4">الطلبات اليومية</h3>
            <div className="h-[250px]">
              {salesChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff' }} />
                    <Bar dataKey="الطلبات" fill="#10b981" radius={[6, 6, 0, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <div className="h-full flex items-center justify-center text-slate-500">لا توجد بيانات</div>}
            </div>
          </div>
        </div>
      )}

      {subTab === 'bestSellers' && (
        <div className="bg-[#1e293b] rounded-2xl border border-white/5 overflow-hidden">
          <table className="w-full text-right">
            <thead><tr className="border-b border-white/5 text-slate-400 text-xs uppercase tracking-wider">
              <th className="py-4 px-4 font-medium">#</th><th className="py-4 px-4 font-medium">المنتج</th><th className="py-4 px-4 font-medium">المبيعات</th><th className="py-4 px-4 font-medium">السعر</th>
            </tr></thead>
            <tbody>
              {bestSellers.map((p, i) => (
                <tr key={p.id} className="border-b border-white/5 hover:bg-white/2">
                  <td className="py-3 px-4 text-slate-500 text-sm">{i + 1}</td>
                  <td className="py-3 px-4 text-white font-medium text-sm">{p.name}</td>
                  <td className="py-3 px-4 text-emerald-400 font-bold text-sm">{p.sold}</td>
                  <td className="py-3 px-4 text-indigo-400 font-mono text-sm">{p.price} ج.م</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {subTab === 'topCategories' && (
        <div className="bg-[#1e293b] rounded-2xl p-6 border border-white/5">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} width={80} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff' }} />
                <Bar dataKey="المنتجات" fill="#8b5cf6" radius={[0, 6, 6, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {subTab === 'ordersSummary' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'قيد الانتظار', value: statusCounts.pending || 0, color: 'text-amber-400 bg-amber-500/10' },
            { label: 'جاري التجهيز', value: statusCounts.processing || 0, color: 'text-blue-400 bg-blue-500/10' },
            { label: 'تم الشحن', value: statusCounts.shipped || 0, color: 'text-violet-400 bg-violet-500/10' },
            { label: 'مكتمل', value: statusCounts.delivered || 0, color: 'text-emerald-400 bg-emerald-500/10' },
          ].map((s, i) => (
            <div key={i} className="bg-[#1e293b] rounded-2xl p-6 border border-white/5 text-center">
              <p className="text-xs text-slate-400 mb-2">{s.label}</p>
              <p className={`text-3xl font-bold ${s.color.split(' ')[0]}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {subTab === 'topCustomers' && (
        <div className="bg-[#1e293b] rounded-2xl border border-white/5 overflow-hidden">
          <table className="w-full text-right">
            <thead><tr className="border-b border-white/5 text-slate-400 text-xs uppercase tracking-wider">
              <th className="py-4 px-4 font-medium">#</th><th className="py-4 px-4 font-medium">العميل</th><th className="py-4 px-4 font-medium">الطلبات</th><th className="py-4 px-4 font-medium">الإنفاق</th>
            </tr></thead>
            <tbody>
              {topCustomers.map((c, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/2">
                  <td className="py-3 px-4 text-slate-500 text-sm">{i + 1}</td>
                  <td className="py-3 px-4 text-white font-medium text-sm">{c.name}</td>
                  <td className="py-3 px-4 text-slate-300 text-sm">{c.orders}</td>
                  <td className="py-3 px-4 text-indigo-400 font-mono font-bold text-sm">{c.total.toLocaleString()} ج.م</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

