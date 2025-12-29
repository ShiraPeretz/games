/* js/games.js */

/************************
 * USER LOGIN + LOGOUT  *
 ************************/
const currentUserSpan = document.getElementById("currentUser");
const logoutBtn = document.getElementById("logoutBtn");

//const username = getCurrentUser();
// If no logged-in user → redirect to login page
//if (!username) { 
//  location.href = "../auth/login.html";
//}

const username = getCurrentUser();
if (!username) {
  location.href = "../auth/login.html";
}

// Display current username
currentUserSpan.textContent = "User: " + username;

// Logout logic
logoutBtn.onclick = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("session");
    //clearSessionCookie();
    location.href = "../auth/login.html";
};

/************************
 *     PROFILE MODAL    *
 ************************/
const profileBtn = document.getElementById("profileBtn");
const profileModal = document.getElementById("profileModal");
const closeProfileBtn = document.getElementById("closeProfile");

// Open profile modal
profileBtn.onclick = () => {
    fillProfileData();
    profileModal.style.display = "block";
};

// Close modal via X button
closeProfileBtn.onclick = () => {
    profileModal.style.display = "none";
};

//// Close modal by clicking outside
//window.onclick = (e) => {
//    if (e.target === profileModal) {
//        profileModal.style.display = "none";
//    }
//};

window.addEventListener("click", (e) => {
    if (e.target === profileModal) {
        profileModal.style.display = "none";
    }
});

/************************
 *  FILL PROFILE DATA   *
 ************************/
function fillProfileData() {
    const users = loadUsers();
    //const username = getCurrentUser();
    const user = users.find(u => u.username === username);
    if (!user) return; 

    document.getElementById("profFullName").textContent = user.fullName;
    document.getElementById("profUsername").textContent = user.username;
    document.getElementById("profCreated").textContent =
        new Date(user.createdAt).toLocaleDateString("en-US");

    document.getElementById("profTriviaStats").textContent =
        `Played ${user.stats.trivia.plays} times | Best score: ${user.stats.trivia.bestScore}`;

    document.getElementById("profCatcherStats").textContent =
        `Played ${user.stats.catcher.plays} times | Best score: ${user.stats.catcher.bestScore}`;

    document.getElementById("profTotalPoints").textContent = user.totalPoints || 0;


    /*const achievementsList = document.getElementById("profAchievements");
    achievementsList.innerHTML = "";

    if (user.achievements && user.achievements.length > 0) {
        user.achievements.forEach(achievement => {
            const li = document.createElement("li");
            li.textContent = achievement;
            achievementsList.appendChild(li);
        });
    } else {
        achievementsList.innerHTML = "<li>No achievements yet 🎯</li>";
    }*/
}

/************************
 *   GENERATE GAME CARDS *
 ************************/
const gamesList = [
    { title: "Trivia", desc: "Thinking challenge", image: "img1.png", link: "levels.html", active: true },
    { title: "Coin Catcher", desc: "Action game", image: "img2.png", link: "catcher.html", active: true }
];

// Add 30 games in development (img3 – img32)
for (let i = 3; i <= 32; i++) {
    gamesList.push({
        title: "Coming Soon…",
        desc: "In development…",
        image: `img${i}.png`,
        active: false
    });
}

const container = document.getElementById("gamesContainer");

// Create cards dynamically
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
