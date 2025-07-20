// Import the necessary Firebase services
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBICZI32fABdPZgbQOHBQXFsJO9dX6gb04",
  authDomain: "investmentprogram-465e1.firebaseapp.com",
  projectId: "investmentprogram-465e1",
  storageBucket: "investmentprogram-465e1.appspot.com", // Fixed the storage bucket
  messagingSenderId: "622413064768",
  appId: "1:622413064768:web:cba70a77d38307745c0da5",
  measurementId: "G-TD7RB02Z92"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Export the services you'll use in your app
export { auth, db, storage };