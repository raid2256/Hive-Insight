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

  // Correct totals (all modes have levels)
  let totalGames = 0;
  let totalWins = 0;
  let totalLevel = 0;

  for (const mode in hive) {
    totalGames += hive[mode].played;
    totalWins += hive[mode].victories;
    totalLevel += hive[mode].level;
  }

  document.getElementById("pcGames").textContent = totalGames.toLocaleString();
  document.getElementById("pcWins").textContent = totalWins.toLocaleString();
  document.getElementById("pcLevel").textContent = totalLevel;

  // Show card
  card.style.display = "flex";

  // Skin viewer
  const viewer = new skinview3d.SkinViewer({
    canvas: document.getElementById("skinCanvas"),
    width: 350,
    height: 450,
    skin: skinURL
  });

  viewer.controls.enableZoom = false;
  viewer.controls.enablePan = false;
  viewer.animation = new skinview3d.IdleAnimation();
}
