import { db } from "./firebase.js";
import { doc, getDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Redirect if not logged in
const discordUser = localStorage.getItem("discordUser");
const linked = localStorage.getItem("linkedAccount");

if (!discordUser || !linked) {
  window.location.href = "/connect.html";
}

document.addEventListener("DOMContentLoaded", async () => {
  const profileStatus = document.getElementById("profileStatus");
  const profileContent = document.getElementById("profileContent");

  const discord = JSON.parse(discordUser);
  const hive = JSON.parse(linked);

  // Load Firestore data
  const ref = doc(db, "users", discord.id);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    window.location.href = "/connect.html";
    return;
  }

  const data = snap.data();

  // Fill Discord info
  document.getElementById("discordName").textContent = discord.username;
  document.getElementById("discordId").textContent = discord.id;

  const avatarUrl = `https://cdn.discordapp.com/avatars/${discord.id}/${discord.avatar}.png?size=256`;
  document.getElementById("discordAvatar").src = avatarUrl;

  // Fill Hive info
  document.getElementById("hiveIgn").textContent = data.ign;
  document.getElementById("hiveUuid").textContent = data.uuid;
  document.getElementById("hiveXuid").textContent = data.xuid;

  // Linked Account Status
  document.getElementById("statusHive").textContent = "✔ Linked";
  document.getElementById("statusDiscord").textContent = "✔ Linked";
  document.getElementById("statusVerified").textContent = data.verified ? "✔ Completed" : "Not Verified";
  document.getElementById("statusLinkedOn").textContent = new Date(data.timestamp).toLocaleString();

  // Show content
  profileStatus.style.display = "none";
  profileContent.style.display = "block";

  // Disconnect button
  document.getElementById("disconnectBtn").addEventListener("click", () => {
    localStorage.removeItem("discordUser");
    localStorage.removeItem("linkedAccount");
    window.location.href = "/index.html";
  });

  // Delete Account button
  document.getElementById("deleteAccountBtn").addEventListener("click", async () => {
    const confirmDelete = prompt("Type DELETE to permanently remove your Hive Insight account.");

    if (confirmDelete !== "DELETE") return;

    await deleteDoc(doc(db, "users", discord.id));

    localStorage.removeItem("discordUser");
    localStorage.removeItem("linkedAccount");

    alert("Your account has been deleted.");
    window.location.href = "/index.html";
  });
});
