const API = "https://api.playhive.com/v0";

// Handle dropdown clicks
document.querySelectorAll(".dropdown-card").forEach(card => {
  const header = card.querySelector(".dropdown-header");
  const content = card.querySelector(".dropdown-content");
  const game = card.dataset.game;

  header.addEventListener("click", async () => {
    // Toggle open/close
    card.classList.toggle("active");

    // If already loaded once, don't fetch again
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

      // Build XP rewards list
      const xpList = meta.xp_rewards
        ? Object.entries(meta.xp_rewards)
            .map(([action, xp]) => `<li>${action}: ${xp} XP</li>`)
            .join("")
        : "<li>No XP data available.</li>";

      // Build maps list
      const mapList = Array.isArray(maps)
        ? maps
            .map(m => `<li>${m.name ?? m}</li>`)
            .join("")
        : "<li>No maps available.</li>";

      // Build final content
      content.innerHTML = `
        <h3>XP & Level Info</h3>
        <p><strong>Level Cap:</strong> ${meta.level_cap ?? "Unknown"}</p>

        <h3>XP Actions</h3>
        <ul>${xpList}</ul>

        <h3>Maps</h3>
        <ul>${mapList}</ul>

        <h3>Leaderboards</h3>
        <a class="home-link" href="leaderboards.html?game=${game}">
          View Leaderboards
        </a>
      `;

      // Mark as loaded
      content.dataset.loaded = "true";

    } catch (err) {
      console.error(err);
      content.innerHTML = "<p>Error loading data. Try again later.</p>";
    }
  });
});
