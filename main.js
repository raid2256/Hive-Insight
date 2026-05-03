// ⭐ HIVE STATS CORE – QUARTER 1
let sessionData = null;
let discordUser = null;
let linkedAccount = null;

// Load Hive stats
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

// Mode maps
const XP_MODE_MAP = {
  bed: "bedwars", sky: "skywars", dr: "deathrun", party: "blockparty",
  drop: "blockdrop", ctf: "ctf", murder: "murdermystery", sg: "survivalgames",
  hide: "hideandseek", ground: "groundwars", build: "buildbattle",
  bridge: "bridge", grav: "gravity"
};

const MODE_ICONS = {
  bed: "icons/bed-icon.webp", party: "icons/bp-icon.webp", bridge: "icons/bridge-icon.webp",
  build: "icons/build-icon.webp", ctf: "icons/ctf-icon.webp", dr: "icons/dr-icon.webp",
  drop: "icons/drop-icon.webp", grav: "icons/grav-icon.webp", ground: "icons/ground-icon.webp",
  hide: "icons/hide-icon.webp", murder: "icons/mm-icon.webp", sg: "icons/sg-icon.webp", sky: "icons/sky-icon.webp"
};

const modeNames = {
  bed: "BedWars", sky: "SkyWars", dr: "Deathrun", party: "Block Party", drop: "Block Drop",
  ctf: "Capture the Flag", murder: "Murder Mystery", sg: "Survival Games", hide: "Hide and Seek",
  ground: "Ground Wars", build: "Build Battle", bridge: "The Bridge", grav: "Gravity"
};

// Globals
let hideUnplayed = false;
let sortDirection = "desc";
window.lastLoadedStats = null;

