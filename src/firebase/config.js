// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBmocn-VTp5eP3LxLTt-XD2RJnm3jhrmaE",
  authDomain: "superdo-e944b.firebaseapp.com",
  projectId: "superdo-e944b",
  storageBucket: "superdo-e944b.firebasestorage.app",
  messagingSenderId: "317852444156",
  appId: "1:317852444156:web:012e8d05b99c277fbe7e79"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage }; 