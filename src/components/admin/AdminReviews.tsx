import React, { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Star, CheckCircle, XCircle, Trash2, Sparkles, MessageCircle } from 'lucide-react';
import { generateReviewReply } from '../../utils/geminiUtils';

export default function AdminReviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [generatingReply, setGeneratingReply] = useState<string | null>(null);
  const [replies, setReplies] = useState<Record<string, string>>({});

  const fetch_ = async () => {
    try {
      const snap = await getDocs(collection(db, 'reviews'));
      setReviews(snap.docs.map(d => ({ id: d.id, ...d.data() as any })));
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetch_(); }, []);

  const filtered = reviews.filter(r => filter === 'all' || r.status === filter);

  const handleStatus = async (id: string, status: string) => {
    await updateDoc(doc(db, 'reviews', id), { status, updatedAt: new Date().toISOString() });
    fetch_();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل تريد حذف هذا التقييم؟')) return;
    await deleteDoc(doc(db, 'reviews', id));
    fetch_();
  };

  const handleAIReply = async (r: any) => {
    setGeneratingReply(r.id);
    try {
      const res = await generateReviewReply(
        r.reviewerName || r.userEmail || 'عميل',
        r.rating || 3,
        r.comment || '',
        r.productName || r.productId || 'منتج'
      );
      setReplies({ ...replies, [r.id]: res.reply });
    } catch (e) {
      console.error(e);
      alert('حدث خطأ أثناء توليد الرد');
    }
    setGeneratingReply(null);
  };

  const handleSaveReply = async (id: string) => {
    if (!replies[id]) return;
    await updateDoc(doc(db, 'reviews', id), { adminReply: replies[id], repliedAt: new Date().toISOString() });
    const newReplies = { ...replies };
    delete newReplies[id];
    setReplies(newReplies);
    fetch_();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <h3 className="text-lg font-bold text-white">التقييمات ({reviews.length})</h3>
        <div className="flex gap-2">
          {[{ id: 'all', label: 'الكل' }, { id: 'pending', label: 'معلق' }, { id: 'approved', label: 'موافق' }, { id: 'rejected', label: 'مرفوض' }].map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filter === f.id ? 'bg-indigo-600 text-white' : 'bg-[#1e293b] text-slate-400 hover:text-white border border-white/5'}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#1e293b] rounded-2xl border border-white/5 overflow-hidden">
        {loading ? <div className="py-16 text-center text-slate-500">جاري التحميل...</div> : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-500">لا توجد تقييمات</div>
        ) : (
          <div className="divide-y divide-white/5">
            {filtered.map(r => (
              <div key={r.id} className="p-5 hover:bg-white/2 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="text-white font-medium text-sm">{r.productName || r.productId || '-'}</p>
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-medium ${
                        r.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' :
                        r.status === 'rejected' ? 'bg-red-500/10 text-red-400' :
                        'bg-amber-500/10 text-amber-400'
                      }`}>{r.status === 'approved' ? 'موافق' : r.status === 'rejected' ? 'مرفوض' : 'معلق'}</span>
                    </div>
                    <p className="text-xs text-slate-500 mb-1">{r.reviewerName || r.userEmail || '-'}</p>
                    <div className="flex items-center gap-1 mb-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < (r.rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />
                      ))}
                    </div>
                    <p className="text-sm text-slate-300">{r.comment}</p>
                    {r.adminReply && (
                      <div className="mt-2 p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl">
                        <p className="text-xs text-indigo-400 mb-1 flex items-center gap-1"><MessageCircle className="w-3 h-3" /> رد الإدارة</p>
                        <p className="text-xs text-slate-300">{r.adminReply}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => handleAIReply(r)} disabled={generatingReply === r.id}
                      className="p-2 text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors" title="رد بالذكاء الاصطناعي">
                      <Sparkles className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleStatus(r.id, 'approved')} className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors" title="موافقة"><CheckCircle className="w-4 h-4" /></button>
                    <button onClick={() => handleStatus(r.id, 'rejected')} className="p-2 text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors" title="رفض"><XCircle className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(r.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="حذف"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                {/* AI Reply Box */}
                {replies[r.id] && (
                  <div className="mt-3 p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl">
                    <p className="text-xs text-indigo-400 mb-2 flex items-center gap-1"><Sparkles className="w-3 h-3" /> رد مقترح من الذكاء الاصطناعي</p>
                    <textarea value={replies[r.id]} onChange={e => setReplies({ ...replies, [r.id]: e.target.value })}
                      title="admin reply" placeholder="اكتب ردك هنا..."
                      className="w-full p-2 bg-[#0f172a] border border-white/5 rounded-lg text-white text-sm outline-none resize-none h-16" />
                    <div className="flex justify-end gap-2 mt-2">
                      <button onClick={() => { const nr = { ...replies }; delete nr[r.id]; setReplies(nr); }}
                        className="px-3 py-1.5 text-slate-400 hover:bg-white/5 rounded-lg text-xs">إلغاء</button>
                      <button onClick={() => handleSaveReply(r.id)}
                        className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700">إرسال الرد</button>
                    </div>
                  </div>
                )}
                {generatingReply === r.id && (
                  <div className="mt-3 p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl text-center">
                    <p className="text-xs text-indigo-400 animate-pulse">جاري توليد الرد بالذكاء الاصطناعي...</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