// XP tables (unchanged, full tables remain here)
// XP tables
const XP_TABLES = {
  bedwars: [0,150,450,900,1500,2250,3150,4200,5400,6750,8250,9900,11700,13650,15750,18000,
    20400,22950,25650,28500,31500,34650,37950,41400,45000,48750,52650,56700,60900,
    65250,69750,74400,79200,84150,89250,94500,99900,105450,111150,117000,123000,
    129150,135450,141900,148500,155250,162150,169200,176400,183750,191250,198900,
    206550,214200,221850,229500,237150,244800,252450,260100,267750,275400,283050,
    290700,298350,306000,313650,321300,328950,336600,344250,351900,359550,367200,
    374850,382500,390150,397800,405450,413100,420750,428400,436050,443700,451350,
    459000,466650,474300,481950,489600,497250,504900,512550,520200,527850,535500,
    543150,550800,558450,566100],
  skywars: [0,150,450,900,1500,2250,3150,4200,5400,6750,8250,9900,11700,13650,15750,18000,
    20400,22950,25650,28500,31500,34650,37950,41400,45000,48750,52650,56700,60900,
    65250,69750,74400,79200,84150,89250,94500,99900,105450,111150,117000,123000,
    129150,135450,141900,148500,155250,162150,169200,176400,183750,191250,198900,
    206550,214200,221850,229500,237150,244800,252450,260100,267750,275400,283050,
    290700,298350,306000,313650,321300,328950,336600,344250,351900,359550,367200,
    374850,382500,390150,397800,405450,413100,420750,428400,436050,443700,451350,
    459000,466650,474300,481950,489600,497250,504900,512550,520200,527850,535500,
    543150,550800,558450,566100],
  blockdrop: [0,150,450,900,1500,2250,3150,4200,5400,6750,8250,9900,11700,13650,15750,18000,
    20400,22950,25650,28500,31500,34650,37800,40950,44100],
  blockparty: [0,150,450,900,1500,2250,3150,4200,5400,6750,8250,9900,11700,13650,15750,18000,
    20400,22950,25650,28500,31500,34650,37950,41400,45000],
  bridge: [0,300,924,1897,3246,5001,7194,9860,13036,16762,21082,26043,31696,38096,45302,
    53378,62393,72422,83546,95852],
  buildbattle: [0,100,300,600,1000,1500,2100,2800,3600,4500,5500,6600,7800,9100,10500,12000,
    13600,15300,17100,19000,21000,23000,25300,27600,30000,32500,35500,37800,40600,
    43500],
  ctf: [0,150,450,900,1500,2250,3150,4200,5400,6750,8250,9900,11700,13650,15750,18000,
    20400,22950,25650,28500,31500,34650,37950,41400,45000,48750,52650,56700,60900,
    65250,69750,74400,79200,84150,89250,94500,99900,105450,111150,117000,123000,
    129150,135450,141900,148500,155250,162150,169200,176400,183750],
  deathrun: [0,200,600,1200,2000,3000,4200,5600,7200,9000,11000,13200,15600,18200,21000,
    24000,27200,30600,34200,38000,42000,46200,50600,55200,60000,65000,70200,75600,
    81200,87000,93000,99200,105600,112200,119000,126000,133200,140600,148200,
    156000,164000,172200,180400,188600,196800,205000,213200,221400,229600,237800,
    246000,254200,262400,270600,278800,287000,295200,303400,311600,319800,328000,
    336200,344400,352600,360800,369000,377200,385400,393600,401800,410000,418200,
    426400,434600,442800],
  gravity: [0,150,450,900,1500,2250,3150,4200,5400,6750,8250,9900,11700,13650,15750,18000,
    20400,22950,25650,28500,31500,34650,37950,41400,45000],
  groundwars: [0,150,450,900,1500,2250,3150,4200,5400,6750,8250,9900,11700,13650,15750,18000,
    20400,22950,25650,28500],
  hideandseek: [0,100,300,600,1000,1500,2100,2800,3600,4500,5500,6600,7800,9100,10500,12000,
    13600,15300,17100,19000,21000,23100,25300,27600,30000,32500,35100,37800,40600,
    43500,46500,49600,52800,56100,59500,63000,66600,70300,74100,78000,82000,86100,
    90300,94600,99000,103500,108100,112800,117600,122500,127500,132600,137800,
    143100,148500,154000,159600,165300,171100,177000,183000,189100,195300,201600,
    208000,214500,221100,227800,234600,241500,248500,255600,262800,270100,277500],
   murdermystery: [
    0,100,300,600,1000,1500,2100,2800,3600,4500,5500,6600,7800,9100,10500,12000,
    13600,15300,17100,19000,21000,23100,25300,27600,30000,32500,35100,37800,40600,
    43500,46500,49600,52800,56100,59500,63000,66600,70300,74100,78000,82000,86100,
    90300,94600,99000,103500,108100,112800,117600,122500,127500,132600,137800,
    143100,148500,154000,159600,165300,171100,177000,183000,189100,195300,201600,
    208000,214500,221100,227800,234600,241500,248500,255600,262800,270100,277500,
    285000,292600,300300,308100,316000,324000,332100,340200,348300,356400,364500,
    372600,380700,388800,396900,405000,413100,421200,429300,437400,445500,453600,
    461700,469800,477900
  ],
  survivalgames: [
    0,150,450,900,1500,2250,3150,4200,5400,6750,8250,9900,11700,13650,15750,18000,
    20400,22950,25650,28500,31500,34650,37950,41400,45000,48750,52650,56700,60900,
    65250,69750,74400,79200,84150,89250,94500,99900,105450,111150,117000,123000,
    129150,135450,141900,148500,155250,162150,169200,176400,183750
  ]

};

// Level info
function getLevelInfo(mode, xp) {
  const table = XP_TABLES[XP_MODE_MAP[mode]];
  if (!table) return {
    level: 1, maxLevel: 1, currentLevelXp: 0,
    nextLevel: 1, nextLevelXp: 0, xpToNext: 0, progressToNext: 0
  };

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
    level === maxLevel ? 1 : Math.max(0, Math.min(1, (xp - currentLevelXp) / (nextLevelXp - currentLevelXp)));

  return { level, maxLevel, currentLevelXp, nextLevel, nextLevelXp, xpToNext, progressToNext };
}

