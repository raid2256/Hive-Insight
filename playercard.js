// ===============================
//  INSANE 3D PLAYER CARD SYSTEM
// ===============================

async function loadPlayerCard(username) {
  const card = document.getElementById("playerCard");
  card.style.display = "block";

  // Fetch Bedrock skin + Xbox icon
  const res = await fetch(`https://mcprofile.io/api/v1/bedrock/gamertag/${username}`);
  const data = await res.json();

  const skinURL = data.skin;
  const iconURL = data.icon;

  document.getElementById("pcName").textContent = username;
  document.getElementById("pcIcon").src = iconURL;

  // Load Hive stats (already fetched in script.js)
  const hive = window.lastLoadedStats;

  let totalXP = 0;
  let totalWins = 0;
  let totalGames = 0;

  for (const mode in hive) {
    totalXP += hive[mode]?.xp ?? 0;
    totalWins += hive[mode]?.victories ?? 0;
    totalGames += hive[mode]?.played ?? 0;
  }

  document.getElementById("pcXP").textContent = `XP: ${totalXP.toLocaleString()}`;
  document.getElementById("pcWins").textContent = `Wins: ${totalWins.toLocaleString()}`;
  document.getElementById("pcGames").textContent = `Games: ${totalGames.toLocaleString()}`;

  // Prestige ring animation
  const maxXP = 500000; // arbitrary scale
  const percent = Math.min(totalXP / maxXP, 1);
  const offset = 440 - 440 * percent;
  document.getElementById("pcRing").style.strokeDashoffset = offset;
  document.getElementById("pcLevelText").textContent = `LVL ${Math.floor(percent * 100)}`;

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
