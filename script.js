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

let globalXp = 0; let globalGames = 0; let globalWins = 0; let globalTable = [];
let hideUnplayed = false; let sortDirection = "desc";
let sessionData = JSON.parse(localStorage.getItem("hiveSession")) || null;
let refreshInterval = null;
let xpChartInstance = null; // FIXED: Only declared once
let gamesChartInstance = null;

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

function sortModes(data, sortType) {
    const result = Object.entries(data).sort((a, b) => {
        const A = a[1]; const B = b[1];
        const xpA = A?.xp ?? 0; const xpB = B?.xp ?? 0;
        const gamesA = A?.played ?? 0; const gamesB = B?.played ?? 0;
        const winsA = A?.victories ?? 0; const winsB = B?.victories ?? 0;
        const kdA = (A?.kills ?? 0) / ((A?.deaths ?? 1) || 1);
        const kdB = (B?.kills ?? 0) / ((B?.deaths ?? 1) || 1);
        const maxA = XP_TABLES[XP_MODE_MAP[a[0]]]?.slice(-1)[0] ?? 1;
        const maxB = XP_TABLES[XP_MODE_MAP[b[0]]]?.slice(-1)[0] ?? 1;
        const completeA = xpA / maxA; const completeB = xpB / maxB;

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

function generateHighlights(data) {
    const container = document.getElementById("highlightsCard");
    const content = document.getElementById("highlightsContent");
    if(!container || !content) return;
    const modes = Object.entries(data).filter(([m, s]) => XP_MODE_MAP[m] && s && (s.xp || s.played));
    if (modes.length === 0) { container.style.display = "none"; return; }
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
        const s = data[mode]; if (!s) continue;
        totalXP += s.xp ?? 0; totalGames += s.played ?? 0; totalWins += s.victories ?? 0;
        totalKills += s.kills ?? 0; totalDeaths += s.deaths ?? 0;
    }
    const avgWinrate = totalGames > 0 ? ((totalWins / totalGames) * 100).toFixed(2) : "0.00";
    const avgKD = totalDeaths > 0 ? (totalKills / totalDeaths).toFixed(2) : "0.00";
    const elXP = document.getElementById("globalXP"); if(elXP) elXP.textContent = totalXP.toLocaleString();
    const elTG = document.getElementById("globalTotalGames"); if(elTG) elTG.textContent = totalGames.toLocaleString();
    const elTW = document.getElementById("globalTotalWins"); if(elTW) elTW.textContent = totalWins.toLocaleString();
    const elWR = document.getElementById("globalAvgWinrate"); if(elWR) elWR.textContent = avgWinrate + "%";
    const elKD = document.getElementById("globalAvgKD"); if(elKD) elKD.textContent = avgKD;
    const card = document.getElementById("globalStatsCard"); if(card) card.style.display = "block";
}

// RESTORED FULL OVERVIEW CARDS
function generateOverviewCards(data) {
    generateGlobalStats(data); 
    generateHighlights(data);
    const container = document.getElementById("overviewContainer"); 
    if(!container) return;
    container.innerHTML = "";
    const sorted = sortModes(data, document.getElementById("sortSelect")?.value || "games");

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

        const firstPlayed = s.first_played ? new Date(s.first_played * 1000).toDateString() : "Unknown";
        const kd = (s.kills && s.deaths) ? (s.deaths === 0 ? s.kills : (s.kills / s.deaths).toFixed(2)) : null;
        // ⭐ FKDR is now Final Kills / Losses
        const fkdr = (s.final_kills !== undefined && losses > 0) ? (s.final_kills / losses).toFixed(2) : (s.final_kills || null);
        
        const rows = [];
        const add = (label, value) => { if (value !== null && value !== undefined) rows.push(`<div class="ov-row"><span>${label}:</span> <span>${value}</span></div>`); };

        add("First Played", firstPlayed);
        add("Experience", xp.toLocaleString());
        add("Played", played.toLocaleString());
        add("Victories", wins.toLocaleString());
        add("Losses", losses.toLocaleString());
        add("Win Percentage", winrate + "%");
        add("Kills", s.kills);
        add("Final Kills", s.final_kills);
        add("Deaths", s.deaths);
        if(kd) add("K/D Ratio", kd);
        if(fkdr) add("Final K/L Ratio", fkdr);
        
        add("Beds Destroyed", s.beds_destroyed);
        add("Coins Collected", s.coins);
        add("Murders", s.murders);
        add("Murderer Eliminations", s.murderer_eliminations);
        add("Flags Captured", s.flags_captured);
        add("Flags Returned", s.flags_returned);
        add("Maps Completed", s.maps_completed);
        add("Checkpoints", s.checkpoints);
        add("Hider Kills", s.hider_kills);
        add("Seeker Kills", s.seeker_kills);

        const card = document.createElement("div");
        card.className = "overview-card";
        card.innerHTML = `
            <h3><img src="${MODE_ICONS[mode]}" class="gm-icon">${modeNames[mode]}</h3>
            <div class="overview-stats">
                <div class="ov-row"><span>Total Complete:</span> <span>${percentComplete}%</span></div>
                ${rows.join("")}
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

function getLevelInfo(mode, xp) {
    const table = XP_TABLES[XP_MODE_MAP[mode]]; if (!table) return null;
    let level = 1; for (let i = 0; i < table.length; i++) { if (xp >= table[i]) level = i + 1; else break; }
    const currentLevelXp = table[level - 1]; const nextLevel = level < table.length ? level + 1 : level;
    const nextLevelXp = table[nextLevel - 1];
    return {
        level, maxLevel: table.length, currentLevelXp, nextLevel, nextLevelXp,
        xpToNext: level === table.length ? 0 : nextLevelXp - xp,
        progressToNext: level === table.length ? 1 : Math.max(0, Math.min(1, (xp - currentLevelXp) / (nextLevelXp - currentLevelXp)))
    };
}

function formatPercent(v) { return (v * 100).toFixed(2) + "%"; }
function formatNumber(n) { return n.toLocaleString("en-US", { maximumFractionDigits: 2 }); }

window.addEventListener("load", () => {
    const elMode = document.getElementById("modeSelect"); if(elMode && localStorage.getItem("mode")) elMode.value = localStorage.getItem("mode");
    const elXP = document.getElementById("xpInput"); if(elXP && localStorage.getItem("xp")) elXP.value = localStorage.getItem("xp");
    const elG = document.getElementById("gamesInput"); if(elG && localStorage.getItem("games")) elG.value = localStorage.getItem("games");
    const elW = document.getElementById("winsInput"); if(elW && localStorage.getItem("wins")) elW.value = localStorage.getItem("wins");

    if (sessionData) {
        console.log("Existing session found for:", sessionData.username);
    }
    const params = new URLSearchParams(window.location.search);
    const playerParam = params.get("player") || params.get("user");
    const usernameInput = document.getElementById("usernameInput");
    if (playerParam && usernameInput) {
        usernameInput.value = playerParam;
        setTimeout(() => { const btn = document.getElementById("loadStatsBtn"); if(btn) btn.click(); }, 100);
    }
});

const loadStatsBtn = document.getElementById("loadStatsBtn");
if (loadStatsBtn) {
    loadStatsBtn.addEventListener("click", async () => {
        const usernameInput = document.getElementById("usernameInput");
        const username = usernameInput ? usernameInput.value.trim() : "";
        const status = document.getElementById("loadStatus");
        if (!username) { if(status) status.textContent = "Please enter a username."; return; }

        const newUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?player=${encodeURIComponent(username)}`;
        window.history.pushState({ path: newUrl }, '', newUrl);

        if(status) status.textContent = "Loading stats...";
        const data = await loadHiveStats(username);
        if (!data) { if(status) status.textContent = "User not found."; return; }

        if(status) status.textContent = "Stats loaded!";
        window.lastLoadedStats = data;
        generateOverviewCards(data);
        generateCharts(data); // ⭐ Charts updated here
        if (typeof loadPlayerCard === "function") await loadPlayerCard(username);
        if (sessionData) updateSessionUI(data);

        const elMode = document.getElementById("modeSelect");
        if(elMode && data[elMode.value]) {
            const mode = elMode.value;
            const elXP = document.getElementById("xpInput"); if(elXP) elXP.value = data[mode].xp ?? 0;
            const elW = document.getElementById("winsInput"); if(elW) elW.value = data[mode].victories ?? 0;
            const elG = document.getElementById("gamesInput"); if(elG) elG.value = data[mode].played ?? 0;
        }
    });
}