// Sorting
function sortModes(data, sortType) {
  const result = Object.entries(data).sort((a, b) => {
    const A = a[1] || {};
    const B = b[1] || {};

    const xpA = A.xp ?? 0;
    const xpB = B.xp ?? 0;
    const gamesA = A.played ?? 0;
    const gamesB = B.played ?? 0;
    const winsA = A.victories ?? 0;
    const winsB = B.victories ?? 0;
    const kdA = (A.kills ?? 0) / ((A.deaths ?? 1) || 1);
    const kdB = (B.kills ?? 0) / ((B.deaths ?? 1) || 1);

    const maxA = XP_TABLES[XP_MODE_MAP[a[0]]]?.slice(-1)[0] ?? 1;
    const maxB = XP_TABLES[XP_MODE_MAP[b[0]]]?.slice(-1)[0] ?? 1;
    const completeA = xpA / maxA;
    const completeB = xpB / maxB;

    switch (sortType) {
      case "xp": return xpB - xpA;
      case "winrate": return (winsB / (gamesB || 1)) - (winsA / (gamesA || 1));
      case "kd": return kdB - kdA;
      case "complete": return completeB - completeA;
      default: return gamesB - gamesA;
    }
  });

  return sortDirection === "asc" ? result.reverse() : result;
}
// Highlights
function generateHighlights(data) {
  const container = document.getElementById("highlightsCard");
  const content = document.getElementById("highlightsContent");
  if (!container || !content) return;

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
    ((a[1].kills || 0) / (a[1].deaths || 1)) >
    ((b[1].kills || 0) / (b[1].deaths || 1)) ? a : b
  );

  const oldest = modes.reduce((a, b) =>
    (a[1].first_played || Infinity) < (b[1].first_played || Infinity) ? a : b
  );

  const mostXP = modes.reduce((a, b) =>
    a[1].xp > b[1].xp ? a : b
  );

  content.innerHTML = `
    <div><strong>Highest Level:</strong> ${modeNames[highestLevel[0]]} — Level ${getLevelInfo(highestLevel[0], highestLevel[1].xp).level}</div>
    <div><strong>Best Winrate:</strong> ${modeNames[bestWinrate[0]]} — ${(
      (bestWinrate[1].victories / (bestWinrate[1].played || 1)) * 100
    ).toFixed(2)}%</div>
    <div><strong>Most Games:</strong> ${modeNames[mostGames[0]]} — ${mostGames[1].played.toLocaleString()}</div>
    <div><strong>Best K/D:</strong> ${modeNames[bestKD[0]]} — ${(
      (bestKD[1].kills || 0) / (bestKD[1].deaths || 1)
    ).toFixed(2)}</div>
    <div><strong>Oldest Mode:</strong> ${modeNames[oldest[0]]} — since ${
      oldest[1].first_played ? new Date(oldest[1].first_played * 1000).getFullYear() : "Unknown"
    }</div>
    <div><strong>Most XP:</strong> ${modeNames[mostXP[0]]} — ${mostXP[1].xp.toLocaleString()} XP</div>
  `;

  container.style.display = "block";
}

// Global stats
function generateGlobalStats(data) {
  let totalXP = 0, totalGames = 0, totalWins = 0, totalKills = 0, totalDeaths = 0;

  for (const mode in data) {
    if (!XP_MODE_MAP[mode]) continue;
    const s = data[mode];
    if (!s) continue;

    totalXP += s.xp ?? 0;
    totalGames += s.played ?? 0;
    totalWins += s.victories ?? 0;
    totalKills += s.kills ?? 0;
    totalDeaths += s.deaths ?? 0;
  }

  const avgWinrate = totalGames > 0 ? ((totalWins / totalGames) * 100).toFixed(2) : "0.00";
  const avgKD = totalDeaths > 0 ? (totalKills / totalDeaths).toFixed(2) : "0.00";

  const elXP = document.getElementById("globalXP");
  const elTG = document.getElementById("globalTotalGames");
  const elTW = document.getElementById("globalTotalWins");
  const elWR = document.getElementById("globalAvgWinrate");
  const elKD = document.getElementById("globalAvgKD");
  const card = document.getElementById("globalStatsCard");

  if (elXP) elXP.textContent = totalXP.toLocaleString();
  if (elTG) elTG.textContent = totalGames.toLocaleString();
  if (elTW) elTW.textContent = totalWins.toLocaleString();
  if (elWR) elWR.textContent = avgWinrate + "%";
  if (elKD) elKD.textContent = avgKD;
  if (card) card.style.display = "block";
}

