// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC2NtQFzRwIoP_ug8zsV2V_F9fxWLWMLhw",
  authDomain: "hive-insight-3fda5.firebaseapp.com",
  projectId: "hive-insight-3fda5",
  storageBucket: "hive-insight-3fda5.firebasestorage.app",
  messagingSenderId: "812325927793",
  appId: "1:812325927793:web:4175a2e53807a4f90794d0",
  measurementId: "G-B1LBEKFZ0H"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
