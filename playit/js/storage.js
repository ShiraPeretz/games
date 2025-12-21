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
/* --- תוספות חדשות לניהול שלבים וניקוד --- */

// פונקציה לשמירת סיום שלב
function completeLevel(gameName, levelNumber, stars) {
    const users = loadUsers();
    const username = getCurrentUser();
    const userIndex = users.findIndex(u => u.username === username);

    if (userIndex !== -1) {
        const user = users[userIndex];
        
        // יצירת מבנה נתונים אם לא קיים
        if (!user.progress) user.progress = {};
        if (!user.progress[gameName]) user.progress[gameName] = { maxLevel: 1, levels: {} };

        // עדכון כוכבים לשלב הנוכחי (שומרים את התוצאה הגבוהה ביותר)
        const currentStars = user.progress[gameName].levels[levelNumber] || 0;
        if (stars > currentStars) {
            user.progress[gameName].levels[levelNumber] = stars;
        }

        // פתיחת השלב הבא אם עברנו בהצלחה (למשל מעל 1 כוכב)
        if (stars > 0 && levelNumber === user.progress[gameName].maxLevel) {
            user.progress[gameName].maxLevel++;
        }

        saveUsers(users);
    }
}

// קבלת המידע על ההתקדמות כדי לצייר את המפה
function getUserProgress(gameName) {
    const users = loadUsers();
    const username = getCurrentUser();
    const user = users.find(u => u.username === username);

    if (user && user.progress && user.progress[gameName]) {
        return user.progress[gameName];
    }
    return { maxLevel: 1, levels: {} }; // ברירת מחדל למשתמש חדש
}

/* --- ניהול Session (פג תוקף) --- */
(function checkSession() {
    const sessionStr = localStorage.getItem("session");
    if (!sessionStr) return; // אין session, הכל בסדר (או שהמשתמש לא מחובר)

    const session = JSON.parse(sessionStr);
    const now = new Date();
    const expiry = new Date(session.expiry);

    // אם עבר הזמן
    if (now > expiry) {
        alert("זמן החיבור שלך פג. אנא התחבר מחדש.");
        localStorage.removeItem("currentUser");
        localStorage.removeItem("session");
        
        // הפניה לדף ההתחברות (מנסים לנחש את הנתיב הנכון)
        if (location.pathname.includes("pages")) {
            location.href = "../auth/login.html";
        } else {
            location.href = "auth/login.html";
        }
    }
})();