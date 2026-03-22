// ================= FIREBASE =================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

// CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyBhxtyqtmBg7SmYdM5D980fEr9M1K-nEzY",
  authDomain: "library-system-6138b.firebaseapp.com",
  projectId: "library-system-6138b",
};

const ADMIN_EMAIL = "jcesperanza@neu.edu.ph";

// INIT
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ================= AUTH CHECK =================
onAuthStateChanged(auth, (user) => {
  if (!user || user.email !== ADMIN_EMAIL) {
    alert("Access denied");
    window.location.href = "index.html";
  } else {
    loadData();
  }
});

// ================= TAB SWITCH =================
window.showTab = function(tab) {
  document.getElementById("dashboard").style.display = "none";
  document.getElementById("logs").style.display = "none";

  document.getElementById(tab).style.display = "block";
};

// ================= LOGOUT =================
window.logout = async function() {
  await signOut(auth);
  window.location.href = "index.html";
};

// ================= DATA =================
let allVisits = [];
let chartInstance = null;

async function loadData() {
  const snap = await getDocs(collection(db, "visits"));

  allVisits = [];
  snap.forEach(doc => allVisits.push(doc.data()));

  renderLogs(allVisits);
  applyFilters();
}

// ================= LOG TABLE =================
function renderLogs(data) {
  const table = document.getElementById("logTable");
  table.innerHTML = "";

  data.forEach(v => {
    table.innerHTML += `
      <tr>
        <td>${v.email || ""}</td>
        <td>${v.name || ""}</td>
        <td>${v.purpose || ""}</td>
        <td>${v.college || ""}</td>
        <td>${v.type || ""}</td>
        <td>${v.time || ""}</td>
      </tr>
    `;
  });
}

// ================= FILTER =================
window.applyFilters = function() {
  let filtered = [...allVisits];

  const purpose = document.getElementById("filterPurpose").value;
  const college = document.getElementById("filterCollege").value;
  const type = document.getElementById("filterType").value;
  const start = document.getElementById("startDate").value;
  const end = document.getElementById("endDate").value;

  if (purpose) filtered = filtered.filter(v => v.purpose === purpose);
  if (college) filtered = filtered.filter(v => v.college === college);
  if (type) filtered = filtered.filter(v => v.type === type);

  if (start) filtered = filtered.filter(v => new Date(v.time) >= new Date(start));
  if (end) filtered = filtered.filter(v => new Date(v.time) <= new Date(end));

  // CARDS
  document.getElementById("totalVisitors").innerText = filtered.length;
  document.getElementById("studentCount").innerText =
    filtered.filter(v => v.type === "student").length;

  document.getElementById("employeeCount").innerText =
    filtered.filter(v => v.type === "employee").length;

  // CHART DATA
  const stats = {};
  filtered.forEach(v => {
    const key = v.purpose || "Unknown";
    stats[key] = (stats[key] || 0) + 1;
  });

  // DESTROY OLD CHART
  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(document.getElementById("chart"), {
    type: "bar",
    data: {
      labels: Object.keys(stats),
      datasets: [{
        label: "Visits",
        data: Object.values(stats)
      }]
    }
  });
};