// Overview cards
function generateOverviewCards(data) {
  generateGlobalStats(data);
  generateHighlights(data);

  const container = document.getElementById("overviewContainer");
  if (!container) return;
  container.innerHTML = "";

  const sortType = document.getElementById("sortSelect")?.value || "games";
  const sorted = sortModes(data, sortType);

  for (const [mode, s] of sorted) {
    if (!s || !XP_MODE_MAP[mode]) continue;
    if (hideUnplayed && (s.played ?? 0) === 0) continue;

    const xp = s.xp ?? 0;
    const played = s.played ?? 0;
    const wins = s.victories ?? 0;
    const losses = played - wins;
    const winrate = played > 0 ? ((wins / played) * 100).toFixed(2) : "0.00";

    const info = getLevelInfo(mode, xp);
    const percentToNext = (info.progressToNext * 100).toFixed(2);
    const maxXp = XP_TABLES[XP_MODE_MAP[mode]].slice(-1)[0];
    const percentComplete = ((xp / maxXp) * 100).toFixed(2);

    const firstPlayed = s.first_played
      ? new Date(s.first_played * 1000).toDateString()
      : "Unknown";

    const kd = (s.kills && s.deaths)
      ? (s.deaths === 0 ? s.kills : (s.kills / s.deaths).toFixed(2))
      : null;

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
    add("Deaths", s.deaths);
    if (kd) add("K/D Ratio", kd);

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

// Load saved values + URL param
window.addEventListener("load", () => {
  // Retrieve DOM elements
  const elMode = document.getElementById("modeSelect");
  const elXP = document.getElementById("xpInput");
  const elG = document.getElementById("gamesInput");
  const elW = document.getElementById("winsInput");

  // Safely check and populate localStorage values into the inputs
if (elMode) elMode.value = "";
if (elXP) elXP.value = "";
if (elG) elG.value = "";
if (elW) elW.value = "";

});

/* ================================
   ⭐ QUARTER 2 — CALCULATORS
   ================================ */

 

    /* ================================
   ⭐ QUARTER 2 — CALCULATORS
   Level Calculator + Grind + Goals
   ================================ */

// Helper formatting
function formatPercent(v) {
  return (v * 100).toFixed(2) + "%";
}
function formatNumber(n) {
  return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

/* ================================
   ⭐ LEVEL CALCULATOR
   ================================ */

document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const tab = btn.dataset.tab;

    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    document.querySelectorAll(".tab-content").forEach(sec => sec.style.display = "none");

    const activeTab = document.getElementById(`tab-${tab}`);
    activeTab.style.display = "block";

    // ⭐ Attach calculator listener when LEVEL tab is opened
    if (tab === "level") {
      const calcBtn = document.getElementById("calcBtn");
      console.log("calcBtn on tab open:", calcBtn);

      if (calcBtn && !calcBtn.dataset.listenerAdded) {
        calcBtn.addEventListener("click", () => {
          console.log("CALC CLICKED");

          const mode = document.getElementById("modeSelect").value;
          const xp = Number(document.getElementById("xpInput").value) || 0;
          const games = Number(document.getElementById("gamesInput").value) || 0;
          const wins = Number(document.getElementById("winsInput").value) || 0;
          const targetLvlInput = document.getElementById("targetLevelInput").value;

          const resultsDiv = document.getElementById("results");
          const table = XP_TABLES[XP_MODE_MAP[mode]];
          if (!table) return;

          const info = getLevelInfo(mode, xp);

          let targetLvl = targetLvlInput ? Number(targetLvlInput) : info.nextLevel;
          if (targetLvl > table.length) targetLvl = table.length;

          const xpRemaining = Math.max(0, table[targetLvl - 1] - xp);
          const winrate = games > 0 ? wins / games : 0;
          const xpPerGame = games > 0 ? xp / games : 0;
          const gamesNeeded = xpPerGame > 0 ? xpRemaining / xpPerGame : 0;
          const winsNeeded = gamesNeeded * winrate;

          resultsDiv.innerHTML = `
            <div class="result-grid">
              <div class="result-item"><h3>Current Level</h3><p>${info.level} / ${table.length}</p></div>
              <div class="result-item"><h3>XP</h3><p>${xp.toLocaleString()} XP</p></div>
              <div class="result-item"><h3>Progress</h3><p>${(info.progressToNext * 100).toFixed(2)}%</p></div>
              <div class="result-item"><h3>Winrate</h3><p>${(winrate * 100).toFixed(2)}%</p></div>
              <div class="result-item"><h3>XP/Game</h3><p>${xpPerGame.toFixed(2)}</p></div>
              <div class="result-item"><h3>Target Level</h3><p>${targetLvl}</p></div>
              <div class="result-item"><h3>XP Needed</h3><p>${xpRemaining.toLocaleString()}</p></div>
              <div class="result-item"><h3>Games Needed</h3><p>${gamesNeeded.toFixed(2)}</p></div>
              <div class="result-item"><h3>Wins Needed</h3><p>${winsNeeded.toFixed(2)}</p></div>
            </div>
          `;

          updateProgressBar(xp, table);
        });

        calcBtn.dataset.listenerAdded = "true";
      }
    }
  });
});



