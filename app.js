import { auth, db } from "./firebase.js";
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    sendPasswordResetEmail,
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

// Views
const loginScreen = document.getElementById("login-screen");
const signupScreen = document.getElementById("signup-screen");
const forgotScreen = document.getElementById("forgot-screen");
const dashboardScreen = document.getElementById("dashboard-screen");

// Navigation Links & Buttons
const showSignupBtn = document.getElementById("show-signup");
const showForgotBtn = document.getElementById("show-forgot");
const showLoginFromSignup = document.getElementById("show-login-from-signup");
const showLoginFromForgot = document.getElementById("show-login-from-forgot");

// Forms & Inputs
const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");
const forgotForm = document.getElementById("forgot-form");
const logoutBtn = document.getElementById("logout-btn");

const avatarInput = document.getElementById("signup-avatar");
const avatarPreview = document.getElementById("avatar-preview");
const avatarPlaceholder = document.getElementById("avatar-placeholder");
const toggleLoginPass = document.getElementById("toggle-login-pass");
const loginPasswordInput = document.getElementById("login-password");

// Screen Switcher
function showView(view) {
    [loginScreen, signupScreen, forgotScreen, dashboardScreen].forEach(v => v.classList.add("hidden"));
    view.classList.remove("hidden");
}

// Check Session on Load (Persistent login)
onAuthStateChanged(auth, async (user) => {
    if (user) {
        try {
            await loadDashboard(user.uid);
            showView(dashboardScreen);
        } catch (err) {
            console.error("Dashboard load error:", err);
            showView(loginScreen);
        }
    } else {
        showView(loginScreen);
    }
});

// View Navigation Actions
showSignupBtn.addEventListener("click", (e) => { e.preventDefault(); showView(signupScreen); });
showForgotBtn.addEventListener("click", (e) => { e.preventDefault(); showView(forgotScreen); });
showLoginFromSignup.addEventListener("click", (e) => { e.preventDefault(); showView(loginScreen); });
showLoginFromForgot.addEventListener("click", (e) => { e.preventDefault(); showView(loginScreen); });

// Toggle password visibility
toggleLoginPass.addEventListener("click", () => {
    const type = loginPasswordInput.getAttribute("type") === "password" ? "text" : "password";
    loginPasswordInput.setAttribute("type", type);
    toggleLoginPass.textContent = type === "password" ? "👁️" : "🙈";
});

// Avatar Preview Handler
avatarInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            avatarPreview.src = event.target.result;
            avatarPreview.classList.remove("hidden");
            avatarPlaceholder.classList.add("hidden");
        };
        reader.readAsDataURL(file);
    }
});

// Upload to Cloudinary Helper
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
        throw new Error("Cloudinary image upload failed.");
    }
}

// 1. CREATE ACCOUNT FUNCTIONALITY
signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("signup-username").value.trim();
    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value.trim();
    const file = avatarInput.files[0];

    try {
        // Verify unique username
        const usernameQuery = query(collection(db, "users"), where("username", "==", username));
        const usernameSnap = await getDocs(usernameQuery);
        if (!usernameSnap.empty) {
            alert("Username is already taken. Please choose another.");
            return;
        }

        // Upload photo & create user
        const photoUrl = await uploadToCloudinary(file);
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCred.user;

        // Save profile mapping to Firestore
        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            username: username,
            email: email,
            photoUrl: photoUrl
        });

        alert("Account created successfully!");
        await loadDashboard(user.uid);
        showView(dashboardScreen);
    } catch (error) {
        console.error("Signup error:", error);
        alert(error.message);
    }
});

// 2. SIGN IN FUNCTIONALITY (Via Username mapping)
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("login-username").value.trim();
    const password = document.getElementById("login-password").value.trim();

    try {
        const usernameQuery = query(collection(db, "users"), where("username", "==", username));
        const querySnapshot = await getDocs(usernameQuery);

        if (querySnapshot.empty) {
            alert("Username not found!");
            return;
        }

        const userData = querySnapshot.docs[0].data();
        await signInWithEmailAndPassword(auth, userData.email, password);
        await loadDashboard(userData.uid);
        showView(dashboardScreen);
    } catch (error) {
        console.error("Login error:", error);
        alert("Invalid username or password.");
    }
});

// 3. FORGOT PASSWORD FUNCTIONALITY
forgotForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const identifier = document.getElementById("forgot-input").value.trim();

    try {
        let emailToReset = identifier;

        // Check if user entered a username instead of an email
        if (!identifier.includes("@")) {
            const usernameQuery = query(collection(db, "users"), where("username", "==", identifier));
            const querySnapshot = await getDocs(usernameQuery);
            if (querySnapshot.empty) {
                alert("No account found with this username.");
                return;
            }
            emailToReset = querySnapshot.docs[0].data().email;
        }

        await sendPasswordResetEmail(auth, emailToReset);
        alert("Password reset link sent to your registered email address.");
        showView(loginScreen);
    } catch (error) {
        console.error("Password reset error:", error);
        alert(error.message);
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

// LOGOUT FUNCTIONALITY
logoutBtn.addEventListener("click", async () => {
    try {
        await signOut(auth);
        showView(loginScreen);
    } catch (error) {
        console.error("Logout error:", error);
    }
});
