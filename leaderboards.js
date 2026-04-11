const API = "https://api.playhive.com/v0";

document.getElementById("lbTypeSelect").addEventListener("change", () => {
  const type = document.getElementById("lbTypeSelect").value;
  document.getElementById("monthlySelectors").style.display =
    type === "monthly" ? "block" : "none";
});

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
    url = `${API}/game/monthly/${game}/${year}/${month}/100/0`;
  }

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Leaderboard not found");

    const data = await res.json();

    status.textContent = `Loaded ${data.length} entries`;

    data.forEach((entry, i) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${i + 1}</td>
        <td>${entry.username}</td>
        <td>${entry.xp?.toLocaleString() ?? "-"}</td>
        <td>${entry.played?.toLocaleString() ?? "-"}</td>
        <td>${entry.victories?.toLocaleString() ?? "-"}</td>
      `;
      tableBody.appendChild(row);
    });

  } catch (err) {
    status.textContent = "Error loading leaderboard.";
    console.error(err);
  }
});
