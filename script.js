// Import Firebase SDK modules from CDN (Modular v10+)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    onAuthStateChanged, 
    signOut 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// --- RHK Configuration Data ---
const firebaseConfig = {
    apiKey: "AIzaSyAHUju18VBAdDFoQJhsVWp7oUqBxhfwThE",
    authDomain: "rhk-app-e34c6.firebaseapp.com",
    projectId: "rhk-app-e34c6",
    storageBucket: "rhk-app-e34c6.firebasestorage.app",
    messagingSenderId: "1016565109006",
    appId: "1:1016565109006:web:eb7ec260a601a16e5ac75f",
    measurementId: "G-814PTRRQVQ"
};

// Cloudinary Configuration References
window.RHK_CLOUDINARY_CONFIG = {
    cloudName: "nhy9lfkt",
    uploadPreset: "rhk_upload"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// --- DOM Elements ---
const authBox = document.getElementById("authBox");
const dashboardBox = document.getElementById("dashboardBox");
const authForm = document.getElementById("authForm");
const usernameInput = document.getElementById("usernameInput");
const passwordInput = document.getElementById("passwordInput");
const submitBtn = document.getElementById("submitBtn");
const formTitle = document.getElementById("formTitle");
