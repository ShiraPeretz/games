/***********************
 * USER LOGIN + LOGOUT *
 ***********************/
const currentUserSpan = document.getElementById("currentUser");
const logoutBtn = document.getElementById("logoutBtn");

const username = getCurrentUser();

if (!username) {
    location.href = "../auth/login.html";
}

currentUserSpan.textContent = "משתמשת: " + username;

logoutBtn.onclick = () => {
    localStorage.removeItem("currentUser");
    location.href = "../auth/login.html";
};



/**************************
 *     PROFILE MODAL      *
 **************************/
const profileBtn = document.getElementById("profileBtn");
const profileModal = document.getElementById("profileModal");
const closeProfile = document.getElementById("closeProfile");

profileBtn.onclick = () => {
    fillProfileData();
    profileModal.style.display = "block";
};

closeProfile.onclick = () => {
    profileModal.style.display = "none";
};

window.onclick = (e) => {
    if (e.target === profileModal) {
        profileModal.style.display = "none";
    }
};


/**************************
 *  FILL PROFILE DETAILS  *
 **************************/
function fillProfileData() {
    const users = loadUsers();
    const username = getCurrentUser();
    const user = users.find(u => u.username === username);

    document.getElementById("profFullName").textContent = user.fullName;
    document.getElementById("profUsername").textContent = user.username;
    document.getElementById("profCreated").textContent =
        new Date(user.createdAt).toLocaleDateString("he-IL");

    document.getElementById("profTriviaStats").textContent =
        `שיחקה ${user.stats.trivia.plays} פעמים | ניקוד גבוה: ${user.stats.trivia.bestScore}`;

    document.getElementById("profCatcherStats").textContent =
        `שיחקה ${user.stats.catcher.plays} פעמים | שיא: ${user.stats.catcher.bestScore}`;

    const achList = document.getElementById("profAchievements");
    achList.innerHTML = "";

    if (user.achievements && user.achievements.length > 0) {
        user.achievements.forEach(a => {
            const li = document.createElement("li");
            li.textContent = a;
            achList.appendChild(li);
        });
    } else {
        achList.innerHTML = "<li>אין עדיין הישגים 🎯</li>";
    }
}


/**************************
 *   GENERATE GAME CARDS  *
 **************************/

const gamesList = [
    { title: "טריוויה", desc: "אתגר חשיבה", image: "img1.png", link: "levels.html", active: true },
    { title: "תפיסת מטבעות", desc: "משחק תנועה", image: "img2.png", link: "catcher.html", active: true }
];

// הוספת 30 משחקים בפיתוח (img3 עד img32)
for (let i = 3; i <= 32; i++) {
    gamesList.push({
        title: "בפיתוח…",
        desc: "בקרוב…",
        image: `img${i}.png`,
        active: false
    });
}

const container = document.getElementById("gamesContainer");

gamesList.forEach(game => {
    const card = document.createElement("div");
    card.className = game.active ? "game-card clickable" : "game-card disabled";

    card.innerHTML = `
        <img src="../img/${game.image}" class="game-thumb" alt="${game.title}">
        <h3>${game.title}</h3>
        <p>${game.desc}</p>
    `;

    if (game.active) {
        card.onclick = () => window.location.href = game.link;
    }

    container.appendChild(card);
});


