import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, firebaseService } from '../services/firebaseConfig';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  guestAttemptsRemaining: number;
  isAuthModalOpen: boolean;
  authModalReason: string | null;
  openAuthModal: (reason?: string) => void;
  closeAuthModal: () => void;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signupWithEmail: (email: string, pass: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  consumeAttempt: (actionName?: string) => boolean;
  resetGuestQuota: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => firebaseService.getCurrentUser());
  const [guestAttemptsRemaining, setGuestAttemptsRemaining] = useState<number>(() =>
    firebaseService.getGuestAttemptsRemaining()
  );
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalReason, setAuthModalReason] = useState<string | null>(null);

  const isAuthenticated = !!user;
  const isGuest = !user;

  // Refresh attempts when storage changes
  useEffect(() => {
    setGuestAttemptsRemaining(firebaseService.getGuestAttemptsRemaining());
  }, [user]);

  const openAuthModal = (reason?: string) => {
    setAuthModalReason(reason || 'سجّل دخولك الآن للمتابعة والاستفادة من كافة ميزات الذكاء الاصطناعي');
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthModalReason(null);
  };

  const loginWithGoogle = async () => {
    const loggedIn = await firebaseService.signInWithGoogle();
    setUser(loggedIn);
    closeAuthModal();
  };

  const loginWithEmail = async (email: string, pass: string) => {
    const loggedIn = await firebaseService.signInWithEmail(email, pass);
    setUser(loggedIn);
    closeAuthModal();
  };

  const signupWithEmail = async (email: string, pass: string, name?: string) => {
    const registered = await firebaseService.signUpWithEmail(email, pass, name);
    setUser(registered);
    closeAuthModal();
  };

  const logout = async () => {
    await firebaseService.signOut();
    setUser(null);
    setGuestAttemptsRemaining(firebaseService.getGuestAttemptsRemaining());
  };

  const resetGuestQuota = () => {
    firebaseService.resetGuestAttempts();
    setGuestAttemptsRemaining(firebaseService.getGuestAttemptsRemaining());
  };

  /**
   * Consume 1 attempt for any tool action (Vision analysis, Prompt generation, Video playback, etc.)
   * If user is a Guest and has 0 attempts left, opens the AuthModal and returns false!
   */
  const consumeAttempt = (actionName?: string): boolean => {
    if (isAuthenticated) {
      // Authenticated users enjoy their full account access
      return true;
    }

    const remaining = firebaseService.getGuestAttemptsRemaining();
    if (remaining <= 0) {
      openAuthModal(
        actionName
          ? `لقد استنفدت المحاولات التجريبية الـ 5 كضيف لـ (${actionName}). سجّل دخولك مجاناً عبر جوجل أو البريد للمتابعة.`
          : 'لقد استنفدت المحاولات التجريبية الـ 5 كضيف. سجّل دخولك مجاناً عبر جوجل أو البريد لمتابعة استخدام أدوات الذكاء الاصطناعي.'
      );
      return false;
    }

    const nextCount = firebaseService.consumeGuestAttempt();
    setGuestAttemptsRemaining(nextCount);
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isGuest,
        guestAttemptsRemaining,
        isAuthModalOpen,
        authModalReason,
        openAuthModal,
        closeAuthModal,
        loginWithGoogle,
        loginWithEmail,
        signupWithEmail,
        logout,
        consumeAttempt,
        resetGuestQuota
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
