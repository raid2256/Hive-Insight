/* ---------------------------------------------------------
   verify.js – Hive Insight account linking logic
--------------------------------------------------------- */

import { app, db } from "./firebase.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* -------------------------------
   DOM ELEMENTS
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
const goProfileBtn = document.getElementById("goProfileBtn");

const adminBtn = document.getElementById("adminForceBtn");

/* -------------------------------
   ADMIN SETTINGS
--------------------------------*/
const ADMIN_ID = "1179331543550935062";
let adminForceTitle = false;

/* -------------------------------
   CLEAN COLOR CODES
--------------------------------*/
function cleanTitle(title) {
  return title.replace(/&[0-9a-fklmnor]/gi, "");
}

/* -------------------------------
   RESTORE SESSION
--------------------------------*/
const savedUser = localStorage.getItem("discordUser");
const linked = localStorage.getItem("linkedAccount");

// If already verified → show button instead of redirect
if (linked) {
  resultSection.style.display = "block";
  resultMessage.textContent = "Your account is already linked.";
  goProfileBtn.style.display = "inline-block";
}

// If Discord login exists → auto-fill UI
if (savedUser) {
  window._discord = JSON.parse(savedUser);

  authStatus.textContent = `Connected as ${window._discord.username} ✔`;
  authStatus.style.color = "limegreen";

  ignSection.style.display = "block";

  // Show admin button only for your Discord ID
  if (window._discord.id === ADMIN_ID) {
    adminBtn.style.display = "inline-block";
  }
}

/* -------------------------------
   ADMIN OVERRIDE BUTTON
--------------------------------*/
adminBtn?.addEventListener("click", () => {
  adminForceTitle = !adminForceTitle;
  adminBtn.textContent = adminForceTitle
    ? "Disable Admin Forced Title"
    : "Enable Admin Forced Title";
});

/* -------------------------------
   DISCORD LOGIN
--------------------------------*/
discordBtn.addEventListener("click", () => {
  const discordAuthURL =
    "https://discord.com/oauth2/authorize?client_id=1498133379835629710&response_type=token&redirect_uri=https%3A%2F%2Fhive-insight.vercel.app%2Fconnect.html&scope=identify";

  window.location.href = discordAuthURL;
});

/* -------------------------------
   DETECT DISCORD REDIRECT
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
   FETCH DISCORD USER
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

  localStorage.setItem("discordUser", JSON.stringify(window._discord));

  authStatus.textContent = `Connected as ${user.username} ✔`;
  authStatus.style.color = "limegreen";

  ignSection.style.display = "block";

  if (user.id === ADMIN_ID) {
    adminBtn.style.display = "inline-block";
  }
}

/* -------------------------------
   FETCH HIVE PLAYER
--------------------------------*/
async function fetchHivePlayer(ign) {
  try {
    const res = await fetch(`https://api.playhive.com/v0/game/all/all/${ign}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/* -------------------------------
   PICK RANDOM HUB TITLE
--------------------------------*/
function pickRandomHubTitle(titles) {
  return titles[Math.floor(Math.random() * titles.length)];
}

/* -------------------------------
   GENERATE VERIFICATION TITLE
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

  let chosenRaw;

  if (adminForceTitle) {
    chosenRaw = "&2Be&aary &eco&6ol";
  } else {
    chosenRaw = pickRandomHubTitle(titles);
  }

  const chosenClean = cleanTitle(chosenRaw);

  verificationTitle.textContent = chosenClean;
  titleSection.style.display = "block";

  ignStatus.textContent = "Hub title generated ✔";
  ignStatus.style.color = "limegreen";

  window._verification = { ign, chosenRaw, chosenClean };
});

/* -------------------------------
   CHECK VERIFICATION
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

  const equippedRaw = data.main.equipped_hub_title;

  if (equippedRaw === chosenRaw) {
    if (autoCheckInterval) {
      clearInterval(autoCheckInterval);
      autoCheckInterval = null;
    }

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
   AUTO-CHECK EVERY 15 SECONDS
--------------------------------*/
let autoCheckInterval = null;
let autoCheckAttempts = 0;
const MAX_ATTEMPTS = 10;

const autoToggle = document.getElementById("autoCheckToggle");

if (autoToggle) {
  autoToggle.addEventListener("change", () => {
    if (autoToggle.checked) {
      verificationStatus.textContent = "Auto-check enabled. Waiting...";
      verificationStatus.style.color = "white";

      autoCheckAttempts = 0;

      autoCheckInterval = setInterval(() => {
        autoCheckAttempts++;

        if (autoCheckAttempts >= MAX_ATTEMPTS) {
          verificationStatus.textContent =
            "The Hive API is taking longer than usual to update. Try re-equipping the hub title or returning to the hub.";
          verificationStatus.style.color = "orange";

          clearInterval(autoCheckInterval);
          autoCheckInterval = null;
          return;
        }

        checkVerificationBtn.click();
      }, 15000);
    } else {
      clearInterval(autoCheckInterval);
      autoCheckInterval = null;
      verificationStatus.textContent = "Auto-check disabled.";
      verificationStatus.style.color = "white";
    }
  });
}

/* -------------------------------
   SAVE TO FIRESTORE + LOCALSTORAGE
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

  localStorage.setItem("linkedAccount", JSON.stringify({
    ign,
    uuid,
    xuid,
    discordId: discord.id
  }));

  goProfileBtn.style.display = "inline-block";
}

goProfileBtn.addEventListener("click", () => {
  window.location.href = "/profile.html";
});
