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

  // Correct totals (filters out non‑gamemode keys)
  let totalGames = 0;
  let totalWins = 0;
  let totalLevel = 0;

  for (const mode in hive) {
    const m = hive[mode];

    if (
      m &&
      typeof m.played === "number" &&
      typeof m.victories === "number" &&
      typeof m.level === "number"
    ) {
      totalGames += m.played;
      totalWins += m.victories;
      totalLevel += m.level;
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
      height: 450,
      skin: skinURL
    });

    viewer.controls.enableZoom = false;
    viewer.controls.enablePan = false;
    viewer.animation = new skinview3d.IdleAnimation();

    // Detect if skin fails to load
    viewer.loadSkin(skinURL).catch(() => {
      canvas.style.display = "none";
      fallback.style.display = "flex";
    });

  } catch (err) {
    canvas.style.display = "none";
    fallback.style.display = "flex";
  }
}
