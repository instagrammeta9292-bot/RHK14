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