/* ================================
   ⭐ PROGRESS BAR ANIMATION
   ================================ */
function updateProgressBar(xp, table) {
  const barContainer = document.getElementById("progressBarContainer");
  const bar = document.getElementById("progressBar");
  const text = document.getElementById("progressText");

  if (!barContainer || !bar || !text) return;

  const maxXp = table[table.length - 1];
  const percent = (xp / maxXp) * 100;
  const percentText = percent.toFixed(2) + "%";

  barContainer.style.display = "block";

  bar.style.transition = "none";
  bar.style.width = "0%";

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      bar.style.transition = "width 0.8s ease-in-out";
      bar.style.width = percent + "%";
    });
  });

  text.textContent = percentText;
}

/* ================================
   ⭐ GRIND CALCULATOR
   ================================ */
const grindBtn = document.getElementById("grindCalcBtn");
if (grindBtn) {
  grindBtn.addEventListener("click", () => {
    const avgMins = Number(document.getElementById("avgGameLength").value) || 0;
    const gpd = Number(document.getElementById("gamesPerDay").value) || 0;
    const grindDiv = document.getElementById("grindResults");

    if (avgMins <= 0 || gpd <= 0) {
      grindDiv.innerHTML = "<p>Please enter valid numbers.</p>";
      return;
    }

    if (!window.lastLoadedStats) {
      grindDiv.innerHTML = "<p>Load stats first.</p>";
      return;
    }

    // Total XP across all modes
    let totalXP = 0, totalGames = 0;
    for (const m in window.lastLoadedStats) {
      if (XP_MODE_MAP[m]) {
        totalXP += window.lastLoadedStats[m].xp || 0;
        totalGames += window.lastLoadedStats[m].played || 0;
      }
    }

    const xpPerGame = totalGames > 0 ? totalXP / totalGames : 0;
    const xpPerDay = xpPerGame * gpd;
    const hoursPerDay = (avgMins * gpd) / 60;

    grindDiv.innerHTML = `
      <div class="result-grid">
        <div class="result-item"><h3>XP per Day</h3><p>${formatNumber(xpPerDay)}</p></div>
        <div class="result-item"><h3>Hours per Day</h3><p>${hoursPerDay.toFixed(1)}</p></div>
      </div>
      <p class="small">Grind calculator estimates based on your global XP/game.</p>
    `;
  });
}

/* ================================
   ⭐ GOAL PLANNER
   ================================ */
const goalBtn = document.getElementById("goalCalcBtn");
if (goalBtn) {
  goalBtn.addEventListener("click", () => {
    const goalLevel = Number(document.getElementById("goalLevel").value);
    const goalDateInput = document.getElementById("goalDate").value;
    const goalDiv = document.getElementById("goalResults");

    if (!goalLevel || !goalDateInput) {
      goalDiv.innerHTML = "<p>Please enter a target level and date.</p>";
      return;
    }

    if (!window.lastLoadedStats) {
      goalDiv.innerHTML = "<p>Load stats first.</p>";
      return;
    }

    const mode = document.getElementById("modeSelect").value;
    const table = XP_TABLES[XP_MODE_MAP[mode]];
    const xp = Number(document.getElementById("xpInput").value) || 0;

    const goalDate = new Date(goalDateInput);
    const today = new Date();
    const daysLeft = Math.ceil((goalDate - today) / (1000 * 60 * 60 * 24));

    if (daysLeft <= 0) {
      goalDiv.innerHTML = "<p>Date must be in the future.</p>";
      return;
    }

    const safeGoal = Math.min(goalLevel, table.length);
    const goalXp = table[safeGoal - 1];
    const xpRemaining = Math.max(0, goalXp - xp);

    const xpPerDay = xpRemaining / daysLeft;

    const games = Number(document.getElementById("gamesInput").value) || 0;
    const xpPerGame = games > 0 ? xp / games : 0;
    const gamesPerDay = xpPerGame > 0 ? xpPerDay / xpPerGame : Infinity;

    goalDiv.innerHTML = `
      <div class="result-grid">
        <div class="result-item"><h3>Days Left</h3><p>${daysLeft}</p></div>
        <div class="result-item"><h3>XP Needed</h3><p>${formatNumber(xpRemaining)}</p></div>
        <div class="result-item"><h3>XP/Day Required</h3><p>${formatNumber(xpPerDay)}</p></div>
        <div class="result-item"><h3>Games/Day Required</h3><p>${gamesPerDay.toFixed(1)}</p></div>
      </div>
      <p class="small">Goal: Level ${safeGoal} by ${goalDate.toDateString()}</p>
    `;
  });
}

