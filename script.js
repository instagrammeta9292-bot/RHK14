// Import Firebase SDK modules from CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    onAuthStateChanged, 
    signOut 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// RHK Configuration Data (Firebase & Cloudinary settings preserved)
const firebaseConfig = {
    apiKey: "AIzaSyAHUju18VBAdDFoQJhsVWp7oUqBxhfwThE",
    authDomain: "rhk-app-e34c6.firebaseapp.com",
    projectId: "rhk-app-e34c6",
    storageBucket: "rhk-app-e34c6.firebasestorage.app",
    messagingSenderId: "1016565109006",
    appId: "1:1016565109006:web:eb7ec260a601a16e5ac75f",
    measurementId: "G-814PTRRQVQ"
};

// Global Cloudinary Configuration References (Stored for future expansion)
window.RHK_CLOUDINARY_CONFIG = {
    cloudName: "nhy9lfkt",
    uploadPreset: "rhk_upload"
};

// Initialize Firebase App & Auth
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// DOM Elements
const authBox = document.getElementById("authBox");
const dashboardBox = document.getElementById("dashboardBox");
const authForm = document.getElementById("authForm");
const usernameInput = document.getElementById("usernameInput");
const passwordInput = document.getElementById("passwordInput");
const submitBtn = document.getElementById("submitBtn");
const formTitle = document.getElementById("formTitle");
const formSubtitle = document.getElementById("formSubtitle");
const toggleText = document.getElementById("toggleText");
const toggleLink = document.getElementById("toggleLink");
const errorMessage = document.getElementById("errorMessage");
const userDisplayEmail = document.getElementById("userDisplayEmail");
const logoutBtn = document.getElementById("logoutBtn");

// State flag to switch between Login (false) and Signup (true)
let isSignUpMode = false;

// Toggle between Login and Signup modes
toggleLink.addEventListener("click", (e) => {
    e.preventDefault();
    isSignUpMode = !isSignUpMode;
    errorMessage.textContent = "";

    if (isSignUpMode) {
        formTitle.textContent = "Create RHK Account";
        formSubtitle.textContent = "Sign up to join the brand network";
        submitBtn.textContent = "Sign Up";
        toggleText.textContent = "Already have an account?";
        toggleLink.textContent = "Log in";
    } else {
        formTitle.textContent = "RHK Login";
        formSubtitle.textContent = "Enter your credentials to continue";
        submitBtn.textContent = "Log In";
        toggleText.textContent = "Don't have an account?";
        toggleLink.textContent = "Create one";
    }
});

// Handle Form Submission (Login or Sign Up)
authForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorMessage.textContent = "";

    // Automatically construct full Gmail address from username input
    const cleanUsername = usernameInput.value.trim().toLowerCase();
    const fullEmail = `${cleanUsername}@gmail.com`;
    const password = passwordInput.value;

    try {
        if (isSignUpMode) {
            // Create user account in Firebase Auth
            await createUserWithEmailAndPassword(auth, fullEmail, password);
        } else {
            // Log user in
            await signInWithEmailAndPassword(auth, fullEmail, password);
        }
    } catch (error) {
        // Clean up Firebase error messages for user readability
        let msg = error.message;
        if (error.code === 'auth/invalid-credential') {
            msg = "Incorrect username or password.";
        } else if (error.code === 'auth/email-already-in-use') {
            msg = "This username is already taken.";
        } else if (error.code === 'auth/weak-password') {
            msg = "Password should be at least 6 characters.";
        }
        errorMessage.textContent = msg;
    }
});

// Monitor Auth State Changes to Switch Views
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Logged in
        authBox.classList.add("hidden");
        dashboardBox.classList.remove("hidden");
        userDisplayEmail.textContent = user.email.split('@')[0];
    } else {
        // Logged out
        authBox.classList.remove("hidden");
        dashboardBox.classList.add("hidden");
        usernameInput.value = "";
        passwordInput.value = "";
        errorMessage.textContent = "";
    }
});

// Handle Logout
logoutBtn.addEventListener("click", async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Error signing out:", error);
    }
});
