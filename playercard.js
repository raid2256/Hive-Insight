async function loadPlayerCard(username) {
  const card = document.getElementById("playerCard");
  card.style.display = "block";

  // Fetch Bedrock skin
  const res = await fetch(`https://mcprofile.io/api/v1/bedrock/gamertag/${username}`);
  if (!res.ok) {
    console.warn("MCProfile: Player not found.");
    card.style.display = "none";
    return;
  }

  const data = await res.json();
  const skinURL = data.skin;

  document.getElementById("pcName").textContent = username;

  // Hive stats (already loaded in script.js)
  const hive = window.lastLoadedStats;

  let totalGames = 0;
  let totalWins = 0;
  let totalLevel = 0;

  for (const mode in hive) {
    totalGames += hive[mode]?.played ?? 0;
    totalWins += hive[mode]?.victories ?? 0;
    totalLevel += hive[mode]?.level ?? 0;
  }

  document.getElementById("pcGames").textContent = totalGames.toLocaleString();
  document.getElementById("pcWins").textContent = totalWins.toLocaleString();
  document.getElementById("pcLevel").textContent = totalLevel;

  // 3D Skin Viewer
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
