// firebase.ts
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
  type Auth,
} from "firebase/auth";
import { collection, getDocs, getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// ✅ Firebase config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
  measurementId: import.meta.env.VITE_MEASUREMENT_ID,
};

// ✅ Initialize Firebase App
const app = initializeApp(firebaseConfig);
export const auth: Auth = getAuth(app);

// ✅ Firestore
export const db = getFirestore(app);
export const storage = getStorage(app);

export const getAllServices = async () => {
  try {
    const servicesRef = collection(db, "services");
    const snapshot = await getDocs(servicesRef);
    const services = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return services;
  } catch (error) {
    console.error("Error fetching services:", error);
    return [];
  }
};
// ✅ Auth Providers
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();

