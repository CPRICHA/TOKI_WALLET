// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyC4rWcnOVhEe25tLftQFI32oMUl4fSp7zk",
    authDomain: "skilltrade-67ea2.firebaseapp.com",
    projectId: "skilltrade-67ea2",
    storageBucket: "skilltrade-67ea2.appspot.com",
    messagingSenderId: "381930307884",
    appId: "1:381930307884:web:99f0db9878cb472edd2c89",
    measurementId: "G-PV0G2TPBRE"
  };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
