import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  User,
} from './firebase';

// Danh sách email chính thức của Tác giả & Các Cộng sự quản trị viên do khách hàng cung cấp
export const AUTHOR_EMAILS: string[] = [
  'maianhpham927@gmail.com',
  'duongtieuvi102@gmail.com',
  'nguyenplinh1002@gmail.com',
  'nguyenlinhph0210@gmail.com',
  'luclamly920@gmail.com',
  'uongthienyenvi123@gmail.com',
  'vivi60810@gmail.com',
  'nhatlinhpham010194@gmail.com',
].map((email) => email.toLowerCase().trim());

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAuthor: boolean;
  role: 'author' | 'reader';
  roleTitle: string;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  isAuthor: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  quickAuthorLogin: (authorEmail: string) => void;
  quickReaderLogin: (nickname: string) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(() => {
    try {
      const saved = localStorage.getItem('mel_user_session');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Helper to construct normalized AppUser object with author privilege verification
  const buildAppUser = (fbUser: User | { uid: string; email?: string | null; displayName?: string | null; photoURL?: string | null }): AppUser => {
    const emailLower = (fbUser.email || '').toLowerCase().trim();
    const isAuthor = AUTHOR_EMAILS.includes(emailLower);

    let roleTitle = 'Độc giả yêu mến';
    if (isAuthor) {
      if (emailLower === 'nhatlinhpham010194@gmail.com' || emailLower === 'maianhpham927@gmail.com') {
        roleTitle = 'Tác giả • Mellifluous';
      } else {
        roleTitle = 'Cộng sự • Ban quản trị';
      }
    }

    return {
      uid: fbUser.uid,
      email: fbUser.email || null,
      displayName: fbUser.displayName || (isAuthor ? 'Mellifluous' : 'Độc giả giấu tên'),
      photoURL: fbUser.photoURL || null,
      isAuthor,
      role: isAuthor ? 'author' : 'reader',
      roleTitle,
    };
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        const appUser = buildAppUser(fbUser);
        setUser(appUser);
        try {
          localStorage.setItem('mel_user_session', JSON.stringify(appUser));
        } catch {}
      } else {
        // Only clear if not using a manual author session in preview
        try {
          const saved = localStorage.getItem('mel_user_session');
          if (!saved) {
            setUser(null);
          }
        } catch {
          setUser(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  // Sign in with Google Popup
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        const appUser = buildAppUser(result.user);
        setUser(appUser);
        try {
          localStorage.setItem('mel_user_session', JSON.stringify(appUser));
        } catch {}
      }
      closeAuthModal();
    } catch (err: any) {
      console.error('Google Sign-In error:', err);
      // In case iframe blocks popup or third-party cookies:
      throw err;
    }
  };

  // Sign in with Email / Password
  const signInWithEmail = async (email: string, pass: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email.trim(), pass);
      if (result.user) {
        const appUser = buildAppUser(result.user);
        setUser(appUser);
        try {
          localStorage.setItem('mel_user_session', JSON.stringify(appUser));
        } catch {}
      }
      closeAuthModal();
    } catch (err: any) {
      console.error('Email sign in error:', err);
      throw err;
    }
  };

  // Register with Email / Password
  const registerWithEmail = async (email: string, pass: string, name: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      if (result.user) {
        if (name.trim()) {
          await updateProfile(result.user, { displayName: name.trim() }).catch(() => {});
        }
        const updatedUser = {
          ...result.user,
          displayName: name.trim() || result.user.displayName,
        };
        const appUser = buildAppUser(updatedUser);
        setUser(appUser);
        try {
          localStorage.setItem('mel_user_session', JSON.stringify(appUser));
        } catch {}
      }
      closeAuthModal();
    } catch (err: any) {
      console.error('Register error:', err);
      throw err;
    }
  };

  // Quick switch / Direct sign-in for Author & Collaborators (ideal for testing in sandboxed iframe or direct access)
  const quickAuthorLogin = (authorEmail: string) => {
    const cleanEmail = authorEmail.toLowerCase().trim();
    const appUser: AppUser = {
      uid: `author_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
      email: cleanEmail,
      displayName: cleanEmail.split('@')[0] === 'nhatlinhpham010194' || cleanEmail.split('@')[0] === 'maianhpham927'
        ? 'Mellifluous (Tác giả chính)'
        : `Cộng sự (${cleanEmail.split('@')[0]})`,
      photoURL: null,
      isAuthor: true,
      role: 'author',
      roleTitle: 'Tác giả & Quản trị viên',
    };
    setUser(appUser);
    try {
      localStorage.setItem('mel_user_session', JSON.stringify(appUser));
    } catch {}
    closeAuthModal();
  };

  // Quick sign-in for Readers / Guests (allows immediate reading & commenting with nickname)
  const quickReaderLogin = (nickname: string) => {
    const trimmed = nickname.trim() || 'Bạn đọc thân thương';
    const appUser: AppUser = {
      uid: `reader_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      email: null,
      displayName: trimmed,
      photoURL: null,
      isAuthor: false,
      role: 'reader',
      roleTitle: 'Độc giả yêu mến',
    };
    setUser(appUser);
    try {
      localStorage.setItem('mel_user_session', JSON.stringify(appUser));
    } catch {}
    closeAuthModal();
  };

  const logout = async () => {
    try {
      await signOut(auth).catch(() => {});
    } finally {
      setUser(null);
      try {
        localStorage.removeItem('mel_user_session');
      } catch {}
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthor: Boolean(user?.isAuthor),
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        signInWithGoogle,
        signInWithEmail,
        registerWithEmail,
        quickAuthorLogin,
        quickReaderLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
