import { db } from "./firebase.js";

import {
    collection,
    query,
    where,
    getDocs,
    addDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const username = document.getElementById("username");
const password = document.getElementById("password");
const photo = document.getElementById("photo");

const createBtn = document.getElementById("createBtn");
const loading = document.getElementById("loading");
const message = document.getElementById("message");

// Cloudinary
const CLOUD_NAME = "nhy9lfkt";
const UPLOAD_PRESET = "rhk_upload";

createBtn.addEventListener("click", createAccount);

async function createAccount() {

    message.innerHTML = "";

    const user = username.value.trim();
    const pass = password.value.trim();
    const file = photo.files[0];

    if (user === "" || pass === "") {
        message.innerHTML = "Please fill all fields.";
        return;
    }

    if (!file) {
        message.innerHTML = "Please choose a profile photo.";
        return;
    }

    loading.style.display = "block";
    createBtn.disabled = true;

    try {

        // Check username already exists
        const q = query(
            collection(db, "users"),
            where("username", "==", user)
        );

        const snap = await getDocs(q);

        if (!snap.empty) {

            loading.style.display = "none";
            createBtn.disabled = false;

            message.innerHTML = "Username already exists.";
            return;
        }

        // Upload image to Cloudinary
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", UPLOAD_PRESET);

        const upload = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
            {
                method: "POST",
                body: formData
            }
        );

        const imageData = await upload.json();

        if (!imageData.secure_url) {

            loading.style.display = "none";
            createBtn.disabled = false;

            message.innerHTML = "Image upload failed.";
            return;
        }

        // Save user in Firestore
        await addDoc(collection(db, "users"), {

            username: user,
            password: pass,
            profilePhoto: imageData.secure_url,
            createdAt: new Date().toISOString()

        });

        loading.style.display = "none";

        alert("Account created successfully!");

        window.location.href = "login.html";

    } catch (error) {

        console.error(error);

        loading.style.display = "none";
        createBtn.disabled = false;

        message.innerHTML = "Something went wrong.";

    }

}
