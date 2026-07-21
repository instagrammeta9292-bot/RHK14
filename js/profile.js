// ======================================
// RHK CHAT - Profile Setup
// ======================================

checkLogin();

const saveBtn = document.getElementById("saveBtn");
const status = document.getElementById("status");

saveBtn.addEventListener("click", saveProfile);

async function saveProfile() {

    const user = auth.currentUser;

    if (!user) {
        window.location = "index.html";
        return;
    }

    const username = document
        .getElementById("username")
        .value
        .trim();

    const photoFile = document
        .getElementById("photo")
        .files[0];

    if (username === "") {

        status.style.color = "red";
        status.innerHTML = "Please enter a username.";
        return;

    }

    if (!photoFile) {

        status.style.color = "red";
        status.innerHTML = "Please select a profile photo.";
        return;

    }

    saveBtn.disabled = true;
    saveBtn.innerHTML = "Uploading...";

    try {

        // Upload image to Cloudinary
        const imageUrl = await uploadImage(photoFile);

        // Save user profile
        await db.collection("users").doc(user.uid).set({

            uid: user.uid,

            email: user.email,

            username: username,

            photo: imageUrl,

            createdAt: firebase.firestore.FieldValue.serverTimestamp()

        });

        status.style.color = "green";
        status.innerHTML = "Profile saved successfully.";

        setTimeout(function(){

            window.location = "home.html";

        },1000);

    }
    catch(error){

        console.log(error);

        status.style.color="red";

        status.innerHTML="Error : "+error.message;

        saveBtn.disabled=false;

        saveBtn.innerHTML="Save Profile";

    }

}
