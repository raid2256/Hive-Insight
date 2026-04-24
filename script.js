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
let sessionData = JSON.parse(localStorage.getItem("hiveSession")) || null;

// ⭐ XP TABLES
const XP_TABLES = {
    bedwars: [0, 150, 450, 900, 1500, 2250, 3150, 4200, 5400, 6750, 8250, 9900, 11700, 13650, 15750, 18000, 20400, 22950, 25650, 28500, 31500, 34650, 37950, 41400, 45000, 48750, 52650, 56700, 60900, 65250, 69750, 74400, 79200, 84150, 89250, 94500, 99900, 105450, 111150, 117000, 123000, 129150, 135450, 141900, 148500, 155250, 162150, 169200, 176400, 183750, 191250, 198900, 206550, 214200, 221850, 229500, 237150, 244800, 252450, 260100, 267750, 275400, 283050, 290700, 298350, 306000, 313650, 321300, 328950, 336600, 344250, 351900, 359550, 367200, 374850, 382500, 390150, 397800, 405450, 413100, 420750, 428400, 436050, 443700, 451350, 459000, 466650, 474300, 481950, 489600, 497250, 504900, 512550, 520200, 527850, 535500, 543150, 550800, 558450, 566100],
    skywars: [0, 150, 450, 900, 1500, 2250, 3150, 4200, 5400, 6750, 8250, 9900, 11700, 13650, 15750, 18000, 20400, 22950, 25650, 28500, 31500, 34650, 37950, 41400, 45000, 48750, 52650, 56700, 60900, 65250, 69750, 74400, 79200, 84150, 89250, 94500, 99900, 105450, 111150, 117000, 123000, 129150, 135450, 141900, 148500, 155250, 162150, 169200, 176400, 183750, 191250, 198900, 206550, 214200, 221850, 229500, 237150, 244800, 252450, 260100, 267750, 275400, 283050, 290700, 298350, 306000, 313650, 321300, 328950, 336600, 344250, 351900, 359550, 367200, 374850, 382500, 390150, 397800, 405450, 413100, 420750, 428400, 436050, 443700, 451350, 459000, 466650, 474300, 481950, 489600, 497250, 504900, 512550, 520200, 527850, 535500, 543150, 550800, 558450, 566100],
    blockdrop: [0, 150, 450, 900, 1500, 2250, 3150, 4200, 5400, 6750, 8250, 9900, 11700, 13650, 15750, 18000, 20400, 22950, 25650, 28500, 31500, 34650, 37800, 40950, 44100],
    blockparty: [0, 150, 450, 900, 1500, 2250, 3150, 4200, 5400, 6750, 8250, 9900, 11700, 13650, 15750, 18000, 20400, 22950, 25650, 28500, 31500, 34650, 37950, 41400, 45000],
    bridge: [0, 300, 924, 1897, 3246, 5001, 7194, 9860, 13036, 16762, 21082, 26043, 31696, 38096, 45302, 53378, 62393, 72422, 83546, 95852],
    buildbattle: [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500, 5500, 6600, 7800, 9100, 10500, 12000, 13600, 15300, 17100, 19000, 21000, 23000, 25300, 27600, 30000, 32500, 35500, 37800, 40600, 43500],
    ctf: [0, 150, 450, 900, 1500, 2250, 3150, 4200, 5400, 6750, 8250, 9900, 11700, 13650, 15750, 18000, 20400, 22950, 25650, 28500, 31500, 34650, 37950, 41400, 45000, 48750, 52650, 56700, 60900, 65250, 69750, 74400, 79200, 84150, 89250, 94500, 99900, 105450, 111150, 117000, 123000, 129150, 135450, 141900, 148500, 155250, 162150, 169200, 176400, 183750],
    deathrun: [0, 200, 600, 1200, 2000, 3000, 4200, 5600, 7200, 9000, 11000, 13200, 15600, 18200, 21000, 24000, 27200, 30600, 34200, 38000, 42000, 46200, 50600, 55200, 60000, 65000, 70200, 75600, 81200, 87000, 93000, 99200, 105600, 112200, 119000, 126000, 133200, 140600, 148200, 156000, 164000, 172200, 180400, 188600, 196800, 205000, 213200, 221400, 229600, 237800, 246000, 254200, 262400, 270600, 278800, 287000, 295200, 303400, 311600, 319800, 328000, 336200, 344400, 352600, 360800, 369000, 377200, 385400, 393600, 401800, 410000, 418200, 426400, 434600, 442800],
    gravity: [0, 150, 450, 900, 1500, 2250, 3150, 4200, 5400, 6750, 8250, 9900, 11700, 13650, 15750, 18000, 20400, 22950, 25650, 28500, 31500, 34650, 37950, 41400, 45000],
    groundwars: [0, 150, 450, 900, 1500, 2250, 3150, 4200, 5400, 6750, 8250, 9900, 11700, 13650, 15750, 18000, 20400, 22950, 25650, 28500],
    hideandseek: [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500, 5500, 6600, 7800, 9100, 10500, 12000, 13600, 15300, 17100, 19000, 21000, 23100, 25300, 27600, 30000, 32500, 35100, 37800, 40600, 43500, 46500, 49600, 52800, 56100, 59500, 63000, 66600, 70300, 74100, 78000, 82000, 86100, 90300, 94600, 99000, 103500, 108100, 112800, 117600, 122500, 127500, 132600, 137800, 143100, 148500, 154000, 159600, 165300, 171100, 177000, 183000, 189100, 195300, 201600, 208000, 214500, 221100, 227800, 234600, 241500, 248500, 255600, 262800, 270100, 277500],
    murdermystery: [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500, 5500, 6600, 7800, 9100, 10500, 12000, 13600, 15300, 17100, 19000, 21000, 23100, 25300, 27600, 30000, 32500, 35100, 37800, 40600, 43500, 46500, 49600, 52800, 56100, 59500, 63000, 66600, 70300, 74100, 78000, 82000, 86100, 90300, 94600, 99000, 103500, 108100, 112800, 117600, 122500, 127500, 132600, 137800, 143100, 148500, 154000, 159600, 165300, 171100, 177000, 183000, 189100, 195300, 201600, 208000, 214500, 221100, 227800, 234600, 241500, 248500, 255600, 262800, 270100, 277500, 285000, 292600, 300300, 308100, 316000, 324000, 332100, 340200, 348300, 356400, 364500, 372600, 380700, 388800, 396900, 405000, 413100, 421200, 429300, 437400, 445500, 453600, 461700, 469800, 477900],
    survivalgames: [0, 150, 450, 900, 1500, 2250, 3150, 4200, 5400, 6750, 8250, 9900, 11700, 13650, 15750, 18000, 20400, 22950, 25650, 28500, 31500, 34650, 37950, 41400, 45000, 48750, 52650, 56700, 60900, 65250, 69750, 74400, 79200, 84150, 89250, 94500, 99900, 105450, 111150, 117000, 123000, 129150, 135450, 141900, 148500, 155250, 162150, 169200, 176400, 183750]
};

