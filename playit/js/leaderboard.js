/* js/leaderboard.js - גרסה שמציגה נתונים תמיד לעיצוב */

document.addEventListener("DOMContentLoaded", () => {
    const podiumContainer = document.getElementById("podium");
    const listContainer = document.getElementById("rankingList");

    // === נתונים לדוגמה (Hardcoded) לעיצוב ===
    // המערך הזה ירוץ תמיד, גם אם אין משתמשים אמיתיים במערכת
    let users = [
        { username: "CyberKing", calculatedScore: 3500, triviaWins: 15 },
        { username: "QueenB", calculatedScore: 2800, triviaWins: 12 },
        { username: "PixelPro", calculatedScore: 2450, triviaWins: 9 },
        { username: "Glitch", calculatedScore: 1800, triviaWins: 5 },
        { username: "RetroGamer", calculatedScore: 1200, triviaWins: 3 },
        { username: "Newbie", calculatedScore: 500, triviaWins: 1 }
    ];

    // מנסים להביא את המשתמש הנוכחי רק כדי להדגיש אותו אם הוא קיים
    let currentUser = null;
    try {
        if (typeof UserStore !== 'undefined') {
            const realUsers = UserStore.loadUsers();
            // אם יש משתמשים אמיתיים, נשתמש בהם במקום המזויפים (אופציונלי - כרגע נשאיר מזויפים לעיצוב)
            // users = realUsers.length > 0 ? realUsers : users;
            currentUser = UserStore.getCurrentUser();
        }
    } catch (e) {
        console.log("Design mode: Running without UserStore");
    }

    // מיון לפי ניקוד
    users.sort((a, b) => b.calculatedScore - a.calculatedScore);

    // ניקוי
    podiumContainer.innerHTML = "";
    listContainer.innerHTML = "";

    // === בניית הפודיום (3 הראשונים) ===
    const topUsers = users.slice(0, 3);
    
    topUsers.forEach((user, index) => {
        const place = index + 1;
        const isCurrent = currentUser && currentUser.username === user.username;
        const firstLetter = user.username.charAt(0).toUpperCase();
        
        // הוספת כתר למקום הראשון
        const crownHtml = place === 1 ? '<div class="crown-icon">👑</div>' : '';

        const podiumItem = document.createElement("div");
        podiumItem.className = `podium-item place-${place}`;
        
        podiumItem.innerHTML = `
            <div class="podium-avatar ${isCurrent ? 'current-user-highlight' : ''}">
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

    // === בניית הרשימה (מקום 4 ומטה) ===
    const restUsers = users.slice(3);
    
    if (restUsers.length > 0) {
        restUsers.forEach((user, index) => {
            const rank = index + 4;
            const isCurrent = currentUser && currentUser.username === user.username;
            const wins = user.triviaWins || 0;

            const row = document.createElement("div");
            row.className = `list-item ${isCurrent ? 'current-user-highlight' : ''}`;
            
            row.innerHTML = `
                <div class="rank-num">#${rank}</div>
                <div class="player-info">${user.username}</div>
                <div class="stat-val">${wins} נצ'</div>
                <div class="score-val">${user.calculatedScore}</div>
            `;

            listContainer.appendChild(row);
        });
    }
});