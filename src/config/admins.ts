/**
 * Bootstrap admin accounts.
 *
 * These emails get their role assigned automatically the first time they sign in,
 * which is how the very first superadmin exists before anyone can grant roles.
 * Everyone else is promoted from inside the admin panel (Users tab).
 *
 * Override without touching code via .env:
 *   VITE_SUPER_ADMIN_EMAILS=a@x.com,b@x.com
 *   VITE_ADMIN_EMAILS=c@x.com
 */

const parseList = (value?: string): string[] =>
    (value || '')
        .split(',')
        .map(email => email.trim().toLowerCase())
        .filter(Boolean);

const DEFAULT_SUPER_ADMINS = ['ramyradad10@gmail.com', 'ramyradad@gmail.com'];

export const SUPER_ADMIN_EMAILS: string[] = (() => {
    const fromEnv = parseList(
        import.meta.env.VITE_SUPER_ADMIN_EMAILS || import.meta.env.VITE_SUPER_ADMIN_EMAIL
    );
    return fromEnv.length ? fromEnv : DEFAULT_SUPER_ADMINS;
})();

export const ADMIN_EMAILS: string[] = parseList(
    import.meta.env.VITE_ADMIN_EMAILS || import.meta.env.VITE_ADMIN_EMAIL
);

export const isBootstrapSuperAdmin = (email?: string | null): boolean =>
    !!email && SUPER_ADMIN_EMAILS.includes(email.toLowerCase());

export const isBootstrapAdmin = (email?: string | null): boolean =>
    !!email && ADMIN_EMAILS.includes(email.toLowerCase());
