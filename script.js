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

  // Get the selected mode (matches API keys exactly)
  const mode = document.getElementById("modeSelect").value;

  // Auto-fill XP, wins, games
  document.getElementById("xpInput").value = data[mode]?.xp ?? 0;
  document.getElementById("winsInput").value = data[mode]?.victories ?? 0;
  document.getElementById("gamesInput").value = data[mode]?.played ?? 0;
});

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


let globalXp = 0;
let globalGames = 0;
let globalWins = 0;
let globalTable = [];

// XP tables: cumulative XP required to reach each level (index 0 = level 1)
const XP_TABLES = {
  bedwars: [
    0,150,450,900,1500,2250,3150,4200,5400,6750,8250,9900,11700,13650,15750,18000,
    20400,22950,25650,28500,31500,34650,37950,41400,45000,48750,52650,56700,60900,
    65250,69750,74400,79200,84150,89250,94500,99900,105450,111150,117000,123000,
    129150,135450,141900,148500,155250,162150,169200,176400,183750,191250,198900,
    206550,214200,221850,229500,237150,244800,252450,260100,267750,275400,283050,
    290700,298350,306000,313650,321300,328950,336600,344250,351900,359550,367200,
    374850,382500,390150,397800,405450,413100,420750,428400,436050,443700,451350,
    459000,466650,474300,481950,489600,497250,504900,512550,520200,527850,535500,
    543150,550800,558450,566100
  ],
  skywars: [
    0,150,450,900,1500,2250,3150,4200,5400,6750,8250,9900,11700,13650,15750,18000,
    20400,22950,25650,28500,31500,34650,37950,41400,45000,48750,52650,56700,60900,
    65250,69750,74400,79200,84150,89250,94500,99900,105450,111150,117000,123000,
    129150,135450,141900,148500,155250,162150,169200,176400,183750,191250,198900,
    206550,214200,221850,229500,237150,244800,252450,260100,267750,275400,283050,
    290700,298350,306000,313650,321300,328950,336600,344250,351900,359550,367200,
    374850,382500,390150,397800,405450,413100,420750,428400,436050,443700,451350,
    459000,466650,474300,481950,489600,497250,504900,512550,520200,527850,535500,
    543150,550800,558450,566100
  ],
  blockdrop: [
    0,150,450,900,1500,2250,3150,4200,5400,6750,8250,9900,11700,13650,15750,18000,
    20400,22950,25650,28500,31500,34650,37800,40950,44100
  ],
  blockparty: [
    0,150,450,900,1500,2250,3150,4200,5400,6750,8250,9900,11700,13650,15750,18000,
    20400,22950,25650,28500,31500,34650,37950,41400,45000
  ],
  bridge: [
    0,300,924,1897,3246,5001,7194,9860,13036,16762,21082,26043,31696,38096,45302,
    53378,62393,72422,83546,95852
  ],
  buildbattle: [
    0,100,300,600,1000,1500,2100,2800,3600,4500,5500,6600,7800,9100,10500,12000,
    13600,15300,17100,19000,21000,23000,25300,27600,30000,32500,35500,37800,40600,
    43500
  ],
  ctf: [
    0,150,450,900,1500,2250,3150,4200,5400,6750,8250,9900,11700,13650,15750,18000,
    20400,22950,25650,28500,31500,34650,37950,41400,45000,48750,52650,56700,60900,
    65250,69750,74400,79200,84150,89250,94500,99900,105450,111150,117000,123000,
    129150,135450,141900,148500,155250,162150,169200,176400,183750
  ],
  deathrun: [
    0,200,600,1200,2000,3000,4200,5600,7200,9000,11000,13200,15600,18200,21000,
    24000,27200,30600,34200,38000,42000,46200,50600,55200,60000,65000,70200,75600,
    81200,87000,93000,99200,105600,112200,119000,126000,133200,140600,148200,
    156000,164000,172200,180400,188600,196800,205000,213200,221400,229600,237800,
    246000,254200,262400,270600,278800,287000,295200,303400,311600,319800,328000,
    336200,344400,352600,360800,369000,377200,385400,393600,401800,410000,418200,
    426400,434600,442800
  ],
  gravity: [
    0,150,450,900,1500,2250,3150,4200,5400,6750,8250,9900,11700,13650,15750,18000,
    20400,22950,25650,28500,31500,34650,37950,41400,45000
  ],
  groundwars: [
    0,150,450,900,1500,2250,3150,4200,5400,6750,8250,9900,11700,13650,15750,18000,
    20400,22950,25650,28500
  ],
  hideandseek: [
    0,100,300,600,1000,1500,2100,2800,3600,4500,5500,6600,7800,9100,10500,12000,
    13600,15300,17100,19000,21000,23100,25300,27600,30000,32500,35100,37800,40600,
    43500,46500,49600,52800,56100,59500,63000,66600,70300,74100,78000,82000,86100,
    90300,94600,99000,103500,108100,112800,117600,122500,127500,132600,137800,
    143100,148500,154000,159600,165300,171100,177000,183000,189100,195300,201600,
    208000,214500,221100,227800,234600,241500,248500,255600,262800,270100,277500
  ],
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


// Compute level info
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

function formatPercent(v) {
  return (v * 100).toFixed(2) + "%";
}

function formatNumber(n) {
  return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

// Load saved values
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

// Load URL parameters
function loadFromURL() {
  const p = new URLSearchParams(window.location.search);

  if (p.has("mode")) document.getElementById("modeSelect").value = p.get("mode");
  if (p.has("xp")) document.getElementById("xpInput").value = p.get("xp");
  if (p.has("games")) document.getElementById("gamesInput").value = p.get("games");
  if (p.has("wins")) document.getElementById("winsInput").value = p.get("wins");
}

document.getElementById("calcBtn").addEventListener("click", () => {
  const mode = document.getElementById("modeSelect").value;
  const xp = Number(document.getElementById("xpInput").value) || 0;
  const games = Number(document.getElementById("gamesInput").value) || 0;
  const wins = Number(document.getElementById("winsInput").value) || 0;
  const targetLevelInput = document.getElementById("targetLevelInput").value;
  const targetLevel = targetLevelInput ? Number(targetLevelInput) : null;

  const resultsDiv = document.getElementById("results");

  // DEFINE TABLE FIRST (fixes your error)
  const table = XP_TABLES[mode];

  // Update globals for grind calculator
  globalXp = xp;
  globalGames = games;
  globalWins = wins;
  globalTable = table;

  // Save to localStorage
  localStorage.setItem("mode", mode);
  localStorage.setItem("xp", xp);
  localStorage.setItem("games", games);
  localStorage.setItem("wins", wins);

  if (!table) {
    resultsDiv.innerHTML = "<p>Unknown gamemode.</p>";
    return;
  }

  const info = getLevelInfo(XP_MODE_MAP[mode], xp);
  if (!info) {
    resultsDiv.innerHTML = "<p>Could not compute level.</p>";
    return;
  }

  const winrate = games > 0 ? wins / games : 0;
  const xpPerGame = games > 0 ? xp / games : 0;

  // Target level logic
  let targetLvl = targetLevel && targetLevel >= 1 ? targetLevel : info.nextLevel;
  if (targetLvl > info.maxLevel) targetLvl = info.maxLevel;

  const targetXp = table[targetLvl - 1];
  const xpRemainingToTarget = Math.max(0, targetXp - xp);
  const gamesNeededToTarget = xpPerGame > 0 ? xpRemainingToTarget / xpPerGame : 0;
  const winsNeededToTarget = gamesNeededToTarget * winrate;

  // Output results
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

// Progress bar update
const progressBarContainer = document.getElementById("progressBarContainer");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");

if (progressBarContainer && progressBar && progressText) {
  progressBarContainer.style.display = "block";

  const maxXp = table[table.length - 1];
  const rawPercent = (xp / maxXp) * 100;
  const percentText = rawPercent.toFixed(2) + "%";

  progressBar.style.width = rawPercent + "%";
  progressText.textContent = percentText;
}

});

// Grind Calculator
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

// Goal Date Planner
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
