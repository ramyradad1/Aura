import React, { useMemo, useState } from 'react';
import { Shield, Trash2, UserPlus, Mail, X, Check, AlertTriangle } from 'lucide-react';
import { Role, ROLE_LABELS, canAssignRole, normalizeRole } from '../../config/roles';
import { useAuth } from '../../context/AuthContext';

export interface AdminUserRow {
  id: string;
  email?: string;
  displayName?: string;
  role?: string;
  createdAt?: string;
  invited?: boolean;
}

interface Props {
  users: AdminUserRow[];
  invites: AdminUserRow[];
  onUpdateRole: (userId: string, role: Role) => Promise<void> | void;
  onDeleteUser: (userId: string) => Promise<void> | void;
  onInvite: (email: string, role: Role) => Promise<void> | void;
  onRevokeInvite: (email: string) => Promise<void> | void;
}

const roleStyles: Record<Role, string> = {
  superadmin: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  admin: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  editor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  user: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

const ALL_ROLES: Role[] = ['superadmin', 'admin', 'editor', 'user'];

export default function AdminUsers({
  users, invites, onUpdateRole, onDeleteUser, onInvite, onRevokeInvite,
}: Props) {
  const { role: actorRole, user: currentUser, can } = useAuth();

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<Role>('editor');
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<AdminUserRow | null>(null);

  const canChangeRole = can('users.changeRole');
  const canDelete = can('users.delete');
  const canInvite = can('users.invite');

  const assignableRoles = useMemo(
    () => ALL_ROLES.filter(r => canAssignRole(actorRole, r)),
    [actorRole]
  );

  const superAdminCount = useMemo(
    () => users.filter(u => normalizeRole(u.role) === 'superadmin').length,
    [users]
  );

  const handleRoleChange = async (row: AdminUserRow, nextRole: Role) => {
    setBusyId(row.id);
    try {
      await onUpdateRole(row.id, nextRole);
    } finally {
      setBusyId(null);
    }
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = inviteEmail.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setInviteError('البريد الإلكتروني غير صالح');
      return;
    }
    if (users.some(u => u.email?.toLowerCase() === email)) {
      setInviteError('هذا المستخدم موجود بالفعل، عدّل صلاحيته من الجدول');
      return;
    }
    if (!canAssignRole(actorRole, inviteRole)) {
      setInviteError('لا تملك صلاحية منح هذه الرتبة');
      return;
    }

    setInviteError(null);
    setBusyId('invite');
    try {
      await onInvite(email, inviteRole);
      setInviteEmail('');
      setInviteRole('editor');
      setInviteOpen(false);
    } catch {
      setInviteError('فشل إرسال الدعوة، حاول مرة أخرى');
    } finally {
      setBusyId(null);
    }
  };

  /** Guard rails: never let an actor lock the store out of its last superadmin. */
  const deleteBlockedReason = (row: AdminUserRow): string | null => {
    const rowRole = normalizeRole(row.role);
    if (row.id === currentUser?.uid) return 'لا يمكنك حذف حسابك الحالي';
    if (rowRole === 'superadmin' && actorRole !== 'superadmin') return 'المدير العام لا يُحذف إلا بواسطة مدير عام';
    if (rowRole === 'superadmin' && superAdminCount <= 1) return 'لا يمكن حذف آخر مدير عام';
    if (!canAssignRole(actorRole, rowRole)) return 'لا تملك صلاحية على هذا الحساب';
    return null;
  };

  const roleSelectDisabled = (row: AdminUserRow): boolean => {
    const rowRole = normalizeRole(row.role);
    if (!canChangeRole) return true;
    if (row.id === currentUser?.uid) return true; // no self-demotion
    if (rowRole === 'superadmin' && superAdminCount <= 1) return true;
    return !canAssignRole(actorRole, rowRole);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-white">المستخدمين ({users.length})</h3>
          <p className="text-xs text-slate-500 mt-1">
            صلاحيتك الحالية: <span className="text-slate-300 font-medium">{ROLE_LABELS[actorRole]}</span>
          </p>
        </div>

        {canInvite && (
          <button
            type="button"
            onClick={() => { setInviteOpen(v => !v); setInviteError(null); }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-bold transition-colors"
          >
            <UserPlus size={16} aria-hidden="true" />
            دعوة مستخدم
          </button>
        )}
      </div>

      {inviteOpen && canInvite && (
        <form
          onSubmit={handleInviteSubmit}
          className="bg-[#1e293b] rounded-2xl border border-white/5 p-5 space-y-4"
        >
          <div className="flex items-start gap-2 text-xs text-slate-400 bg-white/5 rounded-lg p-3">
            <Mail size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
            <span>
              الدعوة بتحفظ الرتبة للإيميل ده. أول ما يسجّل دخول بنفس البريد، بياخد الصلاحية تلقائياً.
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-[1fr_auto_auto]">
            <div>
              <label htmlFor="invite-email" className="block text-xs font-medium text-slate-400 mb-1.5">
                البريد الإلكتروني
              </label>
              <input
                id="invite-email"
                type="email"
                dir="ltr"
                required
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-[#0f172a] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-400"
              />
            </div>

            <div>
              <label htmlFor="invite-role" className="block text-xs font-medium text-slate-400 mb-1.5">
                الرتبة
              </label>
              <select
                id="invite-role"
                value={inviteRole}
                onChange={e => setInviteRole(e.target.value as Role)}
                className="bg-[#0f172a] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-400"
              >
                {assignableRoles.map(r => (
                  <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end gap-2">
              <button
                type="submit"
                disabled={busyId === 'invite'}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white text-sm font-bold transition-colors"
              >
                <Check size={15} aria-hidden="true" />
                حفظ
              </button>
              <button
                type="button"
                onClick={() => { setInviteOpen(false); setInviteError(null); }}
                className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
                aria-label="إلغاء"
              >
                <X size={15} aria-hidden="true" />
              </button>
            </div>
          </div>

          {inviteError && (
            <p role="alert" className="text-xs text-red-400 flex items-center gap-1.5">
              <AlertTriangle size={13} aria-hidden="true" />
              {inviteError}
            </p>
          )}
        </form>
      )}

      {invites.length > 0 && (
        <div className="bg-[#1e293b] rounded-2xl border border-white/5 p-5">
          <h4 className="text-sm font-bold text-white mb-3">دعوات معلّقة ({invites.length})</h4>
          <ul className="space-y-2">
            {invites.map(inv => (
              <li key={inv.id} className="flex items-center justify-between gap-3 bg-white/5 rounded-lg px-3 py-2.5">
                <span className="text-sm text-slate-300" dir="ltr">{inv.email}</span>
                <div className="flex items-center gap-3">
                  <span className={`text-[11px] font-bold px-2.5 py-1 border rounded-lg ${roleStyles[normalizeRole(inv.role)]}`}>
                    {ROLE_LABELS[normalizeRole(inv.role)]}
                  </span>
                  {canInvite && (
                    <button
                      type="button"
                      onClick={() => onRevokeInvite(inv.email || inv.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      aria-label={`إلغاء دعوة ${inv.email}`}
                    >
                      <X size={14} aria-hidden="true" />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-[#1e293b] rounded-2xl border border-white/5 overflow-hidden">
        {users.length === 0 ? (
          <div className="py-16 text-center text-slate-500">لا يوجد مستخدمين</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <caption className="sr-only">قائمة المستخدمين وصلاحياتهم</caption>
              <thead>
                <tr className="border-b border-white/5 text-slate-400 text-xs uppercase tracking-wider">
                  <th scope="col" className="py-4 px-4 font-medium">المستخدم</th>
                  <th scope="col" className="py-4 px-4 font-medium">الصلاحية</th>
                  <th scope="col" className="py-4 px-4 font-medium">تاريخ الانضمام</th>
                  <th scope="col" className="py-4 px-4 font-medium">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => {
                  const rowRole = normalizeRole(u.role);
                  const blockedReason = deleteBlockedReason(u);
                  const selectDisabled = roleSelectDisabled(u);

                  return (
                    <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="py-3 px-4">
                        <p className="text-white font-medium text-sm flex items-center gap-2">
                          {u.displayName || 'بدون اسم'}
                          {rowRole === 'superadmin' && (
                            <Shield size={13} className="text-purple-400" aria-label="مدير عام" />
                          )}
                          {u.id === currentUser?.uid && (
                            <span className="text-[10px] text-slate-500">(أنت)</span>
                          )}
                        </p>
                        <p className="text-xs text-slate-500" dir="ltr">{u.email}</p>
                      </td>

                      <td className="py-3 px-4">
                        <select
                          value={rowRole}
                          disabled={selectDisabled || busyId === u.id}
                          onChange={e => handleRoleChange(u, e.target.value as Role)}
                          aria-label={`صلاحية ${u.email || u.displayName || 'المستخدم'}`}
                          className={`text-xs font-bold px-3 py-1.5 border rounded-lg outline-none transition-colors ${roleStyles[rowRole]} ${selectDisabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          {/* Current role stays visible even if the actor can't assign it */}
                          {!assignableRoles.includes(rowRole) && (
                            <option value={rowRole}>{ROLE_LABELS[rowRole]}</option>
                          )}
                          {assignableRoles.map(r => (
                            <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                          ))}
                        </select>
                      </td>

                      <td className="py-3 px-4 text-slate-400 text-sm" dir="ltr">
                        {u.createdAt
                          ? new Date(u.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                          : '-'}
                      </td>

                      <td className="py-3 px-4">
                        {canDelete && (
                          <button
                            type="button"
                            disabled={!!blockedReason}
                            title={blockedReason || 'حذف المستخدم'}
                            onClick={() => setConfirmDelete(u)}
                            className="p-2 rounded-lg text-slate-400 enabled:hover:text-red-400 enabled:hover:bg-red-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            aria-label={`حذف ${u.email || u.displayName || 'المستخدم'}`}
                          >
                            <Trash2 size={15} aria-hidden="true" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-user-title"
        >
          <div className="bg-[#1e293b] rounded-2xl border border-white/10 p-6 w-full max-w-md space-y-4">
            <h4 id="delete-user-title" className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle size={17} className="text-red-400" aria-hidden="true" />
              تأكيد حذف المستخدم
            </h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              هيتم حذف سجل <span className="text-white" dir="ltr">{confirmDelete.email}</span> وصلاحياته من المتجر.
              الإجراء ده مش بيلغي حساب الدخول نفسه من Firebase Authentication، فلازم تحذفه من الكونسول لو عايز تمنع الدخول تماماً.
            </p>
            <div className="flex gap-2 justify-end pt-1">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-medium transition-colors"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={async () => {
                  const target = confirmDelete;
                  setConfirmDelete(null);
                  setBusyId(target.id);
                  try {
                    await onDeleteUser(target.id);
                  } finally {
                    setBusyId(null);
                  }
                }}
                className="px-4 py-2.5 rounded-lg bg-red-500 hover:bg-red-400 text-white text-sm font-bold transition-colors"
              >
                حذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
