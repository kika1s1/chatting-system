// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "friends-3ef00.firebaseapp.com",
  projectId: "friends-3ef00",
  storageBucket: "friends-3ef00.firebasestorage.app",
  messagingSenderId: "737785796673",
  appId: "1:737785796673:web:90eb05d608bf06867f8ec0"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);