// ⭐ Sorting Function
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

// ⭐ Highlights Section
const modeNames = {
    bed: "BedWars", sky: "SkyWars", dr: "Deathrun", party: "Block Party", drop: "Block Drop",
    ctf: "Capture the Flag", murder: "Murder Mystery", sg: "Survival Games", hide: "Hide and Seek",
    ground: "Ground Wars", build: "Build Battle", bridge: "The Bridge", grav: "Gravity"
};

function generateHighlights(data) {
    const container = document.getElementById("highlightsCard");
    const content = document.getElementById("highlightsContent");
    const modes = Object.entries(data).filter(([m, s]) => XP_MODE_MAP[m] && s && (s.xp || s.played));

    if (modes.length === 0) {
        container.style.display = "none";
        return;
    }

    const highestLevel = modes.reduce((a, b) => getLevelInfo(a[0], a[1].xp).level > getLevelInfo(b[0], b[1].xp).level ? a : b);
    const bestWinrate = modes.reduce((a, b) => (a[1].victories / (a[1].played || 1)) > (b[1].victories / (b[1].played || 1)) ? a : b);
    const mostGames = modes.reduce((a, b) => a[1].played > b[1].played ? a : b);
    const bestKD = modes.reduce((a, b) => ((a[1].kills || 0) / (a[1].deaths || 1)) > ((b[1].kills || 0) / (b[1].deaths || 1)) ? a : b);
    const oldest = modes.reduce((a, b) => (a[1].first_played || Infinity) < (b[1].first_played || Infinity) ? a : b);
    const mostXP = modes.reduce((a, b) => a[1].xp > b[1].xp ? a : b);

    content.innerHTML = `
        <div><strong>Highest Level:</strong> ${modeNames[highestLevel[0]]} — Level ${getLevelInfo(highestLevel[0], highestLevel[1].xp).level}</div>
        <div><strong>Best Winrate:</strong> ${modeNames[bestWinrate[0]]} — ${((bestWinrate[1].victories / (bestWinrate[1].played || 1)) * 100).toFixed(2)}%</div>
        <div><strong>Most Games:</strong> ${modeNames[mostGames[0]]} — ${mostGames[1].played.toLocaleString()}</div>
        <div><strong>Best K/D:</strong> ${modeNames[bestKD[0]]} — ${((bestKD[1].kills || 0) / (bestKD[1].deaths || 1)).toFixed(2)}</div>
        <div><strong>Oldest Mode:</strong> ${modeNames[oldest[0]]} — since ${oldest[1].first_played ? new Date(oldest[1].first_played * 1000).getFullYear() : "Unknown"}</div>
        <div><strong>Most XP:</strong> ${modeNames[mostXP[0]]} — ${mostXP[1].xp.toLocaleString()}</div>
    `;
    container.style.display = "block";
}

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
    document.getElementById("globalXP").textContent = totalXP.toLocaleString();
    document.getElementById("globalTotalGames").textContent = totalGames.toLocaleString();
    document.getElementById("globalTotalWins").textContent = totalWins.toLocaleString();
    document.getElementById("globalAvgWinrate").textContent = avgWinrate + "%";
    document.getElementById("globalAvgKD").textContent = avgKD;
    document.getElementById("globalStatsCard").style.display = "block";
}

