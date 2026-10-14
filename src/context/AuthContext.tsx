import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider, signInWithPopup, signOut, handleFirestoreError, OperationType } from '../firebase';
import { UserPreferences } from '../types/task';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  singleUserMode: boolean;
  setSingleUserMode: (enabled: boolean) => void;
  allowedOwnerEmail: string;
  setAllowedOwnerEmail: (email: string) => void;
  isAuthorized: boolean;
  userPreferences: UserPreferences | null;
  updateUserPreferences: (prefs: Partial<UserPreferences>) => Promise<void>;
  authError: string | null;
  clearAuthError: () => void;
}

const DEFAULT_OWNER_EMAIL = 'marcomatouschek@gmail.com';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);

  // Stored in localStorage so it persists even before / regardless of network state
  const [singleUserMode, setSingleUserModeState] = useState<boolean>(() => {
    const saved = localStorage.getItem('taskpulse_single_user_mode');
    return saved !== null ? saved === 'true' : true; // Default to true for owner security
  });

  const [allowedOwnerEmail, setAllowedOwnerEmailState] = useState<string>(() => {
    const saved = localStorage.getItem('taskpulse_allowed_owner_email');
    return saved || DEFAULT_OWNER_EMAIL;
  });

  const setSingleUserMode = (enabled: boolean) => {
    setSingleUserModeState(enabled);
    localStorage.setItem('taskpulse_single_user_mode', String(enabled));
    if (user) {
      updateUserPreferences({ singleUserMode: enabled });
    }
  };

  const setAllowedOwnerEmail = (email: string) => {
    const clean = email.trim().toLowerCase();
    setAllowedOwnerEmailState(clean);
    localStorage.setItem('taskpulse_allowed_owner_email', clean);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            const data = snap.data() as UserPreferences;
            setUserPreferences(data);
            if (data.singleUserMode !== undefined) {
              setSingleUserModeState(data.singleUserMode);
              localStorage.setItem('taskpulse_single_user_mode', String(data.singleUserMode));
            }
          } else {
            // Initialize user doc
            const initialPrefs: UserPreferences = {
              userId: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || 'TaskPulse User',
              singleUserMode,
              updatedAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, initialPrefs);
            setUserPreferences(initialPrefs);
          }
        } catch (err) {
          console.error('Failed to sync user preferences:', err);
        }
      } else {
        setUserPreferences(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setAuthError(null);
      await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google sign-in failed.';
      console.error('Sign-in error:', err);
      setAuthError(msg);
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
      setAuthError(null);
    } catch (err) {
      console.error('Sign-out error:', err);
    }
  };

  const updateUserPreferences = async (partial: Partial<UserPreferences>) => {
    if (!user) return;
    const path = `users/${user.uid}`;
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const updated: UserPreferences = {
        ...(userPreferences || {
          userId: user.uid,
          email: user.email || '',
          updatedAt: new Date().toISOString(),
        }),
        ...partial,
        userId: user.uid,
        email: user.email || '',
        updatedAt: new Date().toISOString(),
      };
      await setDoc(userDocRef, updated, { merge: true });
      setUserPreferences(updated);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  // Check if current user is authorized under Single-User Lock
  const isAuthorized = React.useMemo(() => {
    if (!user) return false;
    if (!singleUserMode) return true;
    if (!allowedOwnerEmail) return true;
    return user.email?.trim().toLowerCase() === allowedOwnerEmail.trim().toLowerCase();
  }, [user, singleUserMode, allowedOwnerEmail]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        signOutUser,
        singleUserMode,
        setSingleUserMode,
        allowedOwnerEmail,
        setAllowedOwnerEmail,
        isAuthorized,
        userPreferences,
        updateUserPreferences,
        authError,
        clearAuthError: () => setAuthError(null),
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
