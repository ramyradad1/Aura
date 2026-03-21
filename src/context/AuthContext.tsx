import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, onAuthStateChanged, signInWithPopup, signInWithRedirect, 
  getRedirectResult, GoogleAuthProvider, signOut,
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  sendPasswordResetEmail, updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { handleFirestoreError, OperationType } from '../utils/firebaseUtils';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [authError, setAuthError] = useState<Error | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const openAuthModal = () => setIsAuthModalOpen(true);

  const checkAndSetUserRole = async (currentUser: User) => {
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'ramyradad@gmail.com';
        try {
          const userData: any = {
            uid: currentUser.uid,
            email: currentUser.email,
            role: currentUser.email === adminEmail ? 'admin' : 'user',
            createdAt: new Date().toISOString()
          };
          if (currentUser.displayName) {
            userData.displayName = currentUser.displayName;
          }
          await setDoc(userRef, userData);
          setIsAdmin(currentUser.email === adminEmail);
        } catch (createError) {
          handleFirestoreError(createError, OperationType.CREATE, `users/${currentUser.uid}`);
        }
      } else {
        setIsAdmin(userSnap.data().role === 'admin');
      }
    } catch (error) {
      try {
        if (error instanceof Error && error.message.includes('authInfo')) {
          throw error;
        }
        handleFirestoreError(error, OperationType.GET, `users/${currentUser.uid}`);
      } catch (e: any) {
        setAuthError(e);
      }
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
        setIsAdmin(false);
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
      const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'ramyradad@gmail.com';
      const userData: any = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        role: userCredential.user.email === adminEmail ? 'admin' : 'user',
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

  return (
    <AuthContext.Provider value={{ 
      user, isAdmin, isAuthReady, loginError, 
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
