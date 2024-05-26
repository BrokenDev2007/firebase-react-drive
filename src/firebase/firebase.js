// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDNyP3bu8GjTkohfrrX0BjdbWvwSeHlB7A",
  authDomain: "brokendev-site.firebaseapp.com",
  projectId: "brokendev-site",
  storageBucket: "brokendev-site.appspot.com",
  messagingSenderId: "1093374307667",
  appId: "1:1093374307667:web:c20a2625efccecea5685a6",
  measurementId: "G-2H7S2YJL5P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

export { auth, firestore, storage, analytics };
