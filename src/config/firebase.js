import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getFunctions } from 'firebase/functions';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyAvPADln9jD2jVnCXo65WtWlj-Ua0JUTRY",
  authDomain: "seo-hackathon-3ab5d.firebaseapp.com",
  projectId: "seo-hackathon-3ab5d",
  storageBucket: "seo-hackathon-3ab5d.firebasestorage.app",
  messagingSenderId: "170974079414",
  appId: "1:170974079414:web:a20db6c47c2449a86f3917",
  measurementId: "G-Y2VHK91E1W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const functions = getFunctions(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

export default app; 