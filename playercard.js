async function loadPlayerCard(username) {
  const card = document.getElementById("playerCard");

  username = username.trim();

  // STEP 1 — Get XUID from PlayerDB
  const xuidRes = await fetch(`https://playerdb.co/api/player/xbox/${username}`);
  const xuidJson = await xuidRes.json();

  if (!xuidJson.success) {
    console.warn("PlayerDB: Player not found.");
    card.style.display = "none";
    return;
  }

  const xuid = xuidJson.data.player.id;

  // STEP 2 — Get Bedrock skin from Geyser API
  const skinRes = await fetch(`https://api.geysermc.org/v2/skin/${xuid}`);
  const skinJson = await skinRes.json();

  if (!skinJson.skin_url) {
    console.warn("Geyser: Skin not found.");
    card.style.display = "none";
    return;
  }

  const skinURL = skinJson.skin_url;

  // STEP 3 — Set username
  document.getElementById("pcName").textContent = username;

  // STEP 4 — Hive stats (already loaded)
  const hive = window.lastLoadedStats;
  if (!hive) return;

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

  // STEP 5 — Show card
  card.style.display = "flex";

  // STEP 6 — Render skin
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
