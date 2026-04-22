// ⭐ Load Hive Stats Automatically
async function loadHiveStats(username) {
  const url = `https://api.playhive.com/v0/game/all/all/${username}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("User not found");
    return await res.json();
  } catch (err) {
    console.error(err);
    return null;
  }
}

// Map API gamemode keys → XP table keys
const XP_MODE_MAP = {
  bed: "bedwars",
  sky: "skywars",
  dr: "deathrun",
  party: "blockparty",
  drop: "blockdrop",
  ctf: "ctf",
  murder: "murdermystery",
  sg: "survivalgames",
  hide: "hideandseek",
  ground: "groundwars",
  build: "buildbattle",
  bridge: "bridge",
  grav: "gravity"
};

const MODE_ICONS = {
  bed: "icons/bed-icon.webp",
  party: "icons/bp-icon.webp",
  bridge: "icons/bridge-icon.webp",
  build: "icons/build-icon.webp",
  ctf: "icons/ctf-icon.webp",
  dr: "icons/dr-icon.webp",
  drop: "icons/drop-icon.webp",
  grav: "icons/grav-icon.webp",
  ground: "icons/ground-icon.webp",
  hide: "icons/hide-icon.webp",
  murder: "icons/mm-icon.webp",
  sg: "icons/sg-icon.webp",
  sky: "icons/sky-icon.webp"
};

let globalXp = 0;
let globalGames = 0;
let globalWins = 0;
let globalTable = [];
let hideUnplayed = false;
let sortDirection = "desc";

// ⭐ XP TABLES
const XP_TABLES = {
  bedwars: [...],
  skywars: [...],
  blockdrop: [...],
  blockparty: [...],
  bridge: [...],
  buildbattle: [...],
  ctf: [...],
  deathrun: [...],
  gravity: [...],
  groundwars: [...],
  hideandseek: [...],
  murdermystery: [...],
  survivalgames: [...]
};

// ⭐ Sorting Function (with asc/desc support)
function sortModes(data, sortType) {
  const result = Object.entries(data).sort((a, b) => {
    const A = a[1];
    const B = b[1];

    const xpA = A?.xp ?? 0;
    const xpB = B?.xp ?? 0;

    const gamesA = A?.played ?? 0;
    const gamesB = B?.played ?? 0;

    const winsA = A?.victories ?? 0;
    const winsB = B?.victories ?? 0;

    const kdA = (A?.kills ?? 0) / ((A?.deaths ?? 1) || 1);
    const kdB = (B?.kills ?? 0) / ((B?.deaths ?? 1) || 1);

    const maxA = XP_TABLES[XP_MODE_MAP[a[0]]]?.slice(-1)[0] ?? 1;
    const maxB = XP_TABLES[XP_MODE_MAP[b[0]]]?.slice(-1)[0] ?? 1;

    const completeA = xpA / maxA;
    const completeB = xpB / maxB;

    switch (sortType) {
      case "xp": return xpB - xpA;
      case "winrate": return (winsB / (gamesB || 1)) - (winsA / (gamesA || 1));
      case "kd": return kdB - kdA;
      case "complete": return completeB - completeA;
      case "games":
      default: return gamesB - gamesA;
    }
  });

  return sortDirection === "asc" ? result.reverse() : result;
}

// ⭐ Highlights Section (fixed to avoid null-level crash)
function generateHighlights(data) {
  const container = document.getElementById("highlightsCard");
  const content = document.getElementById("highlightsContent");

  // FIX: Only include valid gamemodes
  const modes = Object.entries(data).filter(([m, s]) =>
    XP_MODE_MAP[m] && s && (s.xp || s.played)
  );

  if (modes.length === 0) {
    container.style.display = "none";
    return;
  }

  const highestLevel = modes.reduce((a, b) =>
    getLevelInfo(a[0], a[1].xp).level > getLevelInfo(b[0], b[1].xp).level ? a : b
  );

  const bestWinrate = modes.reduce((a, b) =>
    (a[1].victories / (a[1].played || 1)) >
    (b[1].victories / (b[1].played || 1)) ? a : b
  );

  const mostGames = modes.reduce((a, b) =>
    a[1].played > b[1].played ? a : b
  );

  const bestKD = modes.reduce((a, b) =>
    ((a[1].kills || 0) / ((a[1].deaths || 1))) >
    ((b[1].kills || 0) / ((b[1].deaths || 1))) ? a : b
  );

  const oldest = modes.reduce((a, b) =>
    (a[1].first_played || Infinity) < (b[1].first_played || Infinity) ? a : b
  );

  const mostXP = modes.reduce((a, b) =>
    a[1].xp > b[1].xp ? a : b
  );

  content.innerHTML = `
    <div><strong>Highest Level:</strong> ${highestLevel[0]}</div>
    <div><strong>Best Winrate:</strong> ${bestWinrate[0]}</div>
    <div><strong>Most Games:</strong> ${mostGames[0]}</div>
    <div><strong>Best K/D:</strong> ${bestKD[0]}</div>
    <div><strong>Oldest Mode:</strong> ${oldest[0]}</div>
    <div><strong>Most XP:</strong> ${mostXP[0]}</div>
  `;

  container.style.display = "block";
}
// ⭐ OVERVIEW CARD GENERATOR
function generateOverviewCards(data) {
  generateHighlights(data);

  const container = document.getElementById("overviewContainer");
  container.innerHTML = "";

  const sortType = document.getElementById("sortSelect")?.value || "games";
  const sorted = sortModes(data, sortType);

  const modeNames = {
    bed: "BedWars",
    sky: "SkyWars",
    dr: "Deathrun",
    party: "Block Party",
    drop: "Block Drop",
    ctf: "Capture the Flag",
    murder: "Murder Mystery",
    sg: "Survival Games",
    hide: "Hide and Seek",
    ground: "Ground Wars",
    build: "Build Battle",
    bridge: "The Bridge",
    grav: "Gravity"
  };

  for (const [mode, s] of sorted) {
    if (!s) continue;
    if (!XP_MODE_MAP[mode]) continue;
    if (hideUnplayed && (s.played ?? 0) === 0) continue;

    const xp = s.xp ?? 0;
    const played = s.played ?? 0;
    const wins = s.victories ?? 0;
    const losses = played - wins;
    const winrate = played > 0 ? ((wins / played) * 100).toFixed(2) : "0.00";

    const info = getLevelInfo(mode, xp);
    const percentToNext = (info.progressToNext * 100).toFixed(2);

    const maxXp = XP_TABLES[XP_MODE_MAP[mode]][XP_TABLES[XP_MODE_MAP[mode]].length - 1];
    const percentComplete = ((xp / maxXp) * 100).toFixed(2);

    const firstPlayed = s.first_played
      ? new Date(s.first_played * 1000).toDateString()
      : "Unknown";

    const kd = (s.kills && s.deaths)
      ? (s.deaths === 0 ? s.kills : (s.kills / s.deaths).toFixed(2))
      : null;

    const fkdr = (s.final_kills && s.deaths)
      ? (s.deaths === 0 ? s.final_kills : (s.final_kills / s.deaths).toFixed(2))
      : null;

    const ed = (mode === "murder" && s.deaths)
      ? (s.deaths / played).toFixed(2)
      : null;

    const kpg = (mode === "hide" && s.hider_kills)
      ? (s.hider_kills / played).toFixed(2)
      : null;

    const prestige = s.prestige ?? 0;

    const rows = [];
    const add = (label, value) => {
      if (value !== null && value !== undefined) {
        rows.push(`<div class="ov-row"><span>${label}:</span> <span>${value}</span></div>`);
      }
    };

    add("First Played", firstPlayed);
    add("Experience", xp.toLocaleString());
    add("Played", played.toLocaleString());
    add("Victories", wins.toLocaleString());
    add("Losses", losses.toLocaleString());
    add("Win Percentage", winrate + "%");

    add("Kills", s.kills);
    add("Final Kills", s.final_kills);
    add("Deaths", s.deaths);
    add("K/D Ratio", kd);
    add("Final K/D", fkdr);

    add("E/D Ratio", ed);
    add("Kills Per Game", kpg);

    add("Beds Destroyed", s.beds_destroyed);
    add("Coins Collected", s.coins);
    add("Murders", s.murders);
    add("Murderers Killed", s.murderer_eliminations);
    add("Mystery Chests Opened", s.mystery_chests_destroyed);
    add("Ores Mined", s.ores_mined);
    add("Spells Used", s.spells_used);
    add("Powerups Collected", s.powerups_collected);
    add("Rounds Survived", s.rounds_survived);
    add("Checkpoints Passed", s.checkpoints);
    add("Traps Activated", s.activated);
    add("Hiders Killed", s.hider_kills);
    add("Seekers Killed", s.seeker_kills);
    add("Maps Completed", s.maps_completed);
    add("Maps Survived", s.maps_completed_without_dying);
    add("Assists", s.assists);
    add("Flags Captured", s.flags_captured);
    add("Flags Returned", s.flags_returned);
    add("Blocks Destroyed", s.blocks_destroyed);
    add("Vaults Used", s.vaults_used);
    add("Crates Looted", s.crates);
    add("Cows Looted", s.cows);
    add("Deathmatches", s.deathmatches);
    add("Teleporters Used", s.teleporters_used);
    add("Launchpads Used", s.launchpads_used);
    add("Flares Used", s.flares_used);
    add("Goals Scored", s.goals);
    add("Blocks Placed", s.blocks_placed);
    add("Projectiles Fired", s.projectiles_fired);

    if (prestige > 0) add("Prestige", prestige);

    const card = document.createElement("div");
    card.className = "overview-card";

    card.innerHTML = `
      <h3>
        <img src="${MODE_ICONS[mode]}" class="gm-icon">
        ${modeNames[mode]}
      </h3>

      <div class="overview-stats">
        <div class="ov-row"><span>Total Complete:</span> <span>${percentComplete}%</span></div>
        <div class="ov-row"><span>To Next Level:</span> <span>${percentToNext}%</span></div>
        ${rows.join("")}
      </div>

      <div class="mini-progress-label">
        Level ${info.level} → ${info.nextLevel}
      </div>

      <div class="mini-progress">
        <div class="mini-progress-fill" style="width:${percentToNext}%"></div>
        <div class="mini-progress-text">${percentToNext}%</div>
      </div>
    `;

    container.appendChild(card);
  }
}

// ⭐ LEVEL INFO
function getLevelInfo(mode, xp) {
  const table = XP_TABLES[XP_MODE_MAP[mode]];
  if (!table) return null;

  let level = 1;
  for (let i = 0; i < table.length; i++) {
    if (xp >= table[i]) level = i + 1;
    else break;
  }

  const maxLevel = table.length;
  const currentLevelXp = table[level - 1];
  const nextLevel = level < maxLevel ? level + 1 : level;
  const nextLevelXp = table[nextLevel - 1];
  const xpToNext = level === maxLevel ? 0 : nextLevelXp - xp;
  const progressToNext =
    level === maxLevel ? 1 : (xp - currentLevelXp) / (nextLevelXp - currentLevelXp);

  return {
    level,
    maxLevel,
    currentLevelXp,
    nextLevel,
    nextLevelXp,
    xpToNext,
    progressToNext: Math.max(0, Math.min(1, progressToNext))
  };
}

// ⭐ Formatting Helpers
function formatPercent(v) {
  return (v * 100).toFixed(2) + "%";
}

function formatNumber(n) {
  return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

// ⭐ Load saved values
window.addEventListener("load", () => {
  if (localStorage.getItem("mode"))
    document.getElementById("modeSelect").value = localStorage.getItem("mode");
  if (localStorage.getItem("xp"))
    document.getElementById("xpInput").value = localStorage.getItem("xp");
  if (localStorage.getItem("games"))
    document.getElementById("gamesInput").value = localStorage.getItem("games");
  if (localStorage.getItem("wins"))
    document.getElementById("winsInput").value = localStorage.getItem("wins");

  loadFromURL();
});

// ⭐ Load URL parameters
function loadFromURL() {
  const p = new URLSearchParams(window.location.search);

  if (p.has("mode")) document.getElementById("modeSelect").value = p.get("mode");
  if (p.has("xp")) document.getElementById("xpInput").value = p.get("xp");
  if (p.has("games")) document.getElementById("gamesInput").value = p.get("games");
  if (p.has("wins")) document.getElementById("winsInput").value = p.get("wins");
}

// ⭐ Load Stats Button
document.getElementById("loadStatsBtn").addEventListener("click", async () => {
  const username = document.getElementById("usernameInput").value.trim();
  const status = document.getElementById("loadStatus");

  if (!username) {
    status.textContent = "Please enter a username.";
    return;
  }

  status.textContent = "Loading stats...";

  const data = await loadHiveStats(username);

  if (!data) {
    status.textContent = "User not found.";
    return;
  }

  status.textContent = "Stats loaded!";
  generateOverviewCards(data);
  window.lastLoadedStats = data;
  await loadPlayerCard(username);

  const mode = document.getElementById("modeSelect").value;

  document.getElementById("xpInput").value = data[mode]?.xp ?? 0;
  document.getElementById("winsInput").value = data[mode]?.victories ?? 0;
  document.getElementById("gamesInput").value = data[mode]?.played ?? 0;
});
// ⭐ CALCULATE BUTTON
document.getElementById("calcBtn").addEventListener("click", () => {
  const mode = document.getElementById("modeSelect").value;
  const xp = Number(document.getElementById("xpInput").value) || 0;
  const games = Number(document.getElementById("gamesInput").value) || 0;
  const wins = Number(document.getElementById("winsInput").value) || 0;
  const targetLevelInput = document.getElementById("targetLevelInput").value;
  const targetLevel = targetLevelInput ? Number(targetLevelInput) : null;

  const resultsDiv = document.getElementById("results");
  const table = XP_TABLES[XP_MODE_MAP[mode]];

  globalXp = xp;
  globalGames = games;
  globalWins = wins;
  globalTable = table;

  localStorage.setItem("mode", mode);
  localStorage.setItem("xp", xp);
  localStorage.setItem("games", games);
  localStorage.setItem("wins", wins);

  if (!table) {
    resultsDiv.innerHTML = "<p>Unknown gamemode.</p>";
    return;
  }

  const info = getLevelInfo(mode, xp);
  if (!info) {
    resultsDiv.innerHTML = "<p>Could not compute level.</p>";
    return;
  }

  const winrate = games > 0 ? wins / games : 0;
  const xpPerGame = games > 0 ? xp / games : 0;

  let targetLvl = targetLevel && targetLevel >= 1 ? targetLevel : info.nextLevel;
  if (targetLvl > info.maxLevel) targetLvl = info.maxLevel;

  const targetXp = table[targetLvl - 1];
  const xpRemainingToTarget = Math.max(0, targetXp - xp);
  const gamesNeededToTarget = xpPerGame > 0 ? xpRemainingToTarget / xpPerGame : 0;
  const winsNeededToTarget = gamesNeededToTarget * winrate;

  resultsDiv.innerHTML = `
    <div class="result-grid">
      <div class="result-item">
        <h3>Current Level</h3>
        <p>${info.level} / ${info.maxLevel}</p>
      </div>

      <div class="result-item">
        <h3>XP</h3>
        <p>${formatNumber(xp)} XP</p>
        <p class="small">Next level at ${formatNumber(info.nextLevelXp)} XP</p>
      </div>

      <div class="result-item">
        <h3>Progress to Next Level</h3>
        <p>${formatPercent(info.progressToNext)}</p>
        <p class="small">${formatNumber(info.xpToNext)} XP remaining</p>
      </div>

      <div class="result-item">
        <h3>Winrate</h3>
        <p>${formatPercent(winrate)}</p>
        <p class="small">${formatNumber(wins)} wins / ${formatNumber(games)} games</p>
      </div>

      <div class="result-item">
        <h3>XP per Game</h3>
        <p>${formatNumber(xpPerGame)} XP</p>
      </div>

      <div class="result-item">
        <h3>Target Level</h3>
        <p>Level ${targetLvl}</p>
        <p class="small">${formatNumber(xpRemainingToTarget)} XP remaining</p>
      </div>

      <div class="result-item">
        <h3>Games Needed (to Target)</h3>
        <p>${xpPerGame > 0 ? formatNumber(gamesNeededToTarget) : "N/A"}</p>
      </div>

      <div class="result-item">
        <h3>Wins Needed (to Target)</h3>
        <p>${xpPerGame > 0 ? formatNumber(winsNeededToTarget) : "N/A"}</p>
      </div>
    </div>

    <p class="small">
      Note: XP tables are cumulative. Target level defaults to your next level if left empty.
    </p>
  `;

  // ⭐ Progress Bar
  const progressBarContainer = document.getElementById("progressBarContainer");
  const progressBar = document.getElementById("progressBar");
  const progressText = document.getElementById("progressText");

  if (progressBarContainer && progressBar && progressText) {
    progressBarContainer.style.display = "block";

    const maxXp = table[table.length - 1];
    const rawPercent = (xp / maxXp) * 100;
    const percentText = rawPercent.toFixed(2) + "%";

    progressBar.style.transition = "none";
    progressBar.style.width = "0%";

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        progressBar.style.transition = "width 0.8s ease-in-out";
        progressBar.style.width = rawPercent + "%";
      });
    });

    progressText.textContent = percentText;
  }
});

// ⭐ Grind Calculator
document.getElementById("grindCalcBtn").addEventListener("click", () => {
  const avgMins = Number(document.getElementById("avgGameLength").value) || 0;
  const gpd = Number(document.getElementById("gamesPerDay").value) || 0;

  const grindDiv = document.getElementById("grindResults");

  if (avgMins <= 0 || gpd <= 0) {
    grindDiv.innerHTML = "<p>Please enter valid numbers.</p>";
    return;
  }

  if (!globalTable.length) {
    grindDiv.innerHTML = "<p>Please calculate your stats first.</p>";
    return;
  }

  const xpPerGame = globalGames > 0 ? globalXp / globalGames : 0;
  const xpPerDay = xpPerGame * gpd;

  const maxXp = globalTable[globalTable.length - 1];
  const xpRemaining = Math.max(0, maxXp - globalXp);

  const daysToMax = xpPerDay > 0 ? xpRemaining / xpPerDay : Infinity;
  const hoursPerDay = (avgMins * gpd) / 60;
  const totalHoursToMax = daysToMax * hoursPerDay;

  grindDiv.innerHTML = `
    <div class="result-grid">
      <div class="result-item">
        <h3>XP per Day</h3>
        <p>${formatNumber(xpPerDay)} XP</p>
      </div>

      <div class="result-item">
        <h3>Days to Max Level</h3>
        <p>${daysToMax === Infinity ? "N/A" : daysToMax.toFixed(1)}</p>
      </div>

      <div class="result-item">
        <h3>Hours per Day</h3>
        <p>${hoursPerDay.toFixed(1)} hours</p>
      </div>

      <div class="result-item">
        <h3>Total Hours to Max</h3>
        <p>${totalHoursToMax === Infinity ? "N/A" : totalHoursToMax.toFixed(1)}</p>
      </div>
    </div>
  `;
});

// ⭐ Goal Date Planner
document.getElementById("goalCalcBtn").addEventListener("click", () => {
  const goalLevel = Number(document.getElementById("goalLevel").value);
  const goalDateInput = document.getElementById("goalDate").value;

  const goalDiv = document.getElementById("goalResults");

  if (!goalLevel || !goalDateInput) {
    goalDiv.innerHTML = "<p>Please enter a target level and date.</p>";
    return;
  }

  if (!globalTable.length) {
    goalDiv.innerHTML = "<p>Please calculate your stats first.</p>";
    return;
  }

  const goalDate = new Date(goalDateInput);
  const today = new Date();

  const daysLeft = Math.ceil((goalDate - today) / (1000 * 60 * 60 * 24));

  if (daysLeft <= 0) {
    goalDiv.innerHTML = "<p>The date must be in the future.</p>";
    return;
  }

  const maxLevel = globalTable.length;
  const safeGoalLevel = Math.min(goalLevel, maxLevel);

  const goalXp = globalTable[safeGoalLevel - 1];
  const xpRemaining = Math.max(0, goalXp - globalXp);

  const xpPerDayNeeded = xpRemaining / daysLeft;

  const xpPerGame = globalGames > 0 ? globalXp / globalGames : 0;
  const gamesPerDayNeeded = xpPerGame > 0 ? xpPerDayNeeded / xpPerGame : Infinity;

  goalDiv.innerHTML = `
    <div class="result-grid">
      <div class="result-item">
        <h3>Days Left</h3>
        <p>${daysLeft}</p>
      </div>

      <div class="result-item">
        <h3>XP Needed</h3>
        <p>${formatNumber(xpRemaining)} XP</p>
      </div>

      <div class="result-item">
        <h3>XP per Day Required</h3>
        <p>${formatNumber(xpPerDayNeeded)}</p>
      </div>

      <div class="result-item">
        <h3>Games per Day Required</h3>
        <p>${gamesPerDayNeeded === Infinity ? "N/A" : gamesPerDayNeeded.toFixed(1)}</p>
      </div>
    </div>

    <p class="small">
      Goal: Reach Level ${safeGoalLevel} by ${goalDate.toDateString()}
    </p>
  `;
});

// ⭐ Tab Switching System
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const tab = btn.dataset.tab;

    document.querySelectorAll(".tab-content").forEach(sec => {
      sec.style.display = "none";
    });

    document.getElementById(`tab-${tab}`).style.display = "block";
  });
});

// ⭐ Auto-fill XP/Wins/Games when switching gamemodes
document.getElementById("modeSelect").addEventListener("change", () => {
  if (!window.lastLoadedStats) return;

  const mode = document.getElementById("modeSelect").value;
  const data = window.lastLoadedStats;

  document.getElementById("xpInput").value = data[mode]?.xp ?? 0;
  document.getElementById("winsInput").value = data[mode]?.victories ?? 0;
  document.getElementById("gamesInput").value = data[mode]?.played ?? 0;

  document.getElementById("calcBtn").click();
});

// ⭐ AUTOCOMPLETE SYSTEM
const usernameInput = document.getElementById("usernameInput");
const autocompleteList = document.getElementById("autocompleteList");
let autocompleteTimeout = null;

usernameInput.addEventListener("input", () => {
  const query = usernameInput.value.trim();

  if (autocompleteTimeout) clearTimeout(autocompleteTimeout);

  if (query.length < 2) {
    autocompleteList.style.display = "none";
    return;
  }

  autocompleteTimeout = setTimeout(() => {
    fetch(`https://api.playhive.com/v0/player/search/${query}`)
      .then(res => {
        if (res.status === 422) return [];
        return res.json();
      })
      .then(names => {
        autocompleteList.innerHTML = "";

        if (!names || names.length === 0) {
          autocompleteList.style.display = "none";
          return;
        }

        names.forEach(name => {
          const item = document.createElement("div");
          item.className = "autocomplete-item";
          item.textContent = name.username_cc;

          item.addEventListener("click", () => {
            usernameInput.value = name.username;
            autocompleteList.style.display = "none";
          });

          autocompleteList.appendChild(item);
        });

        autocompleteList.style.display = "block";
      })
      .catch(() => {
        autocompleteList.style.display = "none";
      });
  }, 200);
});

// ⭐ Sorting & Hide Toggles
document.getElementById("sortSelect").addEventListener("change", () => {
  if (window.lastLoadedStats) generateOverviewCards(window.lastLoadedStats);
});

document.getElementById("hideUnplayed").addEventListener("change", e => {
  hideUnplayed = e.target.checked;
  if (window.lastLoadedStats) generateOverviewCards(window.lastLoadedStats);
});

document.getElementById("sortDirBtn").addEventListener("click", () => {
  sortDirection = sortDirection === "desc" ? "asc" : "desc";
  document.getElementById("sortDirBtn").textContent =
    sortDirection === "desc" ? "▼" : "▲";

  if (window.lastLoadedStats) generateOverviewCards(window.lastLoadedStats);
});
