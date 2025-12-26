import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your Firebase configuration from Firebase Console
// const firebaseConfig = {
//   apiKey: "AIzaSyANDB7vnGpQThAZH9jaG0yLuS1JihR1MXM",
//   authDomain: "smart-learning-system-bafa3.firebaseapp.com",
//   projectId: "smart-learning-system-bafa3",
//   storageBucket: "smart-learning-system-bafa3.firebasestorage.app",
//   messagingSenderId: "387352404502",
//   appId: "1:387352404502:web:d9ab2464c59c9b9758cb37"
// };

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;