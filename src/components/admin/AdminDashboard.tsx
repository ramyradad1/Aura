import React from 'react';
import { DollarSign, ShoppingBag, Users, TrendingUp, Package } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface Props {
  orders: any[];
  perfumes: any[];
  users: any[];
}

export default function AdminDashboard({ orders, perfumes, users }: Props) {
  const totalRevenue = orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const processingOrders = orders.filter(o => o.status === 'processing').length;
  const shippedOrders = orders.filter(o => o.status === 'shipped').length;
  const deliveredOrders = orders.filter(o => o.status === 'delivered').length;

  const salesByDate = orders.reduce((acc: any, order) => {
    const date = new Date(order.createdAt).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' });
    if (!acc[date]) acc[date] = 0;
    acc[date] += order.totalAmount || 0;
    return acc;
  }, {});

  const chartData = Object.keys(salesByDate).map(date => ({
    name: date,
    المبيعات: salesByDate[date]
  })).slice(-14);

  const orderStatusData = [
    { name: 'قيد الانتظار', value: pendingOrders },
    { name: 'جاري التجهيز', value: processingOrders },
    { name: 'تم الشحن', value: shippedOrders },
    { name: 'مكتمل', value: deliveredOrders },
  ].filter(d => d.value > 0);

  const STATUS_COLORS = ['#f59e0b', '#3b82f6', '#8b5cf6', '#10b981'];

  const topProducts = perfumes
    .map(p => {
      const orderCount = orders.filter(o => o.items?.some((i: any) => i.id === p.id)).length;
      return { ...p, orderCount };
    })
    .sort((a, b) => b.orderCount - a.orderCount)
    .slice(0, 5);

  const kpis = [
    { title: 'إجمالي الإيرادات', value: `${totalRevenue.toLocaleString()} ج.م`, icon: DollarSign, trend: '+12.4%', color: 'from-emerald-500 to-emerald-600' },
    { title: 'إجمالي الطلبات', value: totalOrders.toString(), icon: Package, trend: '+7.2%', color: 'from-blue-500 to-blue-600' },
    { title: 'العملاء', value: users.length.toString(), icon: Users, trend: '+18.9%', color: 'from-violet-500 to-violet-600' },
    { title: 'متوسط الطلب', value: `${totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(0) : 0} ج.م`, icon: TrendingUp, trend: '+3.1%', color: 'from-amber-500 to-amber-600' },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-[#1e293b] rounded-2xl p-5 border border-white/5 hover:border-white/10 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl bg-linear-to-br ${kpi.color} flex items-center justify-center shadow-lg`}>
                <kpi.icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-lg">{kpi.trend}</span>
            </div>
            <p className="text-xs text-slate-400 mb-1">{kpi.title}</p>
            <h3 className="text-2xl font-bold text-white">{kpi.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-[#1e293b] rounded-2xl p-6 border border-white/5">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-white">نظرة عامة على الإيرادات</h3>
              <p className="text-xs text-slate-400 mt-1">آخر 14 يوم</p>
            </div>
          </div>
          <div className="h-[280px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => `${v}`} />
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff' }} />
                  <Bar dataKey="المبيعات" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">لا توجد بيانات كافية</div>
            )}
          </div>
        </div>

        {/* Orders by Status */}
        <div className="bg-[#1e293b] rounded-2xl p-6 border border-white/5">
          <h3 className="text-lg font-bold text-white mb-6">حالة الطلبات</h3>
          <div className="h-[200px]">
            {orderStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={orderStatusData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value" stroke="none">
                    {orderStatusData.map((_, index) => (
                      <Cell key={index} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">لا توجد طلبات</div>
            )}
          </div>
          <div className="space-y-2 mt-4">
            {orderStatusData.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full bg-${['amber', 'blue', 'violet', 'emerald'][i % 4]}-500`} />
                  <span className="text-slate-300">{item.name}</span>
                </div>
                <span className="text-white font-bold">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-[#1e293b] rounded-2xl p-6 border border-white/5">
        <h3 className="text-lg font-bold text-white mb-4">أفضل المنتجات</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="border-b border-white/5 text-slate-400 text-xs uppercase tracking-wider">
                <th className="pb-3 px-3 font-medium">المنتج</th>
                <th className="pb-3 px-3 font-medium">الفئة</th>
                <th className="pb-3 px-3 font-medium">السعر</th>
                <th className="pb-3 px-3 font-medium">الطلبات</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((p, i) => (
                <tr key={p.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-500 w-5">{i + 1}</span>
                      <img src={p.images?.[0] || `https://picsum.photos/seed/${p.id}/40/40`} alt="" className="w-9 h-9 rounded-lg object-cover" />
                      <span className="text-white font-medium text-sm">{p.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-400 text-sm">{p.category === 'men' ? 'رجالي' : p.category === 'women' ? 'نسائي' : 'للجنسين'}</td>
                  <td className="py-3 px-3 text-indigo-400 font-mono font-bold text-sm">{p.price} ج.م</td>
                  <td className="py-3 px-3 text-white font-bold text-sm">{p.orderCount}</td>
                </tr>
              ))}
              {topProducts.length === 0 && (
                <tr><td colSpan={4} className="py-8 text-center text-slate-500 text-sm">لا توجد بيانات</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
