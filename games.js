const API = "https://api.playhive.com/v0";

document.querySelectorAll(".dropdown-header").forEach(header => {
  header.addEventListener("click", async () => {
    const card = header.parentElement;
    const content = card.querySelector(".dropdown-content");
    const game = card.dataset.game;

    // Toggle open/close
    card.classList.toggle("active");

    // If already loaded, don't reload
    if (content.dataset.loaded) return;

    content.innerHTML = "<p>Loading...</p>";

    try {
      const [mapsRes, metaRes] = await Promise.all([
        fetch(`${API}/game/map/${game}`),
        fetch(`${API}/game/meta/${game}`)
      ]);

      const maps = await mapsRes.json();
      const meta = await metaRes.json();

      content.innerHTML = `
        <h3>XP & Level Info</h3>
        <p>Level Cap: ${meta.level_cap ?? "Unknown"}</p>

        <h3>XP Actions</h3>
        <ul>
          ${Object.entries(meta.xp_rewards || {})
            .map(([action, xp]) => `<li>${action}: ${xp} XP</li>`)
            .join("")}
        </ul>

        <h3>Maps</h3>
        <ul>
          ${maps.map(m => `<li>${m}</li>`).join("")}
        </ul>

        <h3>Leaderboards</h3>
        <a class="home-link" href="leaderboards.html?game=${game}">View Leaderboards</a>
      `;

      content.dataset.loaded = "true";

    } catch (err) {
      content.innerHTML = "<p>Error loading data.</p>";
    }
  });
});
