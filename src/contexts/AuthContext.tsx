import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubSnapshot: (() => void) | null = null;
    let loadingTimeout: any = null;

    const unsubscribe = onAuthStateChanged(auth, (fUser) => {
      // Clean up previous snapshot if it exists
      if (unsubSnapshot) {
        unsubSnapshot();
        unsubSnapshot = null;
      }

      setFirebaseUser(fUser);
      
      if (fUser) {
        setLoading(true);
        // Safety timeout to prevent infinite hanging load
        loadingTimeout = setTimeout(() => {
          setLoading(false);
          console.warn("AuthContext: Profile fetch timed out. Proceeding without profile.");
        }, 10000);

        // Use onSnapshot for real-time user profile updates
        const userDocRef = doc(db, 'users', fUser.uid);
        unsubSnapshot = onSnapshot(userDocRef, (docSnap) => {
          if (loadingTimeout) {
            clearTimeout(loadingTimeout);
            loadingTimeout = null;
          }

          if (docSnap.exists()) {
            setUser(docSnap.data() as UserProfile);
          } else {
            console.warn(`AuthContext: User profile not found for UID: ${fUser.uid}`);
            setUser(null);
          }
          setLoading(false);
        }, (error) => {
          if (loadingTimeout) {
            clearTimeout(loadingTimeout);
            loadingTimeout = null;
          }
          console.error("AuthContext Snapshot Error:", error);
          setLoading(false);
        });
      } else {
        setUser(null);
        setFirebaseUser(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
      if (unsubSnapshot) unsubSnapshot();
      if (loadingTimeout) clearTimeout(loadingTimeout);
    };
  }, []);

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
