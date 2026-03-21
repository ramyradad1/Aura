import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { ScrollText, RefreshCw } from 'lucide-react';

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch_ = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'audit_logs'));
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() as any }));
      data.sort((a, b) => new Date(b.timestamp || b.createdAt || 0).getTime() - new Date(a.timestamp || a.createdAt || 0).getTime());
      setLogs(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetch_(); }, []);

  const actionBadge = (action: string) => {
    if (action?.includes('create') || action?.includes('add')) return 'bg-emerald-500/10 text-emerald-400';
    if (action?.includes('update') || action?.includes('edit')) return 'bg-blue-500/10 text-blue-400';
    if (action?.includes('delete') || action?.includes('remove')) return 'bg-red-500/10 text-red-400';
    return 'bg-slate-500/10 text-slate-400';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-white flex items-center gap-2"><ScrollText className="w-5 h-5 text-emerald-400" /> سجل التدقيق</h3>
        <button onClick={fetch_} className="px-4 py-2 bg-[#1e293b] border border-white/5 text-slate-300 rounded-xl text-sm flex items-center gap-2 hover:bg-white/5">
          <RefreshCw className="w-4 h-4" /> تحديث
        </button>
      </div>

      <div className="bg-[#1e293b] rounded-2xl border border-white/5 overflow-hidden">
        {loading ? <div className="py-16 text-center text-slate-500">جاري التحميل...</div> : logs.length === 0 ? (
          <div className="py-16 text-center text-slate-500">لا توجد سجلات تدقيق</div>
        ) : (
          <table className="w-full text-right">
            <thead><tr className="border-b border-white/5 text-slate-400 text-xs uppercase tracking-wider">
              <th className="py-4 px-4 font-medium">الوقت</th>
              <th className="py-4 px-4 font-medium">المسؤول</th>
              <th className="py-4 px-4 font-medium">الإجراء</th>
              <th className="py-4 px-4 font-medium">الكيان</th>
              <th className="py-4 px-4 font-medium">التغييرات</th>
            </tr></thead>
            <tbody>
              {logs.slice(0, 50).map(l => (
                <tr key={l.id} className="border-b border-white/5 hover:bg-white/2">
                  <td className="py-3 px-4 text-slate-400 text-xs font-mono" dir="ltr">
                    {l.timestamp ? new Date(l.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                  </td>
                  <td className="py-3 px-4 text-slate-300 text-sm">{l.adminId || l.adminEmail || '-'}</td>
                  <td className="py-3 px-4"><span className={`px-2 py-1 rounded-lg text-xs font-bold ${actionBadge(l.action)}`}>{l.action || '-'}</span></td>
                  <td className="py-3 px-4 text-white text-sm">{l.entity || '-'}</td>
                  <td className="py-3 px-4 text-slate-500 text-xs truncate max-w-[200px]">{typeof l.changes === 'object' ? JSON.stringify(l.changes) : l.changes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