const calcBtn = document.getElementById("calcBtn");
if (calcBtn) {
    calcBtn.addEventListener("click", () => {
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
        resultsDiv.innerHTML = `
            <div class="result-grid">
                <div class="result-item"><h3>Current Level</h3><p>${info.level} / ${table.length}</p></div>
                <div class="result-item"><h3>XP</h3><p>${formatNumber(xp)} XP</p></div>
                <div class="result-item"><h3>Winrate</h3><p>${formatPercent(games > 0 ? wins/games : 0)}</p></div>
                <div class="result-item"><h3>Target</h3><p>Lvl ${targetLvl} (${formatNumber(xpRemaining)} left)</p></div>
            </div>`;
    });
}

const shareBtn = document.getElementById("shareProfileBtn");
if (shareBtn) {
    shareBtn.addEventListener("click", async () => {
        const username = document.getElementById("pcName").textContent;
        const shareUrl = `${window.location.origin}${window.location.pathname}?player=${encodeURIComponent(username)}`;
        if (navigator.share) { try { await navigator.share({ title: `Hive Insight - ${username}`, url: shareUrl }); } catch (err) {} }
        else { navigator.clipboard.writeText(shareUrl); shareBtn.textContent = "Copied!"; setTimeout(() => shareBtn.textContent = "Share Profile", 2000); }
    });
}

