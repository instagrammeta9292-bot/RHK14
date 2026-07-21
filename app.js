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

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/nhy9lfkt/image/upload";
const UPLOAD_PRESET = "rhk_upload";

// Screens
const loginScreen = document.getElementById("login-screen");
const signupScreen = document.getElementById("signup-screen");
const forgotScreen = document.getElementById("forgot-screen");
const dashboardScreen = document.getElementById("dashboard-screen");

// Navigation triggers
document.getElementById("show-signup").addEventListener("click", (e) => { e.preventDefault(); switchView(signupScreen); });
document.getElementById("show-forgot").addEventListener("click", (e) => { e.preventDefault(); switchView(forgotScreen); });
document.getElementById("show-login-from-signup").addEventListener("click", (e) => { e.preventDefault(); switchView(loginScreen); });
document.getElementById("show-login-from-forgot").addEventListener("click", (e) => { e.preventDefault(); switchView(loginScreen); });

const loginBtnAction = document.getElementById("login-btn-action");
const signupBtnAction = document.getElementById("signup-btn-action");
const forgotBtnAction = document.getElementById("forgot-btn-action");
const logoutBtn = document.getElementById("logout-btn");

const avatarInput = document.getElementById("signup-avatar");
const avatarPreview = document.getElementById("avatar-preview");
const avatarPlaceholder = document.getElementById("avatar-placeholder");
const toggleLoginPass = document.getElementById("toggle-login-pass");
const loginPasswordInput = document.getElementById("login-password");

function switchView(targetView) {
    [loginScreen, signupScreen, forgotScreen, dashboardScreen].forEach(v => {
        v.classList.add("hidden");
    });
    targetView.classList.remove("hidden");
}

// Session state management
onAuthStateChanged(auth, async (user) => {
    if (user) {
        try {
            await loadDashboard(user.uid);
            switchView(dashboardScreen);
        } catch (err) {
            console.error("Dashboard session load error:", err);
            switchView(loginScreen);
        }
    } else {
        switchView(loginScreen);
    }
});

// Toggle password view
toggleLoginPass.addEventListener("click", () => {
    const type = loginPasswordInput.getAttribute("type") === "password" ? "text" : "password";
    loginPasswordInput.setAttribute("type", type);
    toggleLoginPass.textContent = type === "password" ? "👁️" : "🙈";
});

// Profile image preview
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

// 1. CREATE NEW ACCOUNT BUTTON
signupBtnAction.addEventListener("click", async () => {
    const username = document.getElementById("signup-username").value.trim();
    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value.trim();
    const file = avatarInput.files[0];

    if (!username || !email || !password || !file) {
        alert("Please complete all fields and select a profile photo.");
        return;
    }

    try {
        signupBtnAction.innerText = "CREATING...";
        signupBtnAction.disabled = true;

        // Check if username already exists in Firestore
        const q = query(collection(db, "users"), where("username", "==", username));
        const snap = await getDocs(q);
        if (!snap.empty) {
            alert("Username is already taken. Choose another.");
            return;
        }

        // Upload photo to Cloudinary
        const photoUrl = await uploadToCloudinary(file);

        // Create Firebase Authentication Account
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCred.user;

        // Save data to Firestore database mapped by user UID
        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            username: username,
            email: email,
            photoUrl: photoUrl
        });

        alert("Account created successfully!");
        await loadDashboard(user.uid);
        switchView(dashboardScreen);
    } catch (error) {
        console.error("Signup error:", error);
        alert(error.message);
    } finally {
        signupBtnAction.innerText = "REGISTER ACCOUNT";
        signupBtnAction.disabled = false;
    }
});

// 2. SIGN IN BUTTON (Using Username Lookups)
loginBtnAction.addEventListener("click", async () => {
    const username = document.getElementById("login-username").value.trim();
    const password = document.getElementById("login-password").value.trim();

    if (!username || !password) {
        alert("Please enter username and password.");
        return;
    }

    try {
        loginBtnAction.innerText = "SIGNING IN...";
        loginBtnAction.disabled = true;

        // Find associated email from Firestore using username
        const q = query(collection(db, "users"), where("username", "==", username));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            alert("Username not found!");
            return;
        }

        const userData = querySnapshot.docs[0].data();
        
        // Sign in using resolved email and user password
        await signInWithEmailAndPassword(auth, userData.email, password);
        await loadDashboard(userData.uid);
        switchView(dashboardScreen);
    } catch (error) {
        console.error("Login error:", error);
        alert("Invalid username or password.");
    } finally {
        loginBtnAction.innerText = "SIGN IN";
        loginBtnAction.disabled = false;
    }
});

// 3. FORGOT PASSWORD BUTTON
forgotBtnAction.addEventListener("click", async () => {
    const email = document.getElementById("forgot-input").value.trim();

    if (!email) {
        alert("Please enter your registered email address.");
        return;
    }

    try {
        forgotBtnAction.innerText = "SENDING...";
        forgotBtnAction.disabled = true;

        await sendPasswordResetEmail(auth, email);
        alert("Password reset link has been sent to your email!");
        switchView(loginScreen);
    } catch (error) {
        console.error("Password reset error:", error);
        alert(error.message);
    } finally {
        forgotBtnAction.innerText = "SEND RESET LINK";
        forgotBtnAction.disabled = false;
    }
});

async function loadDashboard(uid) {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
        const data = userDoc.data();
        document.getElementById("dash-username").innerText = `@${data.username}`;
        document.getElementById("dash-avatar").src = data.photoUrl;
    }
}

// LOGOUT BUTTON
logoutBtn.addEventListener("click", async () => {
    try {
        await signOut(auth);
        switchView(loginScreen);
    } catch (error) {
        console.error("Logout error:", error);
    }
});