/* ================================
   ⭐ LOAD STATS BUTTON HANDLER
   ================================ */

const loadStatsBtn = document.getElementById("loadStatsBtn");

if (loadStatsBtn) {
  loadStatsBtn.addEventListener("click", async () => {
    console.log("LOAD STATS CLICKED");

    const username = document.getElementById("usernameInput").value.trim();
    if (!username) {
      alert("Please enter a username");
      return;
    }

    const status = document.getElementById("loadStatus");
    if (status) status.textContent = "Loading stats...";

    const data = await loadHiveStats(username);

    if (!data) {
      if (status) status.textContent = "User not found";
      return;
    }

    window.lastLoadedStats = data;

    document.getElementById("pcName").textContent = username;
// ⭐ Switch to Stats tab after loading
document.querySelectorAll(".tab-content").forEach(sec => sec.style.display = "none");
document.getElementById("tab-stats").style.display = "block";

// ⭐ Update tab button highlight
document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
document.querySelector('.tab-btn[data-tab="stats"]').classList.add("active");


    generateOverviewCards(data);
    generateCharts(data);
enforceSessionAccess(username);

    if (status) status.textContent = "Stats loaded!";
  });
}

/* ================================
   ⭐ QUARTER 3 — CHARTS
   XP & Games Doughnut Charts
   ================================ */

let xpChartInstance = null;
let gamesChartInstance = null;

function generateCharts(data) {
  const xpCtx = document.getElementById("xpPieChart");
  const gamesCtx = document.getElementById("gamesPieChart");
  const chartCard = document.getElementById("chartCard");

  if (!xpCtx || !gamesCtx || !chartCard) return;

  // Register
    // Register plugin once
  if (typeof ChartDataLabels !== "undefined") {
    Chart.register(ChartDataLabels);
  }

  const labels = [];
  const xpValues = [];
  const gamesValues = [];

  for (const mode in data) {
    if (!XP_MODE_MAP[mode]) continue;

    const s = data[mode];
    if (!s) continue;

    const xp = s.xp || 0;
    const played = s.played || 0;

    if (xp === 0 && played === 0) continue;

    labels.push(modeNames[mode]);
    xpValues.push(xp);
    gamesValues.push(played);
  }

  if (labels.length === 0) {
    chartCard.style.display = "none";
    return;
  }

  chartCard.style.display = "block";

  // Destroy old charts
  if (xpChartInstance) xpChartInstance.destroy();
  if (gamesChartInstance) gamesChartInstance.destroy();

  const colors = [
    "#4fd1c5", "#63b3ed", "#f6ad55", "#fc8181",
    "#b794f4", "#f687b3", "#68d391", "#ecc94b"
  ];

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "60%",
    layout: {
      padding: {
        top: -20,
        bottom: 0,
        left: 0,
        right: 0
      }
    },
    plugins: {
      legend: { display: false },
      datalabels: {
        color: "#fff",
        font: { weight: "bold", size: 11 },
        formatter: (value, ctx) => {
          const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
          const pct = (value / total) * 100;
          return pct >= 8 ? pct.toFixed(0) + "%" : "";
        }
      }
    }
  };

  xpChartInstance = new Chart(xpCtx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [{
        data: xpValues,
        backgroundColor: colors,
        borderColor: "#1a1a2e",
        borderWidth: 2
      }]
    },
    options: commonOptions
  });

  gamesChartInstance = new Chart(gamesCtx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [{
        data: gamesValues,
        backgroundColor: colors,
        borderColor: "#1a1a2e",
        borderWidth: 2
      }]
    },
    options: commonOptions
  });
}