const startSessionBtn = document.getElementById("startSessionBtn");
if (startSessionBtn) {
    startSessionBtn.addEventListener("click", () => {
        if (!window.lastLoadedStats) { alert("Please load stats first!"); return; }
        const data = window.lastLoadedStats; let totalXP = 0, totalWins = 0;
        for (const mode in data) { if (XP_MODE_MAP[mode]) { totalXP += data[mode].xp || 0; totalWins += data[mode].victories || 0; } }
        sessionData = { startXp: totalXP, startWins: totalWins, startTime: Date.now(), username: document.getElementById("pcName").textContent };
        localStorage.setItem("hiveSession", JSON.stringify(sessionData));
        updateSessionUI(data); alert("Session started!");
    });
}

const endSessionBtn = document.getElementById("endSessionBtn");
if (endSessionBtn) {
    endSessionBtn.addEventListener("click", () => {
        if (!sessionData) return;
        if (confirm("End session and show summary?")) {
            const finalXP = document.getElementById("sessionXP").textContent;
            const finalWins = document.getElementById("sessionWins").textContent;
            const finalTime = document.getElementById("sessionTime").textContent;
            const finalXPH = document.getElementById("sessionXPH").textContent;
            const elSXP = document.getElementById("summaryXP"); if(elSXP) elSXP.textContent = finalXP;
            const elSW = document.getElementById("summaryWins"); if(elSW) elSW.textContent = finalWins;
            const elST = document.getElementById("summaryTime"); if(elST) elST.textContent = finalTime;
            const elSXPH = document.getElementById("summaryXPH"); if(elSXPH) elSXPH.textContent = finalXPH;
            const modal = document.getElementById("summaryModal"); if(modal) modal.style.display = "flex";
            localStorage.removeItem("hiveSession"); sessionData = null;
            document.getElementById("sessionActiveContent").style.display = "none";
            document.getElementById("sessionInactiveContent").style.display = "block";
            document.getElementById("startSessionBtn").textContent = "Start Session";
            const toggle = document.getElementById("autoRefreshToggle"); if(toggle) toggle.checked = false;
            clearInterval(refreshInterval); refreshInterval = null;
        }
    });
}

const closeSummaryBtn = document.getElementById("closeSummaryBtn");
if(closeSummaryBtn) { closeSummaryBtn.addEventListener("click", () => { const modal = document.getElementById("summaryModal"); if(modal) modal.style.display = "none"; }); }

function updateSessionUI(currentData) {
    const activeCont = document.getElementById("sessionActiveContent"); if(!activeCont || !sessionData) return;
    const currentPlayer = document.getElementById("pcName").textContent;
    if (sessionData.username !== currentPlayer) {
        activeCont.style.display = "none";
        document.getElementById("sessionInactiveContent").style.display = "block";
        return;
    }
    let curXP = 0, curWins = 0;
    for (const mode in currentData) { if (XP_MODE_MAP[mode]) { curXP += currentData[mode].xp || 0; curWins += currentData[mode].victories || 0; } }
    const xpG = curXP - sessionData.startXp, winG = curWins - sessionData.startWins;
    const hrs = (Date.now() - sessionData.startTime) / 3600000;
    activeCont.style.display = "block"; document.getElementById("sessionInactiveContent").style.display = "none";
    document.getElementById("sessionXP").textContent = xpG.toLocaleString();
    document.getElementById("sessionWins").textContent = winG.toLocaleString();
    document.getElementById("sessionTime").textContent = Math.floor(hrs * 60) + "m";
    document.getElementById("sessionXPH").textContent = hrs > 0 ? Math.floor(xpG / hrs).toLocaleString() : 0;
    document.getElementById("sessionStartTime").textContent = `Started: ${new Date(sessionData.startTime).toLocaleTimeString()}`;
}

