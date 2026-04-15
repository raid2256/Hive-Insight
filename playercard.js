async function loadPlayerCard(username) {
  const card = document.getElementById("playerCard");

  username = username.trim().toLowerCase();

  // MCProfile URL
  const mcprofileURL = `https://mcprofile.io/api/v1/bedrock/gamertag/${username}`;

  // Working proxy (JSON wrapper)
  const proxyURL = "https://api.allorigins.win/get?url=" + encodeURIComponent(mcprofileURL);

  // Fetch through proxy
  const res = await fetch(proxyURL);
  if (!res.ok) {
    console.warn("Proxy failed:", res.status);
    card.style.display = "none";
    return;
  }

  // AllOrigins wraps the response in { contents: "..." }
  const wrapper = await res.json();

  let data;
  try {
    data = JSON.parse(wrapper.contents);
  } catch (err) {
    console.warn("MCProfile returned non‑JSON:", wrapper.contents);
    card.style.display = "none";
    return;
  }

  // Skin URL
  const skinURL = data.skin;

  // Set username
  document.getElementById("pcName").textContent = data.gamertag;

  // Hive stats
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