/* ================================
   ⭐ QUARTER 4 — AUTOCOMPLETE
   ================================ */

const usernameInput = document.getElementById("usernameInput");
const autocompleteList = document.getElementById("autocompleteList");
let autocompleteTimeout = null;

if (usernameInput && autocompleteList) {
  usernameInput.addEventListener("input", () => {
    const query = usernameInput.value.trim();

    if (autocompleteTimeout) clearTimeout(autocompleteTimeout);

    if (query.length < 2) {
      autocompleteList.style.display = "none";
      return;
    }

    autocompleteTimeout = setTimeout(() => {
      fetch(`https://api.playhive.com/v0/player/search/${query}`)
        .then(res => res.status === 422 ? [] : res.json())
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
}

/* ================================
   ⭐ QUARTER 4 — SHARE PROFILE
   ================================ */

const shareBtn = document.getElementById("shareProfileBtn");
if (shareBtn) {
  shareBtn.addEventListener("click", async () => {
    const username = document.getElementById("pcName").textContent;
    const shareUrl = `${window.location.origin}${window.location.pathname}?player=${encodeURIComponent(username)}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Hive Insight - ${username}`,
          url: shareUrl
        });
      } catch (err) {}
    } else {
      navigator.clipboard.writeText(shareUrl);
      shareBtn.textContent = "Copied!";
      setTimeout(() => shareBtn.textContent = "Share Profile", 2000);
    }
  });
}
/* ================================
   ⭐ QUARTER 4 — SESSION TRACKER
   ================================ */

// Active session data
let sessionData = null;
let discordUser = null;
let linkedAccount = null;
let refreshInterval = null;

// Buttons
const startSessionBtn = document.getElementById("startSessionBtn");
const endSessionBtn = document.getElementById("endSessionBtn");

// Helper to toggle session controls
function setSessionControlsState(isEnabled) {
  if (!startSessionBtn || !endSessionBtn) return;
  startSessionBtn.style.display = isEnabled ? "inline-block" : "none";
  endSessionBtn.style.display = isEnabled ? "inline-block" : "none";
}

// Update the session tracker UI
function updateSessionUI(currentData) {
  const activeSection = document.getElementById("sessionActiveContent");
  const inactiveSection = document.getElementById("sessionInactiveContent");

  if (!activeSection || !inactiveSection) return;

  if (!sessionData) {
    inactiveSection.style.display = "block";
    activeSection.style.display = "none";

    inactiveSection.innerHTML = "<p>No active session. Sign in to start one!</p>";
    setSessionControlsState(false);
    return;
  }

  // Calculate stats if data provided
  let curXP = 0, curWins = 0;
  if (currentData) {
    for (const mode in currentData) {
      if (XP_MODE_MAP[mode]) {
        curXP += currentData[mode].xp || 0;
        curWins += currentData[mode].victories || 0;
      }
    }
  }

  const xpGained = curXP - (sessionData.startXp || 0);
  const winsGained = curWins - (sessionData.startWins || 0);
  const hours = (Date.now() - sessionData.startTime) / 3600000;

  activeSection.style.display = "block";
  inactiveSection.style.display = "none";

  document.getElementById("sessionXP").textContent = xpGained.toLocaleString();
  document.getElementById("sessionWins").textContent = winsGained.toLocaleString();
  document.getElementById("sessionTime").textContent = Math.floor(hours * 60) + "m";
  document.getElementById("sessionXPH").textContent = hours > 0 ? Math.floor(xpGained / hours).toLocaleString() : 0;
  document.getElementById("sessionStartTime").textContent =
    `Started: ${new Date(sessionData.startTime).toLocaleTimeString()}`;

  setSessionControlsState(true);
}

// Start session
if (startSessionBtn) {
  startSessionBtn.addEventListener("click", () => {
    if (!window.lastLoadedStats) {
      alert("Load stats first!");
      return;
    }

    let totalXP = 0, totalWins = 0;
    for (const mode in window.lastLoadedStats) {
      if (XP_MODE_MAP[mode]) {
        totalXP += window.lastLoadedStats[mode].xp || 0;
        totalWins += window.lastLoadedStats[mode].victories || 0;
      }
    }

    sessionData = {
      startXp: totalXP,
      startWins: totalWins,
      startTime: Date.now(),
      username: document.getElementById("pcName").textContent
    };

    updateSessionUI(window.lastLoadedStats);
    alert("Session started!");
  });
}


