<!DOCTYPE html>
<html lang="en">

<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>Create Account - RHK CHAT</title>

<link rel="stylesheet" href="css/style.css">

<!-- Firebase -->
<script src="https://www.gstatic.com/firebasejs/10.12.5/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.5/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore-compat.js"></script>

</head>

<body>

<div class="login-box">

    <img src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
         class="logo">

    <h1>Create Account</h1>

    <p>Create your RHK CHAT account</p>

    <input
        type="email"
        id="email"
        placeholder="Email Address">

    <input
        type="password"
        id="password"
        placeholder="Password">

    <input
        type="password"
        id="confirmPassword"
        placeholder="Confirm Password">

    <button id="createBtn">
        Create Account
    </button>

    <button
        class="createBtn"
        onclick="location.href='index.html'">
        Back to Login
    </button>

    <p id="msg" style="margin-top:15px;color:red;"></p>

</div>

<script src="js/firebase.js"></script>
<script src="js/signup.js"></script>

</body>

</html>
