import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { Activity, RefreshCw } from 'lucide-react';

export default function AdminDiagnostics() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [levelFilter, setLevelFilter] = useState('all');

  const fetch_ = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'diagnostics_logs'));
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() as any }));
      data.sort((a, b) => new Date(b.timestamp || b.createdAt || 0).getTime() - new Date(a.timestamp || a.createdAt || 0).getTime());
      setLogs(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetch_(); }, []);

  const filtered = logs.filter(l => levelFilter === 'all' || l.level === levelFilter);

  const levelBadge = (level: string) => {
    switch (level) {
      case 'error': return 'bg-red-500/10 text-red-400';
      case 'warn': return 'bg-amber-500/10 text-amber-400';
      case 'perf': return 'bg-blue-500/10 text-blue-400';
      default: return 'bg-slate-500/10 text-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2"><Activity className="w-5 h-5 text-cyan-400" /> التشخيصات</h3>
        <div className="flex gap-2">
          <select value={levelFilter} onChange={e => setLevelFilter(e.target.value)} title="مستوى التصفية"
            className="px-3 py-2 bg-[#1e293b] border border-white/5 rounded-xl text-white text-sm focus:border-indigo-500/50 outline-none">
            <option value="all">كل المستويات</option>
            <option value="error">Error</option>
            <option value="warn">Warning</option>
            <option value="perf">Performance</option>
            <option value="info">Info</option>
          </select>
          <button onClick={fetch_} className="px-4 py-2 bg-[#1e293b] border border-white/5 text-slate-300 rounded-xl text-sm flex items-center gap-2 hover:bg-white/5">
            <RefreshCw className="w-4 h-4" /> تحديث
          </button>
        </div>
      </div>

      <div className="bg-[#1e293b] rounded-2xl border border-white/5 overflow-hidden">
        {loading ? <div className="py-16 text-center text-slate-500">جاري التحميل...</div> : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-500">لا توجد سجلات تشخيصية</div>
        ) : (
          <table className="w-full text-right">
            <thead><tr className="border-b border-white/5 text-slate-400 text-xs uppercase tracking-wider">
              <th className="py-4 px-4 font-medium">الوقت</th>
              <th className="py-4 px-4 font-medium">المستوى</th>
              <th className="py-4 px-4 font-medium">المصدر</th>
              <th className="py-4 px-4 font-medium">الإجراء</th>
              <th className="py-4 px-4 font-medium">المدة</th>
              <th className="py-4 px-4 font-medium">التفاصيل</th>
            </tr></thead>
            <tbody>
              {filtered.slice(0, 50).map(l => (
                <tr key={l.id} className="border-b border-white/5 hover:bg-white/2">
                  <td className="py-3 px-4 text-slate-400 text-xs font-mono" dir="ltr">{l.timestamp ? new Date(l.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '-'}</td>
                  <td className="py-3 px-4"><span className={`px-2 py-1 rounded-lg text-xs font-bold uppercase ${levelBadge(l.level)}`}>{l.level || 'info'}</span></td>
                  <td className="py-3 px-4 text-slate-300 text-sm">{l.source || '-'}</td>
                  <td className="py-3 px-4 text-white text-sm">{l.action || '-'}</td>
                  <td className="py-3 px-4 text-slate-400 text-sm font-mono" dir="ltr">{l.duration ? `${l.duration}ms` : '-'}</td>
                  <td className="py-3 px-4 text-slate-500 text-xs truncate max-w-[200px]">{l.details || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
