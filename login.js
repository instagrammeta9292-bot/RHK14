// ==========================
// RHK CHAT - Login
// ==========================

// Already logged in?
auth.onAuthStateChanged(async (user) => {

    if (!user) return;

    try {

        const doc = await db.collection("users").doc(user.uid).get();

        if (doc.exists) {
            window.location = "home.html";
        } else {
            window.location = "profile.html";
        }

    } catch (e) {
        console.log(e);
    }

});

// --------------------------
// Login Button
// --------------------------

const loginBtn = document.getElementById("loginBtn");

loginBtn.addEventListener("click", loginUser);

async function loginUser() {

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (email === "" || password === "") {

        alert("Please enter email and password.");

        return;
    }

    try {

        await auth.signInWithEmailAndPassword(email, password);

        // auth.onAuthStateChanged() above
        // will automatically redirect.

    } catch (error) {

        let msg = "Login failed.";

        switch (error.code) {

            case "auth/user-not-found":
                msg = "Account not found.";
                break;

            case "auth/wrong-password":
                msg = "Incorrect password.";
                break;

            case "auth/invalid-email":
                msg = "Invalid email address.";
                break;

            case "auth/invalid-credential":
                msg = "Incorrect email or password.";
                break;

            case "auth/too-many-requests":
                msg = "Too many attempts. Try again later.";
                break;
        }

        alert(msg);
    }

}

// --------------------------
// Create Account Button
// --------------------------

document
.getElementById("signupBtn")
.addEventListener("click", () => {

    window.location = "signup.html";

});

// --------------------------
// Press Enter to Login
// --------------------------

document.addEventListener("keydown", function (e) {

    if (e.key === "Enter") {

        loginUser();

    }

});