// End session
if (endSessionBtn) {
  endSessionBtn.addEventListener("click", () => {
    if (!sessionData) return;

    if (confirm("End session and show summary?")) {
      const modal = document.getElementById("summaryModal");

      document.getElementById("summaryXP").textContent =
        document.getElementById("sessionXP").textContent;
      document.getElementById("summaryWins").textContent =
        document.getElementById("sessionWins").textContent;
      document.getElementById("summaryTime").textContent =
        document.getElementById("sessionTime").textContent;
      document.getElementById("summaryXPH").textContent =
        document.getElementById("sessionXPH").textContent;

      modal.style.display = "flex";

      sessionData = null;
discordUser = null;
linkedAccount = null;


      document.getElementById("sessionActiveContent").style.display = "none";
      document.getElementById("sessionInactiveContent").style.display = "block";

      const toggle = document.getElementById("autoRefreshToggle");
      if (toggle) toggle.checked = false;

      clearInterval(refreshInterval);
      refreshInterval = null;
    }
  });
}

// Close summary modal
const closeSummaryBtn = document.getElementById("closeSummaryBtn");
if (closeSummaryBtn) {
  closeSummaryBtn.addEventListener("click", () => {
    document.getElementById("summaryModal").style.display = "none";
  });
}

/* ================================
   ⭐ QUARTER 4 — AUTO REFRESH
   ================================ */

const autoRefreshToggle = document.getElementById("autoRefreshToggle");
if (autoRefreshToggle) {
  autoRefreshToggle.addEventListener("change", e => {
    if (e.target.checked) {
      refreshInterval = setInterval(() => {
        const status = document.getElementById("loadStatus");
        if (status && status.textContent !== "Loading stats...") {
          const btn = document.getElementById("loadStatsBtn");
          if (btn) btn.click();
        }
      }, 120000);

      alert("Auto-refresh enabled (every 2 minutes)");
    } else {
      clearInterval(refreshInterval);
      refreshInterval = null;
    }
  });
}

// ================================
// ⭐ TAB SWITCHING
// ================================
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const tab = btn.dataset.tab;

    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    document.querySelectorAll(".tab-content").forEach(sec => sec.style.display = "none");

    document.getElementById(`tab-${tab}`).style.display = "block";
  });
});

// ⭐ GLOBAL ACCOUNT BUTTON HANDLER
document.addEventListener("DOMContentLoaded", () => {
  // use the in-memory variables instead
const linked = linkedAccount;


  const connectBtn = document.getElementById("connectBtn");
  const profileBtn = document.getElementById("profileBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  if (!connectBtn || !profileBtn || !logoutBtn) return;

  if (linked) {
    connectBtn.style.display = "none";
    profileBtn.style.display = "inline-block";
    logoutBtn.style.display = "inline-block";
  } else if (discordUser) {
    connectBtn.style.display = "inline-block";
    profileBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
  } else {
    connectBtn.style.display = "inline-block";
    profileBtn.style.display = "none";
    logoutBtn.style.display = "none";
  }

  logoutBtn.addEventListener("click", () => {
    discordUser = null;
linkedAccount = null;
window.location.reload();
  });
});

// ================================
// ⭐ ENFORCE SESSION ACCESS
// ================================
function enforceSessionAccess(loadedIGN) {
  const linked = linkedAccount;
  const sessionCard = document.getElementById("sessionCard");
  const controls = document.querySelector(".session-controls");

  if (sessionCard) sessionCard.style.display = "block";

  if (!linked) {
    if (controls) controls.style.display = "none";
    const inactiveContent = document.getElementById("sessionInactiveContent");
    if (inactiveContent) {
      inactiveContent.innerHTML = "<p class='small'>Sign in to start sessions. You can still view active sessions if this player has one.</p>";
    }
    return;
  }

 const account = linked;

  // ⭐ Case-insensitive comparison
  if (account.ign.toLowerCase() === loadedIGN.toLowerCase()) {
    if (controls) controls.style.display = "flex";
  } else {
    if (controls) controls.style.display = "none";
    const inactiveContent = document.getElementById("sessionInactiveContent");
    if (inactiveContent) {
      inactiveContent.innerHTML = "<p class='small'>You can only start sessions for your own IGN. If this player has an active session, you’ll see their stats here.</p>";
    }
  }
}
