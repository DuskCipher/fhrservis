import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Configuration with direct fallbacks to ensure production build on Vercel never crashes
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBozYG9dBv3a3FWbfNE-eITO1UkUmvAKLE",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "database-7db86.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "database-7db86",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "database-7db86.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "874463912704",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:874463912704:web:8f50be46024c935536c9e5",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-RM2W5SXXL1",
};

// Prevent re-initialization if already initialized
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
