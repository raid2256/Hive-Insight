// Redirect if not logged in
const discordUser = localStorage.getItem("discordUser");
const linked = localStorage.getItem("linkedAccount");

if (!discordUser || !linked) {
  window.location.href = "/connect.html";
}

document.addEventListener("DOMContentLoaded", () => {
  const profileStatus = document.getElementById("profileStatus");
  const profileContent = document.getElementById("profileContent");

  const discord = JSON.parse(discordUser);
  const hive = JSON.parse(linked);

  // Fill Discord info
  document.getElementById("discordName").textContent = discord.username;
  document.getElementById("discordId").textContent = discord.id;

  const avatarUrl = `https://cdn.discordapp.com/avatars/${discord.id}/${discord.avatar}.png?size=256`;
  document.getElementById("discordAvatar").src = avatarUrl;

  // Fill Hive info
  document.getElementById("hiveIgn").textContent = hive.ign;
  document.getElementById("hiveUuid").textContent = hive.uuid;
  document.getElementById("hiveXuid").textContent = hive.xuid;

  // Show content
  profileStatus.style.display = "none";
  profileContent.style.display = "block";

  // Disconnect button
  document.getElementById("disconnectBtn").addEventListener("click", () => {
    localStorage.removeItem("discordUser");
    localStorage.removeItem("linkedAccount");
    window.location.href = "/index.html";
  });
});
