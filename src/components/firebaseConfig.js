// 📌 firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, orderBy, onSnapshot,getDocs,addDoc,deleteDoc,doc } from "firebase/firestore";

// 🔹 إعداد Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBZHA5vpzkwMoyI9uJ3DjJdWqt5pB0wxDo",
  authDomain: "egcc-43204.firebaseapp.com",
  projectId: "egcc-43204",
  storageBucket: "egcc-43204.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// 🔹 تهيئة التطبيق
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, collection, query, orderBy, onSnapshot,getDocs,addDoc , deleteDoc,doc };
