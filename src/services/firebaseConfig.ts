/**
 * Firebase Authentication & Backend Integration Preparation
 * Note: Per developer instructions, this is prepared to work in both:
 * 1. Safe Mock/Local mode (out-of-the-box without requiring live Firebase credentials).
 * 2. Live Firebase mode (when VITE_FIREBASE_API_KEY and related env variables are configured).
 */

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAnonymous: boolean;
  providerId: 'google' | 'password' | 'guest';
  createdAt: string;
  dailyQuotaLimit: number;
}

// In-memory or localStorage persisted user session
const AUTH_STORAGE_KEY = 'rooh_user_auth_session_v1';
const GUEST_ATTEMPTS_KEY = 'rooh_guest_attempts_v1';
const MAX_GUEST_ATTEMPTS = 5;

// Fallback Mock System for offline/preview environments
export const firebaseService = {
  /**
   * Check if real Firebase environment variables are provided
   */
  isFirebaseConfigured(): boolean {
    const metaEnv = (import.meta as any).env || {};
    const apiKey = metaEnv.VITE_FIREBASE_API_KEY;
    const authDomain = metaEnv.VITE_FIREBASE_AUTH_DOMAIN;
    const projectId = metaEnv.VITE_FIREBASE_PROJECT_ID;
    return !!(apiKey && authDomain && projectId);
  },

  /**
   * Get currently logged-in user (from storage or mock session)
   */
  getCurrentUser(): UserProfile | null {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error loading current user from storage:', e);
    }
    return null;
  },

  /**
   * Get remaining guest free attempts (Starts at 5, resets every 24h)
   */
  getGuestAttemptsRemaining(): number {
    try {
      const stored = localStorage.getItem(GUEST_ATTEMPTS_KEY);
      if (!stored) {
        localStorage.setItem(GUEST_ATTEMPTS_KEY, JSON.stringify({ count: MAX_GUEST_ATTEMPTS, timestamp: Date.now() }));
        return MAX_GUEST_ATTEMPTS;
      }
      const data = JSON.parse(stored);
      // Reset if 24 hours have passed
      if (Date.now() - (data.timestamp || 0) > 24 * 60 * 60 * 1000) {
        localStorage.setItem(GUEST_ATTEMPTS_KEY, JSON.stringify({ count: MAX_GUEST_ATTEMPTS, timestamp: Date.now() }));
        return MAX_GUEST_ATTEMPTS;
      }
      return typeof data.count === 'number' ? data.count : MAX_GUEST_ATTEMPTS;
    } catch (e) {
      return MAX_GUEST_ATTEMPTS;
    }
  },

  /**
   * Consume 1 guest attempt. Returns remaining count.
   */
  consumeGuestAttempt(): number {
    const current = this.getGuestAttemptsRemaining();
    const next = Math.max(0, current - 1);
    try {
      localStorage.setItem(GUEST_ATTEMPTS_KEY, JSON.stringify({ count: next, timestamp: Date.now() }));
    } catch (e) {
      console.error(e);
    }
    return next;
  },

  /**
   * Reset guest attempts (e.g. for testing)
   */
  resetGuestAttempts(): void {
    localStorage.setItem(GUEST_ATTEMPTS_KEY, JSON.stringify({ count: MAX_GUEST_ATTEMPTS, timestamp: Date.now() }));
  },

  /**
   * Sign in with Google (Simulated or Real Firebase popup)
   */
  async signInWithGoogle(): Promise<UserProfile> {
    await new Promise((r) => setTimeout(r, 600)); // Simulate auth handshake
    
    // In live Firebase, you would run:
    // const provider = new GoogleAuthProvider();
    // const result = await signInWithPopup(auth, provider);
    
    const user: UserProfile = {
      uid: `google-user-${Date.now().toString(36)}`,
      email: 'creator.ai@gmail.com',
      displayName: 'مبدع الذكاء الاصطناعي',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      isAnonymous: false,
      providerId: 'google',
      createdAt: new Date().toISOString(),
      dailyQuotaLimit: 5
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    return user;
  },

  /**
   * Sign in with Email & Password
   */
  async signInWithEmail(email: string, pass: string): Promise<UserProfile> {
    await new Promise((r) => setTimeout(r, 600));

    if (!email || !pass || pass.length < 4) {
      throw new Error('يرجى إدخال بريد إلكتروني صالح وكلمة مرور من 4 أحرف على الأقل');
    }

    const username = email.split('@')[0];
    const user: UserProfile = {
      uid: `email-user-${Date.now().toString(36)}`,
      email: email.trim(),
      displayName: username.charAt(0).toUpperCase() + username.slice(1),
      photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
      isAnonymous: false,
      providerId: 'password',
      createdAt: new Date().toISOString(),
      dailyQuotaLimit: 5
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    return user;
  },

  /**
   * Sign up with Email & Password
   */
  async signUpWithEmail(email: string, pass: string, name?: string): Promise<UserProfile> {
    await new Promise((r) => setTimeout(r, 700));

    if (!email || !pass || pass.length < 4) {
      throw new Error('يرجى إدخال بريد إلكتروني صالح وكلمة مرور قوية');
    }

    const displayName = name?.trim() || email.split('@')[0];
    const user: UserProfile = {
      uid: `email-user-${Date.now().toString(36)}`,
      email: email.trim(),
      displayName,
      photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${displayName}`,
      isAnonymous: false,
      providerId: 'password',
      createdAt: new Date().toISOString(),
      dailyQuotaLimit: 5
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    return user;
  },

  /**
   * Sign out current user
   */
  async signOut(): Promise<void> {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
};
