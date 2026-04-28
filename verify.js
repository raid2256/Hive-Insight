/* ---------------------------------------------------------
   verify.js – Hive Insight account linking logic
   --------------------------------------------------------- */

/* -------------------------------
   0. FIREBASE IMPORTS
--------------------------------*/
import { app, db } from "./firebase.js";
import {
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* -------------------------------
   1. DOM ELEMENTS
--------------------------------*/
const discordBtn = document.getElementById("discordLoginBtn");
const authStatus = document.getElementById("authStatus");

const ignSection = document.getElementById("ignSection");
const ignInput = document.getElementById("ignInput");
const generateTitleBtn = document.getElementById("generateTitleBtn");
const ignStatus = document.getElementById("ignStatus");

const titleSection = document.getElementById("titleSection");
const verificationTitle = document.getElementById("verificationTitle");
const checkVerificationBtn = document.getElementById("checkVerificationBtn");
const verificationStatus = document.getElementById("verificationStatus");

const resultSection = document.getElementById("resultSection");
const resultMessage = document.getElementById("resultMessage");

/* -------------------------------
   CLEAN COLOR CODES (DISPLAY ONLY)
--------------------------------*/
function cleanTitle(title) {
  return title.replace(/&[0-9a-fklmnor]/gi, "");
}

/* -------------------------------
   2. RESTORE SESSION (STAY SIGNED IN)
--------------------------------*/
const savedUser = localStorage.getItem("discordUser");
const linked = localStorage.getItem("linkedAccount");

// If already verified → go to profile
if (linked) {
  window.location.href = "/profile.html";
}

// If Discord login exists → auto-fill UI
if (savedUser) {
  window._discord = JSON.parse(savedUser);

  authStatus.textContent = `Connected as ${window._discord.username} ✔`;
  authStatus.style.color = "limegreen";

  ignSection.style.display = "block";
}

/* -------------------------------
   3. DISCORD LOGIN
--------------------------------*/
discordBtn.addEventListener("click", () => {
  const discordAuthURL =
    "https://discord.com/oauth2/authorize?client_id=1498133379835629710&response_type=token&redirect_uri=https%3A%2F%2Fhive-insight.vercel.app%2Fconnect.html&scope=identify";

  window.location.href = discordAuthURL;
});

/* -------------------------------
   4. DETECT DISCORD REDIRECT
--------------------------------*/
function checkDiscordLogin() {
  const hash = window.location.hash;

  if (hash.includes("access_token")) {
    const params = new URLSearchParams(hash.replace("#", ""));
    const token = params.get("access_token");

    fetchDiscordUser(token);
  }
}
checkDiscordLogin();

/* -------------------------------
   5. FETCH DISCORD USER
--------------------------------*/
async function fetchDiscordUser(token) {
  const res = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${token}` }
  });

  const user = await res.json();

  window._discord = {
    id: user.id,
    username: user.username,
    avatar: user.avatar
  };

  // Save session
  localStorage.setItem("discordUser", JSON.stringify(window._discord));

  authStatus.textContent = `Connected as ${user.username} ✔`;
  authStatus.style.color = "limegreen";

  ignSection.style.display = "block";
}

/* -------------------------------
   6. FETCH HIVE PLAYER DATA
--------------------------------*/
async function fetchHivePlayer(ign) {
  try {
    const res = await fetch(`https://api.playhive.com/v0/game/all/all/${ign}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  }
}

/* -------------------------------
   7. PICK RANDOM HUB TITLE
--------------------------------*/
function pickRandomHubTitle(titles) {
  return titles[Math.floor(Math.random() * titles.length)];
}

/* -------------------------------
   8. GENERATE VERIFICATION TITLE
--------------------------------*/
generateTitleBtn.addEventListener("click", async () => {
  const ign = ignInput.value.trim();

  if (!ign) {
    ignStatus.textContent = "Enter a valid IGN.";
    ignStatus.style.color = "red";
    return;
  }

  ignStatus.textContent = "Fetching Hive data...";
  ignStatus.style.color = "white";

  const data = await fetchHivePlayer(ign);

  if (!data || !data.main) {
    ignStatus.textContent = "Player not found.";
    ignStatus.style.color = "red";
    return;
  }

  const titles = data.main.hub_title_unlocked;

  if (!titles || titles.length === 0) {
    ignStatus.textContent = "This player has no hub titles.";
    ignStatus.style.color = "red";
    return;
  }

  // RAW title for comparison
  const chosenRaw = pickRandomHubTitle(titles);

  // CLEAN title for display
  const chosenClean = cleanTitle(chosenRaw);

  verificationTitle.textContent = chosenClean;
  titleSection.style.display = "block";

  ignStatus.textContent = "Hub title generated ✔";
  ignStatus.style.color = "limegreen";

  window._verification = {
    ign,
    chosenRaw,   // compare RAW
    chosenClean  // display CLEAN
  };
});

/* -------------------------------
   9. CHECK VERIFICATION
--------------------------------*/
checkVerificationBtn.addEventListener("click", async () => {
  const { ign, chosenRaw } = window._verification;

  verificationStatus.textContent = "Checking Hive...";
  verificationStatus.style.color = "white";

  const data = await fetchHivePlayer(ign);

  if (!data || !data.main) {
    verificationStatus.textContent = "Player not found.";
    verificationStatus.style.color = "red";
    return;
  }

  // RAW equipped title from API
  const equippedRaw = data.main.equipped_hub_title;

  if (equippedRaw === chosenRaw) {
    verificationStatus.textContent = "Verified ✔";
    verificationStatus.style.color = "limegreen";

    resultSection.style.display = "block";
    resultMessage.textContent = `${ign} is now linked to your account.`;

    saveVerification(window._discord, ign, data.main.UUID, data.main.xuid);

  } else {
    verificationStatus.textContent = "Not equipped yet. Try again.";
    verificationStatus.style.color = "red";
  }
});

/* -------------------------------
   10. SAVE TO FIRESTORE + LOCALSTORAGE
--------------------------------*/
async function saveVerification(discord, ign, uuid, xuid) {
  await setDoc(doc(db, "users", discord.id), {
    discordId: discord.id,
    discordUsername: discord.username,
    discordAvatar: discord.avatar,
    ign,
    uuid,
    xuid,
    verified: true,
    timestamp: Date.now()
  });

  // Save locally so user stays verified
  localStorage.setItem("linkedAccount", JSON.stringify({
    ign,
    uuid,
    xuid,
    discordId: discord.id
  }));

  // Redirect to profile
  window.location.href = "/profile.html";
}