// ⭐ OVERVIEW CARD GENERATOR
function generateOverviewCards(data) {
    generateGlobalStats(data);
    generateHighlights(data);
    const container = document.getElementById("overviewContainer");
    container.innerHTML = "";
    const sortType = document.getElementById("sortSelect")?.value || "games";
    const sorted = sortModes(data, sortType);

    for (const [mode, s] of sorted) {
        if (!s || !XP_MODE_MAP[mode]) continue;
        if (hideUnplayed && (s.played ?? 0) === 0) continue;

        const xp = s.xp ?? 0, played = s.played ?? 0, wins = s.victories ?? 0;
        const winrate = played > 0 ? ((wins / played) * 100).toFixed(2) : "0.00";
        const info = getLevelInfo(mode, xp);
        const percentToNext = (info.progressToNext * 100).toFixed(2);
        const maxXp = XP_TABLES[XP_MODE_MAP[mode]].slice(-1)[0];
        const percentComplete = ((xp / maxXp) * 100).toFixed(2);

        const card = document.createElement("div");
        card.className = "overview-card";
        card.innerHTML = `
            <h3><img src="${MODE_ICONS[mode]}" class="gm-icon">${modeNames[mode]}</h3>
            <div class="overview-stats">
                <div class="ov-row"><span>Total Complete:</span> <span>${percentComplete}%</span></div>
                <div class="ov-row"><span>Win Percentage:</span> <span>${winrate}%</span></div>
                <div class="ov-row"><span>Experience:</span> <span>${xp.toLocaleString()}</span></div>
            </div>
            <div class="mini-progress-label">Level ${info.level} → ${info.nextLevel}</div>
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
    return {
        level, maxLevel, currentLevelXp, nextLevel, nextLevelXp,
        xpToNext: level === maxLevel ? 0 : nextLevelXp - xp,
        progressToNext: level === maxLevel ? 1 : Math.max(0, Math.min(1, (xp - currentLevelXp) / (nextLevelXp - currentLevelXp)))
    };
}

// ⭐ Formatting Helpers
function formatPercent(v) { return (v * 100).toFixed(2) + "%"; }
function formatNumber(n) { return n.toLocaleString("en-US", { maximumFractionDigits: 2 }); }

// ⭐ INITIAL LOAD & DEEP LINKING
window.addEventListener("load", () => {
    if (localStorage.getItem("mode")) document.getElementById("modeSelect").value = localStorage.getItem("mode");
    if (localStorage.getItem("xp")) document.getElementById("xpInput").value = localStorage.getItem("xp");
    if (localStorage.getItem("games")) document.getElementById("gamesInput").value = localStorage.getItem("games");
    if (localStorage.getItem("wins")) document.getElementById("winsInput").value = localStorage.getItem("wins");

    const params = new URLSearchParams(window.location.search);
    const playerParam = params.get("player") || params.get("user");
    if (playerParam) {
        document.getElementById("usernameInput").value = playerParam;
        setTimeout(() => document.getElementById("loadStatsBtn").click(), 100);
    }
});

// ⭐ Load Stats Button
document.getElementById("loadStatsBtn").addEventListener("click", async () => {
    const usernameInput = document.getElementById("usernameInput");
    const username = usernameInput.value.trim();
    const status = document.getElementById("loadStatus");

    if (!username) { status.textContent = "Please enter a username."; return; }

    // Update URL without refreshing
    const newUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?player=${encodeURIComponent(username)}`;
    window.history.pushState({ path: newUrl }, '', newUrl);

    status.textContent = "Loading stats...";
    const data = await loadHiveStats(username);
    if (!data) { status.textContent = "User not found."; return; }

    status.textContent = "Stats loaded!";
    window.lastLoadedStats = data;
    generateOverviewCards(data);
    await loadPlayerCard(username);
    if (sessionData) updateSessionUI(data);

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

    globalXp = xp; globalGames = games; globalWins = wins; globalTable = table;
    localStorage.setItem("mode", mode); localStorage.setItem("xp", xp); localStorage.setItem("games", games); localStorage.setItem("wins", wins);

    if (!table) { resultsDiv.innerHTML = "<p>Unknown gamemode.</p>"; return; }
    const info = getLevelInfo(mode, xp);
    const winrate = games > 0 ? wins / games : 0;
    const xpPerGame = games > 0 ? xp / games : 0;
    let targetLvl = targetLevel && targetLevel >= 1 ? targetLevel : info.nextLevel;
    if (targetLvl > info.maxLevel) targetLvl = info.maxLevel;
    const xpRemainingToTarget = Math.max(0, table[targetLvl - 1] - xp);

    resultsDiv.innerHTML = `
        <div class="result-grid">
            <div class="result-item"><h3>Current Level</h3><p>${info.level} / ${info.maxLevel}</p></div>
            <div class="result-item"><h3>XP</h3><p>${formatNumber(xp)} XP</p></div>
            <div class="result-item"><h3>Progress</h3><p>${formatPercent(info.progressToNext)}</p></div>
            <div class="result-item"><h3>Winrate</h3><p>${formatPercent(winrate)}</p></div>
            <div class="result-item"><h3>XP/Game</h3><p>${formatNumber(xpPerGame)} XP</p></div>
            <div class="result-item"><h3>Target</h3><p>Lvl ${targetLvl} (${formatNumber(xpRemainingToTarget)} XP left)</p></div>
        </div>
    `;
});

