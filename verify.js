// -------------------------------
// 1. Fetch Hive Player Data
// -------------------------------
async function fetchHivePlayer(ign) {
  try {
    const res = await fetch(`/api/hive?ign=${ign}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error("Hive fetch error:", err);
    return null;
  }
}

// -------------------------------
// 2. Discord Login Button
// -------------------------------
document.getElementById("discordLoginBtn").addEventListener("click", () => {
  const clientId = "YOUR_DISCORD_CLIENT_ID";
  const redirect = encodeURIComponent("https://hive-insight.vercel.app/connect.html");
  const scope = "identify";

  window.location.href =
    `https://discord.com/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirect}&response_type=token&scope=${scope}`;
});

// -------------------------------
// 3. Parse Discord Token From URL
// -------------------------------
function parseDiscordToken() {
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);

  const token = params.get("access_token");
  if (!token) return null;

  window._discord = token;
  document.getElementById("authStatus").textContent = "Discord connected!";
  document.getElementById("ignSection").style.display = "block";

  return token;
}

parseDiscordToken();

// -------------------------------
// 4. Generate Verification Title
// -------------------------------
document.getElementById("generateTitleBtn").addEventListener("click", () => {
  const ign = document.getElementById("ignInput").value.trim();
  if (!ign) {
    document.getElementById("ignStatus").textContent = "Enter a valid IGN.";
    return;
  }

  const random = Math.floor(Math.random() * 90000) + 10000;
  const title = `HI-${random}`;

  window._ign = ign;
  window._verifyTitle = title;

  document.getElementById("verificationTitle").textContent = title;
  document.getElementById("titleSection").style.display = "block";
});

// -------------------------------
// 5. Check Verification
// -------------------------------
document.getElementById("checkVerificationBtn").addEventListener("click", async () => {
  const ign = window._ign;
  const expected = window._verifyTitle;

  const data = await fetchHivePlayer(ign);

  if (!data) {
    document.getElementById("verificationStatus").textContent = "Failed to load Hive data.";
    return;
  }

  const equipped = data.equipped_hub_title;

  if (equipped === expected) {
    document.getElementById("verificationStatus").textContent = "Verified!";
    document.getElementById("resultSection").style.display = "block";
    document.getElementById("resultMessage").textContent = `Your account ${ign} is now verified.`;
  } else {
    document.getElementById("verificationStatus").textContent =
      `Incorrect title equipped. Expected: ${expected}`;
  }
});
