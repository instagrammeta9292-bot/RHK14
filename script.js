import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    onAuthStateChanged, 
    signOut 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    doc, 
    setDoc, 
    addRef, // standard imports
    getDocs, 
    query, 
    where, 
    orderBy, 
    onSnapshot, 
    serverTimestamp,
    addDoc 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// RHK Configuration Data
const firebaseConfig = {
    apiKey: "AIzaSyAHUju18VBAdDFoQJhsVWp7oUqBxhfwThE",
    authDomain: "rhk-app-e34c6.firebaseapp.com",
    projectId: "rhk-app-e34c6",
    storageBucket: "rhk-app-e34c6.firebasestorage.app",
    messagingSenderId: "1016565109006",
    appId: "1:1016565109006:web:eb7ec260a601a16e5ac75f",
    measurementId: "G-814PTRRQVQ"
};

// Cloudinary Configuration
const CLOUDINARY_CLOUD_NAME = "nhy9lfkt";
const CLOUDINARY_UPLOAD_PRESET = "rhk_upload";

// Initialize Firebase App, Auth & Firestore
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

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

const userList = document.getElementById("userList");
const chatWelcome = document.getElementById("chatWelcome");
const activeChatContainer = document.getElementById("activeChatContainer");
const activeChatUser = document.getElementById("activeChatUser");
const messageContainer = document.getElementById("messageContainer");
const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("messageInput");
const imageInput = document.getElementById("imageInput");
const recordVoiceBtn = document.getElementById("recordVoiceBtn");
const recordingStatus = document.getElementById("recordingStatus");

let isSignUpMode = false;
let currentUser = null;
let activeRecipientUid = null;
let unsubscribeMessages = null;

// Voice Recording variables
let mediaRecorder;
let audioChunks = [];
let isRecording = false;

// Toggle Login/Signup
toggleLink.addEventListener("click", (e) => {
    e.preventDefault();
    isSignUpMode = !isSignUpMode;
    errorMessage.textContent = "";

    if (isSignUpMode) {
        formTitle.textContent = "Create RHK Account";
        formSubtitle.textContent = "Sign up to join the network";
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

// Auth Form Submit
authForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorMessage.textContent = "";

    const cleanUsername = usernameInput.value.trim().toLowerCase();
    const fullEmail = `${cleanUsername}@gmail.com`;
    const password = passwordInput.value;

    try {
        if (isSignUpMode) {
            const userCredential = await createUserWithEmailAndPassword(auth, fullEmail, password);
            // Register user in Firestore directory
            await setDoc(doc(db, "users", userCredential.user.uid), {
                uid: userCredential.user.uid,
                email: fullEmail,
                username: cleanUsername
            });
        } else {
            await signInWithEmailAndPassword(auth, fullEmail, password);
        }
    } catch (error) {
        let msg = error.message;
        if (error.code === 'auth/invalid-credential') msg = "Incorrect username or password.";
        if (error.code === 'auth/email-already-in-use') msg = "This username is already taken.";
        if (error.code === 'auth/weak-password') msg = "Password should be at least 6 characters.";
        errorMessage.textContent = msg;
    }
});

// Auth State Observer
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        authBox.classList.add("hidden");
        dashboardBox.classList.remove("hidden");
        userDisplayEmail.textContent = user.email;

        // Ensure user record exists in Firestore upon login
        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            email: user.email,
            username: user.email.split('@')[0]
        }, { merge: true });

        loadUserDirectory();
    } else {
        currentUser = null;
        authBox.classList.remove("hidden");
        dashboardBox.classList.add("hidden");
        usernameInput.value = "";
        passwordInput.value = "";
        errorMessage.textContent = "";
        if (unsubscribeMessages) unsubscribeMessages();
    }
});

// Logout Handler
logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
});

