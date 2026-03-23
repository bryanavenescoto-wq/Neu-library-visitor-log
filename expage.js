// ================= FIREBASE IMPORTS =================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  addDoc,
  collection
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

// ================= CONFIG =================
const firebaseConfig = {
  apiKey: "AIzaSyBhxtyqtmBg7SmYdM5D980fEr9M1K-nEzY",
  authDomain: "library-system-6138b.firebaseapp.com",
  projectId: "library-system-6138b",
  storageBucket: "library-system-6138b.appspot.com",
  messagingSenderId: "250954766995",
  appId: "1:250954766995:web:040fe704019239a3ef4b66"
};

// ================= INIT =================
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ================= GOOGLE =================
const provider = new GoogleAuthProvider();

//  ACCOUNT SELECTION EVERY TIME
provider.setCustomParameters({
  prompt: "select_account"
});

// ================= ADMIN EMAILS =================
const ADMIN_EMAILS = [
  "bryanaven.escoto@neu.edu.ph",   // ✅ (ADMIN)
  "jcesperanza@neu.edu.ph"         // ✅ PROFESSOR
];

let currentUser = null;

// ================= UI HELPERS =================
function showError(msg) {
  const e = document.getElementById("errorMsg");
  const s = document.getElementById("successMsg");

  if (e) {
    e.innerText = msg;
    e.style.display = "block";
  }
  if (s) s.style.display = "none";
}

function showSuccess(msg) {
  const e = document.getElementById("errorMsg");
  const s = document.getElementById("successMsg");

  if (s) {
    s.innerText = msg;
    s.style.display = "block";
  }
  if (e) e.style.display = "none";
}

// ================= FRIENDLY ERRORS =================
function getFriendlyError(code) {
  switch (code) {
    case "auth/invalid-credential":
      return "Invalid email or password.";
    case "auth/user-not-found":
      return "Account not found.";
    case "auth/wrong-password":
      return "Incorrect password.";
    case "auth/email-already-in-use":
      return "Email already registered.";
    default:
      return "Something went wrong. Try again.";
  }
}

// ================= FORM SWITCH =================
window.toggleForm = function(type) {
  document.getElementById("errorMsg").style.display = "none";
  document.getElementById("successMsg").style.display = "none";

  document.getElementById("signInForm").style.display =
    type === "login" ? "block" : "none";

  document.getElementById("registerForm").style.display =
    type === "register" ? "block" : "none";
};

// ================= REDIRECT LOGIC =================
async function redirectUser(user) {
  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  let role = "user";

  // CREATE USER IF NOT EXIST
  if (!snap.exists()) {
    if (ADMIN_EMAILS.includes(user.email)) {
      role = "admin";
    }

    await setDoc(userRef, {
      email: user.email,
      role: role
    });
  } else {
    role = snap.data().role;
  }

  // ADMIN REDIRECT
  if (role === "admin") {
    window.location.href = "admin.html";
    return;
  }

  // 👤 NORMAL USER
  document.getElementById("loginCard").style.display = "none";
  document.getElementById("visitForm").style.display = "block";
}

// ================= LOGIN =================
window.handleLogin = async function() {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  if (!email || !password) {
    showError("Please fill in all fields.");
    return;
  }

  if (!email.endsWith("@neu.edu.ph")) {
    showError("Authorized access only. 
             Only NEU institutional email addresses are allowed");
    return;
  }

  try {
    const res = await signInWithEmailAndPassword(auth, email, password);
    currentUser = res.user;

    await redirectUser(currentUser);

  } catch (err) {
    console.error(err);
    showError(getFriendlyError(err.code));
  }
};

// ================= REGISTER =================
window.handleRegister = async function() {
  const email = document.getElementById("regEmail").value.trim();
  const password = document.getElementById("regPassword").value;
  const confirm = document.getElementById("regConfirm").value;

  if (!email || !password || !confirm) {
    showError("Complete all fields.");
    return;
  }

  if (!email.endsWith("@neu.edu.ph")) {
    showError("⚠️ Authorized access only. Only NEU institutional email addresses are allowed.");
    return;
  }

  if (password.length < 6) {
    showError("Password must be at least 6 characters.");
    return;
  }

  if (password !== confirm) {
    showError("Passwords do not match.");
    return;
  }

  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);

    let role = ADMIN_EMAILS.includes(email) ? "admin" : "user";

    await setDoc(doc(db, "users", res.user.uid), {
      email: email,
      role: role
    });

    showSuccess("Account created🎉 You can now login.");
    toggleForm("login");

  } catch (err) {
    console.error(err);
    showError(getFriendlyError(err.code));
  }
};

// ================= GOOGLE LOGIN =================
window.handleGoogleLogin = async function() {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // BLOCK NON-NEU EMAIL
    if (!user.email.endsWith("@neu.edu.ph")) {
      alert("Only NEU institutional email is allowed.");
      await signOut(auth);
      return;
    }

    currentUser = user;

    await redirectUser(user);

  } catch (err) {
    console.error(err);
    showError(getFriendlyError(err.code));
  }
};

// ================= VISIT LOG =================
window.submitVisit = async function() {
  if (!currentUser) {
    alert("Please login first.");
    return;
  }

  const purpose = document.getElementById("purpose").value;
  const type = document.getElementById("visitorType").value;
  const college = document.getElementById("college").value;
  const course = document.getElementById("course").value;

  try {
    await addDoc(collection(db, "visits"), {
      email: currentUser.email,
      purpose: purpose,
      type: type,
      college: college,
      course: course,
      time: new Date().toLocaleString()
    });

    document.getElementById("successMessage").style.display = "block";

  } catch (err) {
    alert(err.message);
  }
};

// ================= LOGOUT =================
window.logout = async function() {
  await signOut(auth);
  location.reload();
};
