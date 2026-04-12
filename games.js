const API = "https://api.playhive.com/v0";

// Correct level caps + prestiges for every gamemode
const levelCaps = {
  bed: { cap: 100, prestiges: 1 },
  sky: { cap: 100, prestiges: 5 },
  dr: { cap: 75, prestiges: 0 },
  party: { cap: 25, prestiges: 0 },
  drop: { cap: 25, prestiges: 0 },
  ctf: { cap: 50, prestiges: 0 },
  murder: { cap: 100, prestiges: 5 },
  sg: { cap: 30, prestiges: 0 },
  hide: { cap: 75, prestiges: 0 },
  ground: { cap: 20, prestiges: 0 },
  bridge: { cap: 20, prestiges: 0 },
  grav: { cap: 25, prestiges: 0 }
};

// Dropdown logic
document.querySelectorAll(".dropdown-card").forEach(card => {
  const header = card.querySelector(".dropdown-header");
  const content = card.querySelector(".dropdown-content");
  const game = card.dataset.game;

  header.addEventListener("click", async () => {
    card.classList.toggle("active");

    // Already loaded? Don't fetch again
    if (content.dataset.loaded === "true") return;

    content.innerHTML = "<p>Loading...</p>";

    try {
      // Fetch maps + metadata at the same time
      const [mapsRes, metaRes] = await Promise.all([
        fetch(`${API}/game/map/${game}`),
        fetch(`${API}/game/meta/${game}`)
      ]);

      const maps = await mapsRes.json();
      const meta = await metaRes.json();

      // Get correct level cap + prestiges
      const lc = levelCaps[game] || { cap: "Unknown", prestiges: 0 };

      // Build XP actions list
      const xpList = meta.xp_rewards
        ? Object.entries(meta.xp_rewards)
            .map(([action, xp]) => `<li>${action}: ${xp} XP</li>`)
            .join("")
        : "<li>No XP data available.</li>";

      // Build maps list
      const mapList = Array.isArray(maps)
        ? maps.map(m => `<li>${m.name ?? m}</li>`).join("")
        : "<li>No maps available.</li>";

      // Final content
      content.innerHTML = `
        <h3>XP & Level Info</h3>
        <p><strong>Level Cap:</strong> ${lc.cap}</p>
        <p><strong>Prestiges:</strong> ${lc.prestiges}</p>

        <h3>XP Actions</h3>
        <ul>${xpList}</ul>

        <h3>Maps</h3>
        <ul>${mapList}</ul>

        <h3>Leaderboards</h3>
        <a class="home-link" href="leaderboards.html?game=${game}">
          View Leaderboards
        </a>
      `;

      content.dataset.loaded = "true";

    } catch (err) {
      console.error(err);
      content.innerHTML = "<p>Error loading data. Try again later.</p>";
    }
  });
});
