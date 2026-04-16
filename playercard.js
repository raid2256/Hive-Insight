// ⭐ Load Player Card
async function loadPlayerCard(username) {
  const card = document.getElementById("playerCard");

  username = username.trim().toLowerCase();

  // Fetch profile from your proxy
  const res = await fetch(`/api/mcprofile?user=${username}`);
  if (!res.ok) {
    console.warn("MCProfile proxy error:", res.status);
    card.style.display = "none";
    return;
  }

  const data = await res.json();
  const skinURL = data.skin;

  // Set username
  document.getElementById("pcName").textContent = data.gamertag;

  // ⭐ GET HIVE STATS
  const hive = window.lastLoadedStats;
  if (!hive) {
    console.warn("Hive stats missing");
    return;
  }

  // ⭐ CALCULATE TOTALS
  let totalGames = 0;
  let totalWins = 0;
  let totalLevel = 0;

  for (const modeKey in hive) {
    const modeStats = hive[modeKey];
    if (!modeStats) continue;

    const played = typeof modeStats.played === "number" ? modeStats.played : 0;
    const wins = typeof modeStats.victories === "number" ? modeStats.victories : 0;
    const xp = typeof modeStats.xp === "number" ? modeStats.xp : 0;

    totalGames += played;
    totalWins += wins;

    // use global getLevelInfo from script.js
    if (typeof getLevelInfo === "function" && XP_MODE_MAP[modeKey]) {
      const info = getLevelInfo(modeKey, xp);
      if (info && typeof info.level === "number") {
        totalLevel += info.level;
      }
    }
  }

  // ⭐ UPDATE UI
  document.getElementById("pcGames").textContent = totalGames.toLocaleString();
  document.getElementById("pcWins").textContent = totalWins.toLocaleString();
  document.getElementById("pcLevel").textContent = totalLevel;

  // Show card
  card.style.display = "flex";

  // ⭐ SKIN VIEWER + FALLBACK
  const canvas = document.getElementById("skinCanvas");
  const fallback = document.getElementById("skinFallback");

  canvas.style.display = "block";
  fallback.style.display = "none";

  try {
    const viewer = new skinview3d.SkinViewer({
      canvas: canvas,
      width: 350,
      height: 450
    });

    viewer.controls.enableZoom = false;
    viewer.controls.enablePan = false;
    viewer.animation = new skinview3d.IdleAnimation();

    viewer.loadSkin(skinURL).catch(() => {
      canvas.style.display = "none";
      fallback.style.display = "flex";
    });

  } catch (err) {
    console.error(err);
    canvas.style.display = "none";
    fallback.style.display = "flex";
  }
}
