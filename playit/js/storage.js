/* js/storage.js */

function loadUsers() {
    return JSON.parse(localStorage.getItem("users") || "[]");
}

function saveUsers(users) {
    localStorage.setItem("users", JSON.stringify(users));
}

function getCurrentUser() {
    return localStorage.getItem("currentUser");
}

function setCurrentUser(username) {
    localStorage.setItem("currentUser", username);
}

/* --- New additions: level progress & scoring --- */

// Save level completion
function completeLevel(gameName, levelNumber, stars) {
    const users = loadUsers();
    const username = getCurrentUser();
    const userIndex = users.findIndex(u => u.username === username);

    if (userIndex !== -1) {
        const user = users[userIndex];

        // Create data structure if it doesn't exist
        if (!user.progress) user.progress = {};
        if (!user.progress[gameName]) user.progress[gameName] = { maxLevel: 1, levels: {} };

        // Update stars for the current level (keep the best result only)
        const currentStars = user.progress[gameName].levels[levelNumber] || 0;
        if (stars > currentStars) {
            user.progress[gameName].levels[levelNumber] = stars;
        }

        // Unlock the next level if passed successfully (e.g., more than 0 stars)
        if (stars > 0 && levelNumber === user.progress[gameName].maxLevel) {
            user.progress[gameName].maxLevel++;
        }

        saveUsers(users);
    }
}

// Get progress data (for rendering the level map)
function getUserProgress(gameName) {
    const users = loadUsers();
    const username = getCurrentUser();
    const user = users.find(u => u.username === username);

    if (user && user.progress && user.progress[gameName]) {
        return user.progress[gameName];
    }
    return { maxLevel: 1, levels: {} }; // default for a new user
}

/* --- Session management (expiry) --- */
(function checkSession() {
  const sessionStr = localStorage.getItem("session");
  if (!sessionStr) return;

  try {
    const session = JSON.parse(sessionStr);
    const expiry = new Date(session.expiry);

    if (!session.expiry || new Date() > expiry) {
      alert("Your session has expired. Please log in again.");
      localStorage.removeItem("currentUser");
      localStorage.removeItem("session");

      // use same routing logic as requireAuth
      if (location.pathname.includes("pages")) location.href = "../auth/login.html";
      else location.href = "auth/login.html";
    }
  } catch {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("session");
    if (location.pathname.includes("pages")) location.href = "../auth/login.html";
    else location.href = "auth/login.html";
  }
})();

/* --- Session Cookie Helpers --- 
function setSessionCookie(username, minutes = 20) {
  const expiryMs = Date.now() + minutes * 60 * 1000;
  const payload = encodeURIComponent(JSON.stringify({ user: username, exp: expiryMs }));
  const expires = new Date(expiryMs).toUTCString();
  document.cookie = `playit_session=${payload}; expires=${expires}; path=/`;
}

function getSessionCookie() {
  const match = document.cookie.match(/(?:^|;\s*)playit_session=([^;]+)/);
  if (!match) return null;

  try {
    const data = JSON.parse(decodeURIComponent(match[1]));
    if (!data.exp || Date.now() > Number(data.exp)) return null;
    return data.user || null;
  } catch {
    return null;
  }
}

function clearSessionCookie() {
  document.cookie = `playit_session=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

/* --- Single source of truth for auth guard --- 
function requireAuth(loginPathFromPages = "../auth/login.html", loginPathFromRoot = "auth/login.html") {
  // 1) prefer cookie session
  const cookieUser = getSessionCookie();

  // 2) fallback to localStorage (for backward compatibility with your current code)
  const lsUser = getCurrentUser();
  const sessionStr = localStorage.getItem("session");

  // If cookie exists -> accept it, also sync localStorage user for the rest of the app
  if (cookieUser) {
    if (lsUser !== cookieUser) setCurrentUser(cookieUser);
    return cookieUser;
  }

  // No cookie: try localStorage session (your current mechanism)
  if (!lsUser || !sessionStr) {
    if (location.pathname.includes("pages")) location.href = loginPathFromPages;
    else location.href = loginPathFromRoot;
    return null;
  }

  try {
    const session = JSON.parse(sessionStr);
    if (!session.expiry || new Date(session.expiry) < new Date()) {
      localStorage.removeItem("currentUser");
      localStorage.removeItem("session");
      clearSessionCookie();
      if (location.pathname.includes("pages")) location.href = loginPathFromPages;
      else location.href = loginPathFromRoot;
      return null;
    }
  } catch {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("session");
    clearSessionCookie();
    if (location.pathname.includes("pages")) location.href = loginPathFromPages;
    else location.href = loginPathFromRoot;
    return null;
  }

  return lsUser;
}*/



function requireAuth(loginPathFromPages = "../auth/login.html", loginPathFromRoot = "auth/login.html") {
    const username = getCurrentUser();
    const sessionStr = localStorage.getItem("session");

    if (!username || !sessionStr) {
        // redirect
        //if (location.pathname.includes("/pages/")) location.href = loginPathFromPages;
        //else location.href = loginPathFromRoot;
        if (location.pathname.includes("pages")) location.href = loginPathFromPages;
        else location.href = loginPathFromRoot;

        return null;
    }

    try {
        const session = JSON.parse(sessionStr);
        if (!session.expiry || new Date(session.expiry) < new Date()) {
            localStorage.removeItem("currentUser");
            localStorage.removeItem("session");
            if (location.pathname.includes("pages")) location.href = loginPathFromPages;
            else location.href = loginPathFromRoot;
            return null;
        }
    } catch {
        localStorage.removeItem("currentUser");
        localStorage.removeItem("session");
        if (location.pathname.includes("pages")) location.href = loginPathFromPages;
        else location.href = loginPathFromRoot;
        return null;
    }

    return username;
}


/* --- Game History (last results) --- */
function loadGameHistory() {
  return JSON.parse(localStorage.getItem("gameHistory") || "[]");
}

function saveGameHistory(history) {
  localStorage.setItem("gameHistory", JSON.stringify(history));
}

/**
 * Adds a single result entry to history (keeps newest first).
 * We keep up to 100 entries to avoid huge localStorage.
 */
function addGameHistoryEntry(entry) {
  const history = loadGameHistory();

  const safeEntry = {
    username: entry.username || "Unknown",
    game: entry.game || "Unknown",
    score: Number(entry.score) || 0,
    win: Boolean(entry.win),
    level: entry.level != null ? Number(entry.level) : null,
    stars: entry.stars != null ? Number(entry.stars) : null,
    ts: entry.ts || Date.now()
  };

  history.unshift(safeEntry);
  saveGameHistory(history.slice(0, 100));
}

/** Returns newest results */
function getRecentGameHistory(limit = 10) {
  return loadGameHistory().slice(0, limit);
}
