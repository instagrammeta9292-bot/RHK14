// ===============================
// RHK BRAND - Home Page
// ===============================

// Get user data from localStorage
const username = localStorage.getItem("username");
const profilePhoto = localStorage.getItem("profilePhoto");

// If user is not logged in
if (!username || !profilePhoto) {
    window.location.href = "login.html";
}

// Show username
document.getElementById("username").textContent = username;

// Show profile photo
document.getElementById("profilePhoto").src = profilePhoto;

// Logout
document.getElementById("logoutBtn").addEventListener("click", () => {

    if (confirm("Are you sure you want to logout?")) {

        localStorage.removeItem("username");
        localStorage.removeItem("profilePhoto");

        window.location.href = "login.html";
    }

});
