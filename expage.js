import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { 
  getFirestore, 
  addDoc, 
  collection, 
  doc, 
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

// 🔥 FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "library-system-6138b.firebaseapp.com",
  projectId: "library-system-6138b",
  storageBucket: "library-system-6138b.firebasestorage.com",
  messagingSenderId: "250954766995",
  appId: "1:250954766995:web:040fe704019239a3ef4b66"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

let currentUser = null;

// ================= UI HELPERS =================
function showError(msg) {
  document.getElementById("errorMsg").innerText = msg;
  document.getElementById("errorMsg").style.display = "block";
  document.getElementById("successMsg").style.display = "none";
}

function showSuccess(msg) {
  document.getElementById("successMsg").innerText = msg;
  document.getElementById("successMsg").style.display = "block";
  document.getElementById("errorMsg").style.display = "none";
}

// ================= TOGGLE =================
window.toggleForm = function(type) {
  document.getElementById("errorMsg").style.display = "none";
  document.getElementById("successMsg").style.display = "none";

  if (type === "register") {
    document.getElementById("signInForm").style.display = "none";
    document.getElementById("registerForm").style.display = "block";
  } else {
    document.getElementById("registerForm").style.display = "none";
    document.getElementById("signInForm").style.display = "block";
  }
};

// ================= LOGIN =================
window.handleLogin = async function() {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;
  const enteredName = document.getElementById("loginName").value.trim();

  if (!email.endsWith("@neu.edu.ph")) {
    showError("Use your institutional email.");
    return;
  }

  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    currentUser = result.user;

    if (enteredName) {
      await updateProfile(currentUser, { displayName: enteredName });
    }

    // 🔥 GET USER ROLE
    const userRef = doc(db, "users", currentUser.uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      showError("User data not found. Contact admin.");
      return;
    }

    const role = snap.data().role;

    if (role === "admin") {
      window.location.href = "admin.html";
    } else {
      document.getElementById("loginCard").style.display = "none";
      document.getElementById("visitForm").style.display = "block";
    }

  } catch (err) {
    console.error(err);
    showError(err.message);
  }
};

// ================= REGISTER =================
window.handleRegister = async function() {
  const email = document.getElementById("regEmail").value.trim();
  const password = document.getElementById("regPassword").value;
  const confirm = document.getElementById("regConfirm").value;

  if (!email.endsWith("@neu.edu.ph")) {
    showError("Use your institutional email.");
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
    const result = await createUserWithEmailAndPassword(auth, email, password);

    // 🔥 SAVE USER IN FIRESTORE
    await setDoc(doc(db, "users", result.user.uid), {
      email: email,
      role: "user" // default role
    });

    showSuccess("Account created! Please login.");
    toggleForm("login");

  } catch (err) {
    console.error(err);
    showError(err.message);
  }
};

// ================= GOOGLE LOGIN =================
window.handleGoogleLogin = async function() {
  try {
    const result = await signInWithPopup(auth, googleProvider);

    if (!result.user.email.endsWith("@neu.edu.ph")) {
      showError("Use institutional email.");
      await signOut(auth);
      return;
    }

    currentUser = result.user;

    const ref = doc(db, "users", currentUser.uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      await setDoc(ref, {
        email: currentUser.email,
        role: "user"
      });
    }

    document.getElementById("loginCard").style.display = "none";
    document.getElementById("visitForm").style.display = "block";

  } catch (err) {
    showError(err.message);
  }
};

// ================= VISIT =================
window.submitVisit = async function() {
  if (!currentUser) {
    alert("Login first!");
    return;
  }

  try {
    await addDoc(collection(db, "visits"), {
      email: currentUser.email,
      name: currentUser.displayName || "No Name",
      timestamp: new Date()
    });

    document.getElementById("successMessage").style.display = "block";

  } catch (err) {
    alert(err.message);
  }
};