// ⭐ SHARE & SESSION LOGIC
document.getElementById("shareProfileBtn").addEventListener("click", async () => {
    const username = document.getElementById("pcName").textContent;
    const shareUrl = `${window.location.origin}${window.location.pathname}?player=${encodeURIComponent(username)}`;
    if (navigator.share) {
        try { await navigator.share({ title: `Hive Insight - ${username}`, url: shareUrl }); } catch (err) {}
    } else {
        navigator.clipboard.writeText(shareUrl);
        const btn = document.getElementById("shareProfileBtn");
        btn.textContent = "Link Copied!";
        setTimeout(() => btn.textContent = "Share Profile", 2000);
    }
});

document.getElementById("startSessionBtn").addEventListener("click", () => {
    if (!window.lastLoadedStats) { alert("Please load stats first!"); return; }
    const data = window.lastLoadedStats;
    let totalXP = 0, totalWins = 0;
    for (const mode in data) { if (XP_MODE_MAP[mode]) { totalXP += data[mode].xp || 0; totalWins += data[mode].victories || 0; } }
    sessionData = { startXp: totalXP, startWins: totalWins, startTime: Date.now(), username: document.getElementById("pcName").textContent };
    localStorage.setItem("hiveSession", JSON.stringify(sessionData));
    updateSessionUI(data);
    alert("Session started!");
});

