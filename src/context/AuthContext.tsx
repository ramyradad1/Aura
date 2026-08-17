import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User, onAuthStateChanged, signInWithPopup, signInWithRedirect,
  getRedirectResult, GoogleAuthProvider, signOut,
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  sendPasswordResetEmail, updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';

import { auth, db } from '../firebase';
import { handleFirestoreError, OperationType } from '../utils/firebaseUtils';
import { Role, Permission, hasPermission, normalizeRole, canAccessAdminPanel } from '../config/roles';
import { isBootstrapAdmin, isBootstrapSuperAdmin } from '../config/admins';

interface AuthContextType {
  user: User | null;
  role: Role;
  can: (permission: Permission) => boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isAuthReady: boolean;

  loginError: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (name: string, email: string, pass: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (isOpen: boolean) => void;
  openAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Claims a role reserved by an admin for this email, then consumes the invite.
 * Returns null when there is no pending invite.
 */
async function claimInvitedRole(email: string | null): Promise<Role | null> {
  if (!email) return null;
  const key = email.toLowerCase();
  try {
    const inviteSnap = await getDoc(doc(db, 'roleInvites', key));
    if (!inviteSnap.exists()) return null;
    const invitedRole = normalizeRole(inviteSnap.data().role);
    await deleteDoc(doc(db, 'roleInvites', key)).catch(() => undefined);
    return invitedRole;
  } catch {
    return null;
  }
}


export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>('user');

  const [isAuthReady, setIsAuthReady] = useState(false);
  const [authError, setAuthError] = useState<Error | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const openAuthModal = () => setIsAuthModalOpen(true);

  const checkAndSetUserRole = async (currentUser: User) => {
    // Bootstrap roles come from config/admins.ts so the first superadmin can
    // exist before anybody is able to grant roles from the panel.
    const bootstrapRole: Role = isBootstrapSuperAdmin(currentUser.email)
      ? 'superadmin'
      : isBootstrapAdmin(currentUser.email)
        ? 'admin'
        : 'user';

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // Only non-bootstrap accounts need to look at pending invites.
        const invitedRole = bootstrapRole === 'user'
          ? await claimInvitedRole(currentUser.email)
          : null;

        const initialRole = invitedRole ?? bootstrapRole;
        const userData: Record<string, unknown> = {
          uid: currentUser.uid,
          email: currentUser.email,
          role: initialRole,
          createdAt: new Date().toISOString(),
        };

        if (currentUser.displayName) userData.displayName = currentUser.displayName;

        try {
          await setDoc(userRef, userData);
        } catch (createError) {
          console.warn('Could not create user document:', createError);
        }
        setRole(initialRole);
        return;
      }

      const storedRole = normalizeRole(userSnap.data().role);


      // A bootstrap superadmin always wins, even if the stored doc says otherwise.
      // This is the recovery path if a role was changed by mistake.
      if (bootstrapRole === 'superadmin' && storedRole !== 'superadmin') {
        try {
          await setDoc(userRef, { role: 'superadmin' }, { merge: true });
        } catch (promoteError) {
          console.warn('Could not restore superadmin role:', promoteError);
        }
        setRole('superadmin');
        return;
      }

      setRole(storedRole);
    } catch (error) {
      console.warn('Could not read user document, falling back to email check:', error);
      setRole(bootstrapRole);
    }
  };


  useEffect(() => {
    // Check for redirect result first (for mobile/fallback login)
    getRedirectResult(auth).then((result) => {
      if (result?.user) {
        checkAndSetUserRole(result.user);
      }
    }).catch((error) => {
      console.error('Redirect login error:', error);
    });

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await checkAndSetUserRole(currentUser);
      } else {
        setRole('user');
      }
      setIsAuthReady(true);

    });

    return unsubscribe;
  }, []);

  if (authError) {
    throw authError;
  }

  const login = async () => {
    setLoginError(null);
    const provider = new GoogleAuthProvider();
    try {
      // Try popup first (works on desktop)
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      const code = error?.code || '';

      // If popup blocked or unauthorized domain, try redirect
      if (code === 'auth/popup-blocked' || code === 'auth/unauthorized-domain') {
        try {
          await signInWithRedirect(auth, provider);
          return; // redirect will handle the rest
        } catch (redirectError: any) {
          const msg = getArabicErrorMessage(redirectError?.code || '');
          setLoginError(msg);
          console.error("Redirect login failed", redirectError);
        }
      } else if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        // User closed popup, not an error
        return;
      } else {
        const msg = getArabicErrorMessage(code);
        setLoginError(msg);
        console.error("Login failed", error);
      }
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setLoginError(null);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    setLoginError(null);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error: any) {
      const msg = getArabicErrorMessage(error?.code || '');
      setLoginError(msg);
      throw new Error(msg);
    }
  };

  const registerWithEmail = async (name: string, email: string, pass: string) => {
    setLoginError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(userCredential.user, { displayName: name });

      // Update firestore explicitly
      const userRef = doc(db, 'users', userCredential.user.uid);
      const accountEmail = userCredential.user.email;

      let signupRole: Role = isBootstrapSuperAdmin(accountEmail)
        ? 'superadmin'
        : (isBootstrapAdmin(accountEmail) ? 'admin' : 'user');

      if (signupRole === 'user') {
        signupRole = (await claimInvitedRole(accountEmail)) ?? 'user';
      }

      const userData: any = {
        uid: userCredential.user.uid,
        email: accountEmail,
        role: signupRole,
        createdAt: new Date().toISOString()
      };


      if (name) {
        userData.displayName = name;
      }
      await setDoc(userRef, userData, { merge: true });
    } catch (error: any) {
      const msg = getArabicErrorMessage(error?.code || '');
      setLoginError(msg);
      throw new Error(msg);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      const msg = getArabicErrorMessage(error?.code || '');
      setLoginError(msg);
      throw new Error(msg);
    }
  };

  // Kept for backwards compatibility with existing components. `isAdmin` now
  // means "can open the admin panel", which includes editors.
  const isAdmin = canAccessAdminPanel(role);
  const isSuperAdmin = role === 'superadmin';
  const can = (permission: Permission) => hasPermission(role, permission);

  return (
    <AuthContext.Provider value={{
      user, role, can, isAdmin, isSuperAdmin, isAuthReady, loginError,
      login, logout, loginWithEmail, registerWithEmail, resetPassword,
      isAuthModalOpen, setIsAuthModalOpen, openAuthModal
    }}>

      {children}
    </AuthContext.Provider>
  );
}

function getArabicErrorMessage(code: string): string {
  switch (code) {
    case 'auth/unauthorized-domain':
      return 'هذا النطاق غير مصرح به. يرجى إضافته في إعدادات Firebase.';
    case 'auth/popup-blocked':
      return 'تم حظر النافذة المنبثقة. يرجى السماح بالنوافذ المنبثقة.';
    case 'auth/network-request-failed':
      return 'فشل الاتصال بالشبكة. تحقق من اتصالك بالإنترنت.';
    case 'auth/too-many-requests':
      return 'محاولات كثيرة جداً. حاول مرة أخرى لاحقاً.';
    case 'auth/email-already-in-use':
      return 'البريد الإلكتروني مستخدم بالفعل.';
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'البريد الإلكتروني أكلمة المرور غير صحيحة.';
    case 'auth/weak-password':
      return 'كلمة المرور ضعيفة جداً.';
    case 'auth/invalid-email':
      return 'البريد الإلكتروني غير صالح.';
    case 'auth/internal-error':
      return 'حدث خطأ داخلي. حاول مرة أخرى.';
    default:
      return 'حدث خطأ ما. حاول مرة أخرى.';
  }
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
