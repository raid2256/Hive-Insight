// ⭐ Load Player Card
async function loadPlayerCard(username) {
  const card = document.getElementById("playerCard");

  username = username.trim().toLowerCase();

  // Fetch from your Vercel proxy
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

  // Hive stats
  const hive = window.lastLoadedStats;
  if (!hive) return;

  // ⭐ Calculate totals safely
  let totalGames = 0;
  let totalWins = 0;
  let totalLevel = 0;

  for (const key in hive) {
    const mode = hive[key];

    if (
      mode &&
      typeof mode.played === "number" &&
      typeof mode.victories === "number" &&
      typeof mode.level === "number"
    ) {
      totalGames += mode.played;
      totalWins += mode.victories;
      totalLevel += mode.level;
    }
  }

  document.getElementById("pcGames").textContent = totalGames.toLocaleString();
  document.getElementById("pcWins").textContent = totalWins.toLocaleString();
  document.getElementById("pcLevel").textContent = totalLevel;

  // Show card
  card.style.display = "flex";

  // ⭐ Skin viewer + fallback
  const canvas = document.getElementById("skinCanvas");
  const fallback = document.getElementById("skinFallback");

  // Reset visibility
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

    // Load skin only once (prevents WebGL warnings)
    viewer.loadSkin(skinURL).catch(() => {
      canvas.style.display = "none";
      fallback.style.display = "flex";
    });

  } catch (err) {
    canvas.style.display = "none";
    fallback.style.display = "flex";
  }
}
