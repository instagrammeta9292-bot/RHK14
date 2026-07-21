const loginForm = document.getElementById("loginForm");
const createAccount = document.getElementById("createAccount");

loginForm.addEventListener("submit", function(e){

    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if(username === "" || password === ""){
        alert("Please enter username and password.");
        return;
    }

    alert("Login button clicked.");

    // Later you will connect Firebase login here.

});

createAccount.addEventListener("click", function(){

    alert("Create New Account button clicked.");

    // Later you will redirect to register page.

});
