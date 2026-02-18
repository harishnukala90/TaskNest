// 🔥 Firebase core
import { initializeApp, getApps } from "firebase/app";

// 🔐 Auth + Firestore
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// 📦 Firebase config (from .env)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// 🚫 Prevent multiple app initialization
const app =
  getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApps()[0];

// 🔐 Auth instance
export const auth = getAuth(app);

// 🗄 Firestore instance
export const db = getFirestore(app);
