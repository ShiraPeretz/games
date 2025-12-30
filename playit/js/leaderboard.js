/* js/leaderboard.js */
const params = new URLSearchParams(window.location.search);
const isModal = params.get("mode") === "modal";

if (isModal) {
  document.body.classList.add("modal-mode");
}

document.addEventListener("DOMContentLoaded", () => {
  const podiumContainer = document.getElementById("podium");
  const listContainer = document.getElementById("rankingList");

  if (!podiumContainer || !listContainer) return;

  // ---------- Safe helpers ----------
  const safeLoadUsers = () => {
    try {
      if (typeof loadUsers === "function") return loadUsers();
    } catch (e) {}
    return [];
  };

  const safeGetCurrentUser = () => {
    try {
      if (typeof getCurrentUser === "function") return getCurrentUser();
    } catch (e) {}
    return null;
  };

  const safeGetRecentGameHistory = (limit = 10) => {
    try {
      if (typeof getRecentGameHistory === "function") return getRecentGameHistory(limit);
    } catch (e) {}
    return [];
  };

  // ---------- Get real users ----------
  let realUsers = safeLoadUsers();
  const currentUsername = safeGetCurrentUser();

  // ---------- Demo fallback ----------
  if (!Array.isArray(realUsers) || realUsers.length === 0) {
    realUsers = [
      { username: "ytamir", stats: { trivia: { bestScore: 120, wins: 2 }, catcher: { bestScore: 71 } } },
      { username: "Ntamir", stats: { trivia: { bestScore: 90, wins: 1 }, catcher: { bestScore: 81 } } },
      { username: "shira",  stats: { trivia: { bestScore: 0, wins: 0 }, catcher: { bestScore: 0 } } },
      { username: "CyberKing", stats: { trivia: { bestScore: 60, wins: 1 }, catcher: { bestScore: 30 } } },
    ];
  }

  // ---------- Build leaderboard ----------
  const users = realUsers.map(u => {
    const triviaBest = u?.stats?.trivia?.bestScore ?? 0;
    const catcherBest = u?.stats?.catcher?.bestScore ?? 0;
    const wins = u?.stats?.trivia?.wins ?? 0;

    return {
      username: u?.username || "Unknown",
      calculatedScore: Number(triviaBest) + Number(catcherBest),
      wins: Number(wins)
    };
  });

  if (users.length === 0) {
    podiumContainer.innerHTML = "<div style='color:white;opacity:0.7'>No users yet</div>";
    listContainer.innerHTML = "";
    renderMyLast5Games(safeGetRecentGameHistory, safeGetCurrentUser); // עדיין ננסה היסטוריה
    return;
  }

  // sort
  users.sort((a, b) => {
    if (b.calculatedScore !== a.calculatedScore) return b.calculatedScore - a.calculatedScore;
    return b.wins - a.wins;
  });

  podiumContainer.innerHTML = "";
  listContainer.innerHTML = "";

  // ---------- Podium top 3 ----------
  const topUsers = users.slice(0, 3);

  topUsers.forEach((user, index) => {
    const place = index + 1;
    const isCurrent = currentUsername && currentUsername === user.username;
    const firstLetter = user.username.charAt(0).toUpperCase();
    const crownHtml = place === 1 ? '<div class="crown-icon">👑</div>' : '';

    const podiumItem = document.createElement("div");
    podiumItem.className = `podium-item place-${place}`;

    podiumItem.innerHTML = `
      <div class="podium-avatar ${isCurrent ? "current-user-highlight" : ""}">
        ${crownHtml}
        ${firstLetter}
      </div>
      <div class="podium-rank">
        <div class="username">${user.username}</div>
        <div class="score">${user.calculatedScore}</div>
      </div>
    `;

    podiumContainer.appendChild(podiumItem);
  });

  // ---------- List: 4th and below ----------
  const restUsers = users.slice(3);

  restUsers.forEach((user, index) => {
    const rank = index + 4;
    const isCurrent = currentUsername && currentUsername === user.username;

    const row = document.createElement("div");
    row.className = `list-item ${isCurrent ? "current-user-highlight" : ""}`;

    row.innerHTML = `
      <div class="rank-num">#${rank}</div>
      <div class="player-info">${user.username}</div>
      <div class="stat-val">${user.wins}</div>
      <div class="score-val">${user.calculatedScore}</div>
    `;

    listContainer.appendChild(row);
  });

  // ---------- My last 5 games ----------
  renderMyLast5Games(safeGetRecentGameHistory, safeGetCurrentUser);
});


// Render my last 5 games
function renderMyLast5Games(safeGetRecentGameHistory, safeGetCurrentUser) {
  const box = document.getElementById("myHistoryList");
  if (!box) return;

  const me = safeGetCurrentUser ? safeGetCurrentUser() : null;
  if (!me) {
    box.innerHTML = "<p>Please log in to see your history.</p>";
    return;
  }

  const history = safeGetRecentGameHistory ? safeGetRecentGameHistory(100) : [];
  const rows = Array.isArray(history)
    ? history.filter(r => r && r.username === me).slice(0, 5)
    : [];

  if (!rows.length) {
    box.innerHTML = "<p>No recent games yet 🎮</p>";
    return;
  }

  box.innerHTML = rows.map(r => {
    const dt = new Date(r.ts || Date.now()).toLocaleString();
    //const badge = r.win ? "👏 " : "";
    const game = `${r.game || "Game"}${(r.level != null) ? ` (Lv ${r.level})` : ""}`;

    return `
      <div class="list-item">
        <div class="stat-val">${r.win ? "+" : "-"}</div>
         <div class="player-info">${game}</div>
        <div class="score-val">${Number(r.score) || 0}</div>
        <div class="stat-val">${dt}</div>
      </div>
    `;
  }).join("");

}
