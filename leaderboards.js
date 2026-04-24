const API = "https://api.playhive.com/v0";

// ⭐ Run on Page Load: Auto-set to current Month/Year
window.addEventListener('DOMContentLoaded', () => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // JS months are 0-11
    const currentYear = now.getFullYear();

    const monthInput = document.getElementById("lbMonth");
    const yearInput = document.getElementById("lbYear");

    if (monthInput) monthInput.value = currentMonth;
    if (yearInput) yearInput.value = currentYear;
});

// ⭐ Toggle Monthly Selectors
document.getElementById("lbTypeSelect").addEventListener("change", () => {
    const type = document.getElementById("lbTypeSelect").value;
    document.getElementById("monthlySelectors").style.display =
        type === "monthly" ? "block" : "none";
});

// ⭐ Load Leaderboard Button
document.getElementById("loadLeaderboardBtn").addEventListener("click", async () => {
    const game = document.getElementById("lbGameSelect").value;
    const type = document.getElementById("lbTypeSelect").value;
    const status = document.getElementById("lbStatus");
    const tableBody = document.querySelector("#lbTable tbody");

    tableBody.innerHTML = "";
    status.textContent = "Loading leaderboard...";

    let url = "";

    if (type === "all") {
        url = `${API}/game/all/${game}`;
    } else {
        const year = document.getElementById("lbYear").value;
        const month = document.getElementById("lbMonth").value;
        // The Hive API endpoint for monthly stats
        url = `${API}/game/monthly/${game}/${year}/${month}/100/0`;
    }

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("Leaderboard not found");

        const data = await res.json();

        // ⭐ Formatting the Success Message
        if (type === "monthly") {
            const monthSelect = document.getElementById("lbMonth");
            const monthName = monthSelect.options[monthSelect.selectedIndex].text;
            const yearValue = document.getElementById("lbYear").value;
            status.textContent = `Showing ${monthName} ${yearValue} (${data.length} entries)`;
        } else {
            status.textContent = `Showing All-Time Rankings (${data.length} entries)`;
        }

        // Fill Table
        data.forEach((entry, i) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${i + 1}</td>
                <td><strong>${entry.username}</strong></td>
                <td>${entry.xp?.toLocaleString() ?? "-"}</td>
                <td>${entry.played?.toLocaleString() ?? "-"}</td>
                <td>${entry.victories?.toLocaleString() ?? "-"}</td>
            `;
            tableBody.appendChild(row);
        });

    } catch (err) {
        status.textContent = "Error loading leaderboard. It might not exist for this date yet.";
        console.error(err);
    }
});
