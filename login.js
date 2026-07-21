import { db } from "./firebase.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const username = document.getElementById("username");
const password = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const loading = document.getElementById("loading");
const message = document.getElementById("message");

// Already logged in
if (localStorage.getItem("rhkUser")) {
    window.location.href = "home.html";
}

loginBtn.addEventListener("click", loginUser);

async function loginUser() {

    message.innerHTML = "";

    const user = username.value.trim();
    const pass = password.value.trim();

    if (user === "") {
        message.innerHTML = "Enter username.";
        return;
    }

    if (pass === "") {
        message.innerHTML = "Enter password.";
        return;
    }

    loading.style.display = "block";
    loginBtn.disabled = true;

    try {

        // Username is the document ID
        const ref = doc(db, "users", user);

        const snap = await getDoc(ref);

        loading.style.display = "none";
        loginBtn.disabled = false;

        if (!snap.exists()) {
            message.innerHTML = "User not found.";
            return;
        }

        const data = snap.data();

        if (data.password !== pass) {
            message.innerHTML = "Incorrect password.";
            return;
        }

        // Save login session
        localStorage.setItem("rhkUser", data.username);
        localStorage.setItem("username", data.username);
        localStorage.setItem("profilePhoto", data.profilePhoto);

        window.location.href = "home.html";

    } catch (error) {

        console.error(error);

        loading.style.display = "none";
        loginBtn.disabled = false;

        message.innerHTML = "Login failed. Please try again.";
    }
}