function updateSessionUI(currentData) {
    if (!sessionData) return;
    let curXP = 0, curWins = 0;
    for (const mode in currentData) { if (XP_MODE_MAP[mode]) { curXP += currentData[mode].xp || 0; curWins += currentData[mode].victories || 0; } }
    const xpG = curXP - sessionData.startXp, winG = curWins - sessionData.startWins;
    const hrs = (Date.now() - sessionData.startTime) / 3600000;
    document.getElementById("sessionActiveContent").style.display = "block";
    document.getElementById("sessionInactiveContent").style.display = "none";
    document.getElementById("sessionXP").textContent = xpG.toLocaleString();
    document.getElementById("sessionWins").textContent = winG.toLocaleString();
    document.getElementById("sessionTime").textContent = Math.floor(hrs * 60) + "m";
    document.getElementById("sessionXPH").textContent = hrs > 0 ? Math.floor(xpG / hrs).toLocaleString() : 0;
    document.getElementById("sessionStartTime").textContent = `Started: ${new Date(sessionData.startTime).toLocaleTimeString()}`;
}

// ⭐ TABS & SORTING
document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        document.querySelectorAll(".tab-content").forEach(sec => sec.style.display = "none");
        document.getElementById(`tab-${btn.dataset.tab}`).style.display = "block";
    });
});

document.getElementById("sortSelect").addEventListener("change", () => { if (window.lastLoadedStats) generateOverviewCards(window.lastLoadedStats); });
document.getElementById("hideUnplayed").addEventListener("change", e => { hideUnplayed = e.target.checked; if (window.lastLoadedStats) generateOverviewCards(window.lastLoadedStats); });
document.getElementById("sortDirBtn").addEventListener("click", () => {
    sortDirection = sortDirection === "desc" ? "asc" : "desc";
    document.getElementById("sortDirBtn").textContent = sortDirection === "desc" ? "▼" : "▲";
    if (window.lastLoadedStats) generateOverviewCards(window.lastLoadedStats);
});

// ⭐ RESET SESSION LOGIC
document.getElementById("resetSessionBtn").addEventListener("click", () => {
    if (confirm("End current session and reset all gains to zero?")) {
        localStorage.removeItem("hiveSession");
        sessionData = null;
        
        // Hide the active content and show the "No active session" message
        document.getElementById("sessionActiveContent").style.display = "none";
        document.getElementById("sessionInactiveContent").style.display = "block";
        
        // Change button text back
        document.getElementById("startSessionBtn").textContent = "Start Session";
        
        alert("Session cleared!");
    }
});
