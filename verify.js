/* ---------------------------------------------------------
   verify.js – Hive Insight account linking logic
   --------------------------------------------------------- */

/* -------------------------------
   0. FIREBASE IMPORTS
--------------------------------*/
import { app, db } from "./firebase.js";
import {
  doc,
  setDoc
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
   CLEAN COLOR CODES
--------------------------------*/
function cleanTitle(title) {
  return title.replace(/&[0-9a-fklmnor]/gi, "");
}

/* -------------------------------
   2. DISCORD LOGIN (Implicit Flow)
--------------------------------*/
discordBtn.addEventListener("click", () => {
  const discordAuthURL =
    "https://discord.com/oauth2/authorize?client_id=1498133379835629710&response_type=token&redirect_uri=https%3A%2F%2Fhive-insight.vercel.app%2Fconnect.html&scope=identify";

  window.location.href = discordAuthURL;
});

/* -------------------------------
   3. DETECT DISCORD REDIRECT
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
   4. FETCH DISCORD USER
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

  authStatus.textContent = `Connected as ${user.username} ✔`;
  authStatus.style.color = "limegreen";

  ignSection.style.display = "block";
}

/* -------------------------------
   5. FETCH HIVE PLAYER DATA
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
   6. PICK RANDOM HUB TITLE
--------------------------------*/
function pickRandomHubTitle(titles) {
  return titles[Math.floor(Math.random() * titles.length)];
}

/* -------------------------------
   7. GENERATE VERIFICATION TITLE
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

  const raw = pickRandomHubTitle(titles);
  const chosen = cleanTitle(raw);

  verificationTitle.textContent = chosen;
  titleSection.style.display = "block";

  ignStatus.textContent = "Hub title generated ✔";
  ignStatus.style.color = "limegreen";

  window._verification = {
    ign,
    chosen
  };
});

/* -------------------------------
   8. CHECK VERIFICATION
--------------------------------*/
checkVerificationBtn.addEventListener("click", async () => {
  const { ign, chosen } = window._verification;

  verificationStatus.textContent = "Checking Hive...";
  verificationStatus.style.color = "white";

  const data = await fetchHivePlayer(ign);

  if (!data || !data.main) {
    verificationStatus.textContent = "Player not found.";
    verificationStatus.style.color = "red";
    return;
  }

  const equipped = cleanTitle(data.main.equipped_hub_title);

  if (equipped === chosen) {
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
   9. SAVE TO FIRESTORE
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
}