// Load User Directory for Chat Sidebar
async function loadUserDirectory() {
    userList.innerHTML = "";
    const querySnapshot = await getDocs(collection(db, "users"));
    querySnapshot.forEach((docSnap) => {
        const userData = docSnap.data();
        if (userData.uid !== currentUser.uid) {
            const userDiv = document.createElement("div");
            userDiv.className = "user-item";
            userDiv.textContent = userData.username;
            userDiv.addEventListener("click", () => {
                document.querySelectorAll(".user-item").forEach(item => item.classList.remove("active"));
                userDiv.classList.add("active");
                openChat(userData);
            });
            userList.appendChild(userDiv);
        }
    });
}

// Open Chat with Selected User
function openChat(recipient) {
    activeRecipientUid = recipient.uid;
    activeChatUser.textContent = `Chat with ${recipient.username}`;
    chatWelcome.classList.add("hidden");
    activeChatContainer.classList.remove("hidden");

    if (unsubscribeMessages) unsubscribeMessages();

    // Generate unique chat room ID combining sorted user IDs
    const chatId = [currentUser.uid, activeRecipientUid].sort().join("_");
    const messagesRef = collection(db, "chats", chatId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));

    unsubscribeMessages = onSnapshot(q, (snapshot) => {
        messageContainer.innerHTML = "";
        snapshot.forEach((docSnap) => {
            const msg = docSnap.data();
            appendMessageToUI(msg);
        });
        messageContainer.scrollTop = messageContainer.scrollHeight;
    });
}

// Append Messages (Text, Image, Voice) to DOM
function appendMessageToUI(msg) {
    const msgDiv = document.createElement("div");
    msgDiv.className = `message ${msg.senderId === currentUser.uid ? 'sent' : 'received'}`;

    if (msg.type === 'text') {
        msgDiv.textContent = msg.content;
    } else if (msg.type === 'image') {
        const img = document.createElement("img");
        img.src = msg.content;
        msgDiv.appendChild(img);
    } else if (msg.type === 'audio') {
        const audio = document.createElement("audio");
        audio.controls = true;
        audio.src = msg.content;
        msgDiv.appendChild(audio);
    }

    messageContainer.appendChild(msgDiv);
}

// Send Text Message
messageForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = messageInput.value.trim();
    if (!text || !activeRecipientUid) return;

    messageInput.value = "";
    await sendMediaOrText(text, 'text');
});

// Handle Image Sharing via Cloudinary
imageInput.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file || !activeRecipientUid) return;

    const imageUrl = await uploadToCloudinary(file, "image");
    if (imageUrl) {
        await sendMediaOrText(imageUrl, 'image');
    }
    imageInput.value = "";
});

// Handle Voice Recording
recordVoiceBtn.addEventListener("click", async () => {
    if (!isRecording) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];

            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                const audioUrl = await uploadToCloudinary(audioBlob, "video"); // Cloudinary accepts blobs for video/audio presets
                if (audioUrl) {
                    await sendMediaOrText(audioUrl, 'audio');
                }
            };

            mediaRecorder.start();
            isRecording = true;
            recordingStatus.classList.remove("hidden");
        } catch (err) {
            alert("Microphone permission denied or unavailable.");
        }
    } else {
        mediaRecorder.stop();
        isRecording = false;
        recordingStatus.classList.add("hidden");
    }
});

// Universal Cloudinary Uploader function
async function uploadToCloudinary(fileObj, resourceType) {
    const formData = new FormData();
    formData.append("file", fileObj);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`, {
            method: "POST",
            body: formData
        });
        const data = await response.json();
        return data.secure_url;
    } catch (error) {
        console.error("Cloudinary upload failed:", error);
        alert("Upload failed.");
        return null;
    }
}

// Save message payload to Firestore
async function sendMediaOrText(content, type) {
    const chatId = [currentUser.uid, activeRecipientUid].sort().join("_");
    const messagesRef = collection(db, "chats", chatId, "messages");

    await addDoc(messagesRef, {
        senderId: currentUser.uid,
        recipientId: activeRecipientUid,
        content: content,
        type: type,
        timestamp: serverTimestamp()
    });
}
