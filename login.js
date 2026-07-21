import { db } from "./firebase.js";

import {
    collection,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const username = document.getElementById("username");
const password = document.getElementById("password");

const loginBtn = document.getElementById("loginBtn");
const loading = document.getElementById("loading");
const message = document.getElementById("message");

loginBtn.addEventListener("click", loginUser);

async function loginUser() {

    message.innerHTML = "";

    const user = username.value.trim();
    const pass = password.value.trim();

    if (user === "" || pass === "") {
        message.innerHTML = "Please enter username and password.";
        return;
    }

    loading.style.display = "block";
    loginBtn.disabled = true;

    try {

        const q = query(
            collection(db, "users"),
            where("username", "==", user),
            where("password", "==", pass)
        );

        const snap = await getDocs(q);

        loading.style.display = "none";
        loginBtn.disabled = false;

        if (snap.empty) {

            message.innerHTML = "Incorrect username or password.";

        } else {

            const data = snap.docs[0].data();

            localStorage.setItem("username", data.username);
            localStorage.setItem("profilePhoto", data.profilePhoto);

            window.location.href = "home.html";

        }

    } catch (error) {

        loading.style.display = "none";
        loginBtn.disabled = false;

        console.error(error);

        message.innerHTML = "Login failed.";

    }

}
