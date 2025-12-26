import { useState, useEffect } from 'react';
import { 
  User,
  onAuthStateChanged,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';

export type UserRole = 'admin' | 'user' | null;

export function useAuth() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Fetch user role from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setRole(userData.role || 'user');
          } else {
            setRole('user');
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
          setRole('user');
        }
      } else {
        setRole(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    
    // Clear pending quiz data when user signs out
    localStorage.removeItem('smartlearning_pending_level');
    localStorage.removeItem('smartlearning_pending_score');
    localStorage.removeItem('smartlearning_pending_total');
    localStorage.removeItem('smartlearning_pending_time');
    localStorage.removeItem('smartlearning_pending_answers');
    
    console.log('Signed out and cleared pending quiz data');
  } catch (error) {
    console.error('Sign out error:', error);
  }
};

  return {
    user,
    role,
    loading,
    isAdmin: role === 'admin',
    isAuthenticated: !!user,
    signOut,
  };
}