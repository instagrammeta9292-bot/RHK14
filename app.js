import { auth, db } from "./firebase.js";
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { 
    doc, 
    setDoc, 
    getDoc, 
    collection, 
    query, 
    where, 
    getDocs 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Cloudinary Configuration Data
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/nhy9lfkt/image/upload";
const UPLOAD_PRESET = "rhk_upload";

// DOM Elements
const splashScreen = document.getElementById("splash-screen");
const loginScreen = document.getElementById("login-screen");
const signupScreen = document.getElementById("signup-screen");
const dashboardScreen = document.getElementById("dashboard-screen");

const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");
const logoutBtn = document.getElementById("logout-btn");

const showSignupLink = document.getElementById("show-signup");
const showLoginLink = document.getElementById("show-login");

const avatarInput = document.getElementById("signup-avatar");
const avatarPreview = document.getElementById("avatar-preview");

// Handle image preview selection
avatarInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            avatarPreview.src = event.target.result;
            avatarPreview.classList.remove("hidden");
        };
        reader.readAsDataURL(file);
    }
});

// Switch screens helper
function showScreen(screen) {
    [splashScreen, loginScreen, signupScreen, dashboardScreen].forEach(s => s.classList.add("hidden"));
    screen.classList.remove("hidden");
}

// Splash Screen Logic (Display for 2 seconds, then evaluate auth)
setTimeout(() => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // User session is persistent until logout
            await loadDashboard(user.uid);
            showScreen(dashboardScreen);
        } else {
            showScreen(loginScreen);
        }
    });
}, 2000);

// Toggle Navigation Links
showSignupLink.addEventListener("click", (e) => {
    e.preventDefault();
    showScreen(signupScreen);
});

showLoginLink.addEventListener("click", (e) => {
    e.preventDefault();
    showScreen(loginScreen);
});

// Upload Image to Cloudinary Function
async function uploadToCloudinary(file) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    const response = await fetch(CLOUDINARY_URL, {
        method: "POST",
        body: formData
    });
    const data = await response.json();
    if (data.secure_url) {
        return data.secure_url;
    } else {
        throw new Error("Failed to upload image to Cloudinary");
    }
}

// SIGNUP LOGIC
signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("signup-username").value.trim();
    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value.trim();
    const file = avatarInput.files[0];

    try {
        // 1. Check if username is already taken in Firestore
        const usernameQuery = query(collection(db, "users"), where("username", "==", username));
        const usernameSnapshot = await getDocs(usernameQuery);
        if (!usernameSnapshot.empty) {
            alert("Username is already taken. Choose another one.");
            return;
        }

        // 2. Upload profile photo to Cloudinary
        const photoUrl = await uploadToCloudinary(file);

        // 3. Create Firebase Auth user using email/password
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 4. Save extra profile data (username, photoUrl) mapped to user.uid
        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            username: username,
            email: email,
            photoUrl: photoUrl
        });

        alert("Account created successfully!");
        await loadDashboard(user.uid);
        showScreen(dashboardScreen);
    } catch (error) {
        console.error("Signup error:", error);
        alert(error.message);
    }
});

// LOGIN LOGIC (Using Username mapping to Firebase Email)
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("login-username").value.trim();
    const password = document.getElementById("login-password").value.trim();

    try {
        // Find email associated with the entered username
        const usernameQuery = query(collection(db, "users"), where("username", "==", username));
        const querySnapshot = await getDocs(usernameQuery);

        if (querySnapshot.empty) {
            alert("Username not found!");
            return;
        }

        const userData = querySnapshot.docs[0].data();
        const email = userData.email;

        // Sign in using resolved email and password
        await signInWithEmailAndPassword(auth, email, password);
        await loadDashboard(userData.uid);
        showScreen(dashboardScreen);
    } catch (error) {
        console.error("Login error:", error);
        alert("Invalid login credentials.");
    }
});

// LOAD DASHBOARD DATA
async function loadDashboard(uid) {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
        const data = userDoc.data();
        document.getElementById("dash-username").innerText = `@${data.username}`;
        document.getElementById("dash-avatar").src = data.photoUrl;
    }
}

// LOGOUT LOGIC (Session ends only when user explicitly clicks logout)
logoutBtn.addEventListener("click", async () => {
    try {
        await signOut(auth);
        showScreen(loginScreen);
    } catch (error) {
        console.error("Logout error:", error);
    }
});

