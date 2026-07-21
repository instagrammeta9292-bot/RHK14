import { db } from "./firebase.js";

import {
    doc,
    getDoc,
    setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const CLOUD_NAME = "nhy9lfkt";
const UPLOAD_PRESET = "rhk_upload";

const username = document.getElementById("username");
const password = document.getElementById("password");
const photo = document.getElementById("photo");

const createBtn = document.getElementById("createBtn");
const loading = document.getElementById("loading");
const message = document.getElementById("message");

createBtn.addEventListener("click", createAccount);

async function createAccount() {

    message.textContent = "";

    const user = username.value.trim();
    const pass = password.value.trim();
    const file = photo.files[0];

    if (user.length < 4) {
        message.textContent = "Username must be at least 4 characters.";
        return;
    }

    if (pass.length < 6) {
        message.textContent = "Password must be at least 6 characters.";
        return;
    }

    if (!file) {
        message.textContent = "Please select a profile photo.";
        return;
    }

    loading.style.display = "block";
    createBtn.disabled = true;

    try {

        // Check if username already exists
        const userRef = doc(db, "users", user);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {

            loading.style.display = "none";
            createBtn.disabled = false;

            message.textContent = "Username already exists.";
            return;
        }

        // Upload image to Cloudinary
        const formData = new FormData();

        formData.append("file", file);
        formData.append("upload_preset", UPLOAD_PRESET);

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
            {
                method: "POST",
                body: formData
            }
        );

        const image = await response.json();

        if (!image.secure_url) {

            loading.style.display = "none";
            createBtn.disabled = false;

            message.textContent = "Image upload failed.";
            return;
        }

        const profilePhoto = image.secure_url;
                // Save user in Firestore
        await setDoc(userRef, {
            username: user,
            password: pass,
            profilePhoto: profilePhoto,
            createdAt: new Date().toISOString()
        });

        loading.style.display = "none";
        createBtn.disabled = false;

        alert("Account created successfully!");

        // Redirect to login page
        window.location.href = "login.html";

    } catch (error) {

        console.error(error);

        loading.style.display = "none";
        createBtn.disabled = false;

        message.textContent = "Failed to create account. Please try again.";

    }

}
