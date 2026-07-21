// ==========================================
// RHK CHAT - Signup
// ==========================================

// If already logged in
auth.onAuthStateChanged(async (user) => {

    if (!user) return;

    try {

        const doc = await db.collection("users").doc(user.uid).get();

        if (doc.exists) {
            window.location = "home.html";
        }

    } catch (e) {
        console.log(e);
    }

});

// ----------------------------
// Create Account
// ----------------------------

const createBtn = document.getElementById("createBtn");
const msg = document.getElementById("msg");

createBtn.addEventListener("click", createAccount);

async function createAccount() {

    msg.style.color = "red";
    msg.innerHTML = "";

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    // Validation
    if (email === "" || password === "" || confirmPassword === "") {
        msg.innerHTML = "Please fill all fields.";
        return;
    }

    if (password.length < 6) {
        msg.innerHTML = "Password must be at least 6 characters.";
        return;
    }

    if (password !== confirmPassword) {
        msg.innerHTML = "Passwords do not match.";
        return;
    }

    createBtn.disabled = true;
    createBtn.innerHTML = "Creating Account...";

    try {

        // Create Firebase user
        await auth.createUserWithEmailAndPassword(email, password);

        msg.style.color = "green";
        msg.innerHTML = "Account created successfully!";

        // Wait a moment before redirecting
        setTimeout(() => {
            window.location = "profile.html";
        }, 1000);

    } catch (error) {

        createBtn.disabled = false;
        createBtn.innerHTML = "Create Account";

        let errorMessage = "Unable to create account.";

        switch (error.code) {

            case "auth/email-already-in-use":
                errorMessage = "This email is already registered.";
                break;

            case "auth/invalid-email":
                errorMessage = "Invalid email address.";
                break;

            case "auth/weak-password":
                errorMessage = "Password is too weak.";
                break;

            case "auth/network-request-failed":
                errorMessage = "Check your internet connection.";
                break;

            default:
                errorMessage = error.message;
        }

        msg.innerHTML = errorMessage;
    }

}

// ----------------------------
// Press Enter
// ----------------------------

document.addEventListener("keydown", function (e) {

    if (e.key === "Enter") {
        createAccount();
    }

});
