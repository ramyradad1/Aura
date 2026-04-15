import React from 'react';

interface Props {
  users: any[];
  onUpdateRole: (userId: string, role: string) => void;
}

export default function AdminUsers({ users, onUpdateRole }: Props) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-white">المستخدمين ({users.length})</h3>

      <div className="bg-[#1e293b] rounded-2xl border border-white/5 overflow-hidden">
        {users.length === 0 ? (
          <div className="py-16 text-center text-slate-500">لا يوجد مستخدمين</div>
        ) : (
          <table className="w-full text-right">
            <thead><tr className="border-b border-white/5 text-slate-400 text-xs uppercase tracking-wider">
              <th className="py-4 px-4 font-medium">المستخدم</th>
              <th className="py-4 px-4 font-medium">الصلاحية</th>
              <th className="py-4 px-4 font-medium">تاريخ الانضمام</th>
            </tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-white/5 hover:bg-white/2">
                  <td className="py-3 px-4">
                    <p className="text-white font-medium text-sm">{u.displayName || 'بدون اسم'}</p>
                    <p className="text-xs text-slate-500" dir="ltr">{u.email}</p>
                  </td>
                  <td className="py-3 px-4">
                    <select value={u.role || 'user'} onChange={e => onUpdateRole(u.id, e.target.value)} title="الصلاحية"
                      className={`text-xs font-bold px-3 py-1.5 border rounded-lg outline-none transition-colors cursor-pointer ${
                        u.role === 'superadmin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                        u.role === 'admin' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                        u.role === 'editor' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-slate-500/10 text-slate-400 border-slate-500/20'
                      }`}>
                      <option value="user">User</option>
                      <option value="editor">Editor</option>
                      <option value="admin">Admin</option>
                      <option value="superadmin">Super Admin</option>
                    </select>
                  </td>
                  <td className="py-3 px-4 text-slate-400 text-sm" dir="ltr">{u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