const autoRefreshToggle = document.getElementById("autoRefreshToggle");
if (autoRefreshToggle) {
    autoRefreshToggle.addEventListener("change", (e) => {
        if (e.target.checked) {
            refreshInterval = setInterval(() => {
                const status = document.getElementById("loadStatus");
                if (status && status.textContent !== "Loading stats...") { const btn = document.getElementById("loadStatsBtn"); if(btn) btn.click(); }
            }, 120000);
            alert("Auto-refresh enabled (2 mins)");
        } else { clearInterval(refreshInterval); refreshInterval = null; }
    });
}

document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        document.querySelectorAll(".tab-content").forEach(sec => sec.style.display = "none");
        const target = document.getElementById(`tab-${btn.dataset.tab}`); if(target) target.style.display = "block";
    });
});

const sortSel = document.getElementById("sortSelect"); if(sortSel) sortSel.addEventListener("change", () => { if (window.lastLoadedStats) generateOverviewCards(window.lastLoadedStats); });
const hideUP = document.getElementById("hideUnplayed"); if(hideUP) hideUP.addEventListener("change", e => { hideUnplayed = e.target.checked; if (window.lastLoadedStats) generateOverviewCards(window.lastLoadedStats); });
const sortDirBtn = document.getElementById("sortDirBtn"); if(sortDirBtn) {
    sortDirBtn.addEventListener("click", () => {
        sortDirection = sortDirection === "desc" ? "asc" : "desc";
        sortDirBtn.textContent = sortDirection === "desc" ? "▼" : "▲";
        if (window.lastLoadedStats) generateOverviewCards(window.lastLoadedStats);
    });
}

function generateCharts(data) {
    const xpCtx = document.getElementById('xpPieChart');
    const gamesCtx = document.getElementById('gamesPieChart');
    const chartCard = document.getElementById('chartCard');
    if (!xpCtx || !gamesCtx || !chartCard) return;

    // Register the plugin globally
    Chart.register(ChartDataLabels);

    const labels = [];
    const xpValues = [];
    const gamesValues = [];
    
    for (const mode in data) {
        if (XP_MODE_MAP[mode] && (data[mode].xp > 0 || data[mode].played > 0)) {
            labels.push(modeNames[mode]);
            xpValues.push(data[mode].xp || 0);
            gamesValues.push(data[mode].played || 0);
        }
    }

    if (labels.length === 0) {
        chartCard.style.display = "none";
        return;
    }
    chartCard.style.display = "block";

    if (xpChartInstance) xpChartInstance.destroy();
    if (gamesChartInstance) gamesChartInstance.destroy();

   const commonOptions = {
    responsive: true,
    maintainAspectRatio: true,
    cutout: '65%', // Thinner doughnut looks more modern when small
    plugins: {
        legend: { display: false }, 
        datalabels: {
            color: '#fff',
            // Smaller font for smaller charts
            font: { weight: 'bold', family: 'MinecraftTen', size: 10 }, 
            formatter: (value, ctx) => {
                let sum = ctx.dataset.data.reduce((a, b) => a + b, 0);
                let percentage = (value * 100 / sum).toFixed(0) + "%";
                // Only show if it's at least 8% of the total to prevent overlap
                return value > (sum * 0.08) ? percentage : ''; 
            }
        }
    }
};

    xpChartInstance = new Chart(xpCtx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: xpValues,
                backgroundColor: ['#4fd1c5', '#63b3ed', '#f6ad55', '#fc8181', '#b794f4', '#f687b3', '#68d391', '#ecc94b'],
                borderWidth: 2, borderColor: '#1a1a2e'
            }]
        },
        options: commonOptions
    });

    gamesChartInstance = new Chart(gamesCtx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: gamesValues,
                backgroundColor: ['#4fd1c5', '#63b3ed', '#f6ad55', '#fc8181', '#b794f4', '#f687b3', '#68d391', '#ecc94b'],
                borderWidth: 2, borderColor: '#1a1a2e'
            }]
        },
        options: commonOptions
    });
}
