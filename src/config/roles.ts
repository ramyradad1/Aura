/**
 * Central role & permission model for the admin panel.
 *
 * Firestore rules mirror these roles, so any change here must be reflected in
 * firestore.rules. The client-side checks are for UX only; the rules are the
 * actual security boundary.
 */

export type Role = 'superadmin' | 'admin' | 'editor' | 'user';

export type Permission =
    | 'products.view'
    | 'products.create'
    | 'products.edit'
    | 'products.delete'
    | 'orders.view'
    | 'orders.updateStatus'
    | 'orders.delete'
    | 'users.view'
    | 'users.invite'
    | 'users.changeRole'
    | 'users.delete'
    | 'analytics.view'
    | 'settings.manage';

const ALL_PERMISSIONS: Permission[] = [
    'products.view', 'products.create', 'products.edit', 'products.delete',
    'orders.view', 'orders.updateStatus', 'orders.delete',
    'users.view', 'users.invite', 'users.changeRole', 'users.delete',
    'analytics.view', 'settings.manage',
];

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
    superadmin: ALL_PERMISSIONS,
    admin: [
        'products.view', 'products.create', 'products.edit', 'products.delete',
        'orders.view', 'orders.updateStatus',
        'users.view', 'users.invite',
        'analytics.view',
    ],
    editor: [
        'products.view', 'products.create', 'products.edit',
        'orders.view',
    ],
    user: [],
};

export const ROLE_LABELS: Record<Role, string> = {
    superadmin: 'مدير عام',
    admin: 'مدير',
    editor: 'محرر',
    user: 'مستخدم',
};

/** Roles an actor is allowed to assign. Only a superadmin can mint superadmins. */
export const ASSIGNABLE_ROLES: Record<Role, Role[]> = {
    superadmin: ['superadmin', 'admin', 'editor', 'user'],
    admin: ['editor', 'user'],
    editor: [],
    user: [],
};

export function isRole(value: unknown): value is Role {
    return value === 'superadmin' || value === 'admin' || value === 'editor' || value === 'user';
}

export function normalizeRole(value: unknown): Role {
    return isRole(value) ? value : 'user';
}

export function hasPermission(role: Role | null | undefined, permission: Permission): boolean {
    if (!role) return false;
    return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function canAssignRole(actorRole: Role | null | undefined, targetRole: Role): boolean {
    if (!actorRole) return false;
    return ASSIGNABLE_ROLES[actorRole]?.includes(targetRole) ?? false;
}

/** Roles that may open the admin panel at all. */
export function canAccessAdminPanel(role: Role | null | undefined): boolean {
    return role === 'superadmin' || role === 'admin' || role === 'editor';
}
