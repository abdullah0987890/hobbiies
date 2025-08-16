// ✅ Updated AuthContext with role-based check and optional dual-role registration
import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  FacebookAuthProvider,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth, db } from '@/firebase';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  name: string | null;
  email: string | null;
  role: 'customer' | 'provider';
  planName?: 'none' | 'Basic' | 'Premium' | 'Enterprise';
  phone?: string;
  description?: string;
  imageUrl?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string, role: 'customer' | 'provider') => Promise<boolean>;
  googleLogin: (role: 'customer' | 'provider') => Promise<boolean>;
  facebookLogin: (role: 'customer' | 'provider') => Promise<boolean>;
  updateSubscription: (planName: 'none' | 'Basic' | 'Premium' | 'Enterprise') => Promise<void>;
  updateUserProfile: (data: { name: string; phone: string; description: string; imageUrl?: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasRedirected, setHasRedirected] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = { id: firebaseUser.uid, ...(userSnap.data() as User) };
          setUser(userData);

          if (!hasRedirected) {
            if (userData.role === 'customer') {
              navigate('/customerDashboard');
            } else {
              navigate('/dashboard');
            }
            setHasRedirected(true);
          }
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
        setHasRedirected(false);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [navigate, hasRedirected]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (err) {
      console.error('Login error:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string, role: 'customer' | 'provider') => {
    setIsLoading(true);
    try {
      // Check if a user with the same email exists but different role
      const q = query(collection(db, 'users'), where('email', '==', email));
      const snapshot = await getDocs(q);

      let existingRole: 'customer' | 'provider' | null = null;
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data?.role !== role) {
          existingRole = data.role;
        }
      });

      if (existingRole) {
        const confirm = window.confirm(
          `This email is already registered as a ${existingRole}. Do you want to also register as a ${role}?`
        );
        if (!confirm) return false;
      }

      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', userCred.user.uid), {
        name,
        email,
        role,
        planName: 'none',
        phone: '',
        description: '',
      });

      return true;
    } catch (err) {
      console.error('Signup error:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const socialLogin = async (
    provider: GoogleAuthProvider | FacebookAuthProvider,
    role: 'customer' | 'provider'
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        if (data.role !== role) {
          const confirm = window.confirm(
            `This email is already registered as a ${data.role}.if you want to also register as a ${role} choose different email`
          );
          if (!confirm) return false;
        }
      } else {
        await setDoc(userRef, {
          name: firebaseUser.displayName,
          email: firebaseUser.email,
          role,
          planName: 'none',
          phone: '',
          description: '',
          imageUrl: firebaseUser.photoURL || '',
        });
      }

      return true;
    } catch (err) {
      console.error('Social login error:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = (role: 'customer' | 'provider') => {
    const provider = new GoogleAuthProvider();
    return socialLogin(provider, role);
  };

  const facebookLogin = (role: 'customer' | 'provider') => {
    const provider = new FacebookAuthProvider();
    return socialLogin(provider, role);
  };

  const updateSubscription = async (planName: 'none' | 'Basic' | 'Premium' | 'Enterprise') => {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, { planName });
      setUser({ ...user, planName });
    } catch (err) {
      console.error('Error updating subscription:', err);
    }
  };

  const updateUserProfile = async (data: { name: string; phone: string; description: string; imageUrl?: string }) => {
    if (!user) return;

    try {
      const batch = writeBatch(db);
      const userRef = doc(db, 'users', user.id);

      const updateData: { [key: string]: any } = {
        name: data.name,
        phone: data.phone,
        description: data.description,
      };
      if (data.imageUrl) updateData.imageUrl = data.imageUrl;

      batch.update(userRef, updateData);

      if (user.role === 'provider') {
        const servicesQuery = query(collection(db, 'services'), where('providerId', '==', user.id));
        const servicesSnap = await getDocs(servicesQuery);

        servicesSnap.forEach((docSnap) => {
          batch.update(docSnap.ref, {
            name: data.name,
            contactPhone: data.phone,
            ...(data.imageUrl && { providerImageUrl: data.imageUrl }),
          });
        });
      }

      await batch.commit();
      setUser({ ...user, ...updateData });
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setHasRedirected(false);
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        googleLogin,
        facebookLogin,
        updateSubscription,
        updateUserProfile,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
