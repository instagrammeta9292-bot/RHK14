// ===============================
// Firebase Configuration
// ===============================

const firebaseConfig = {
  apiKey: "AIzaSyAHUju18VBAdDFoQJhsVWp7oUqBxhfwThE",
  authDomain: "rhk-app-e34c6.firebaseapp.com",
  projectId: "rhk-app-e34c6",
  storageBucket: "rhk-app-e34c6.firebasestorage.app",
  messagingSenderId: "1016565109006",
  appId: "1:1016565109006:web:eb7ec260a601a16e5ac75f",
  measurementId: "G-814PTRRQVQ"
};

// ===============================
// Initialize Firebase
// ===============================

firebase.initializeApp(firebaseConfig);

// Services
const auth = firebase.auth();
const db = firebase.firestore();

// ===============================
// Cloudinary
// ===============================

// Your Cloud Name
const CLOUD_NAME = "nhy9lfkt";

// Your Upload Preset
const UPLOAD_PRESET = "rhk_upload";

// Upload URL
const CLOUDINARY_URL =
`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

// ===============================
// Upload Image to Cloudinary
// ===============================

async function uploadImage(file){

    const formData = new FormData();

    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    const response = await fetch(CLOUDINARY_URL,{
        method:"POST",
        body:formData
    });

    const data = await response.json();

    if(data.secure_url){
        return data.secure_url;
    }else{
        throw new Error("Image upload failed.");
    }
}

// ===============================
// Logout Function
// ===============================

function logout(){

    auth.signOut().then(()=>{

        window.location="index.html";

    });

}

// ===============================
// Auth Guard
// ===============================

function checkLogin(){

    auth.onAuthStateChanged(user=>{

        if(!user){

            window.location="index.html";

        }

    });

}
