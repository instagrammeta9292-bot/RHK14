import {
  auth,
  db,
  CLOUD_NAME,
  UPLOAD_PRESET,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  doc,
  setDoc,
  getDoc
} from "./firebase.js";

// ---------- CREATE ACCOUNT ----------

const signupBtn = document.getElementById("signupBtn");

if (signupBtn) {

signupBtn.onclick = async () => {

const fullname = document.getElementById("fullname").value.trim();

const username = document.getElementById("username").value.trim().toLowerCase();

const email = document.getElementById("email").value.trim();

const password = document.getElementById("password").value;

const photo = document.getElementById("photo").files[0];

const message = document.getElementById("message");

if (
!fullname ||
!username ||
!email ||
!password
){
message.innerHTML="Please fill all fields";
return;
}

message.innerHTML="Uploading image...";

let imageUrl="";

if(photo){

const formData=new FormData();

formData.append("file",photo);

formData.append("upload_preset",UPLOAD_PRESET);

const upload=await fetch(
`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
{
method:"POST",
body:formData
});

const result=await upload.json();

imageUrl=result.secure_url;

}

message.innerHTML="Creating account...";

const userCredential =
await createUserWithEmailAndPassword(
auth,
email,
password
);

await setDoc(
doc(db,"users",userCredential.user.uid),
{
fullname,
username,
email,
photo:imageUrl,
createdAt:new Date().toISOString()
}
);

message.innerHTML="Account created successfully!";

setTimeout(()=>{
location.href="index.html";
},1500);

};

}
// ---------- LOGIN ----------

const loginBtn = document.getElementById("loginBtn");

if (loginBtn) {

loginBtn.onclick = async () => {

const email = document.getElementById("email").value.trim();

const password = document.getElementById("password").value;

const message = document.getElementById("message");

if (!email || !password) {
message.innerHTML = "Enter email and password";
return;
}

try {

await signInWithEmailAndPassword(
auth,
email,
password
);

message.innerHTML = "Login Successful...";

setTimeout(() => {
location.href = "home.html";
},1000);

} catch (error) {

message.innerHTML = error.message;

}

};

}


// ---------- AUTH CHECK ----------

onAuthStateChanged(auth, async(user)=>{

if(!user) return;

const userRef = doc(db,"users",user.uid);

const snap = await getDoc(userRef);

if(!snap.exists()) return;

const data = snap.data();

const profileName = document.getElementById("profileName");
const profileEmail = document.getElementById("profileEmail");
const profileUsername = document.getElementById("profileUsername");
const profileImage = document.getElementById("profileImage");

if(profileName)
profileName.innerHTML=data.fullname;

if(profileEmail)
profileEmail.innerHTML=data.email;

if(profileUsername)
profileUsername.innerHTML="@"+data.username;

if(profileImage)
profileImage.src=data.photo;

});


// ---------- LOGOUT ----------

const logoutBtn=document.getElementById("logoutBtn");

if(logoutBtn){

logoutBtn.onclick=async()=>{

await signOut(auth);

location.href="index.html";

};

}
