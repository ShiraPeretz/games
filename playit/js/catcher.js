/* js/catcher.js */

///* Check logged-in user */
const currentUser = getCurrentUser();
if (!currentUser) location.href = "../auth/login.html";

/* Elements */
const gameBoard = document.getElementById("gameBoard");
const player = document.getElementById("player");
const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");
const missedEl = document.getElementById("missed");
const modal = document.getElementById("gameOverModal");
const endReasonEl = document.getElementById("endReason");

/* Game variables */
let score = 0;
let lives = 3;
let missedCoins = 0;
const maxMissed = 10;
let gameActive = false;
let playerPos = 275;
const boardWidth = 600;
const boardHeight = 500;
const playerSpeed = 25; // slightly faster movement
let personalBestBeaten = false;

let items = [];
let spawnInterval;
let gameLoopInterval;
let spawnRate = 700; // faster starting spawn (was 800)

//document.addEventListener("keydown", unlockAudio, { once: true });
//document.addEventListener("click", unlockAudio, { once: true });

/* Player movement */
document.addEventListener("keydown", (e) => {
    if (!gameActive) return;

    if (e.key === "ArrowRight") {
        if (playerPos < boardWidth - 60) playerPos += playerSpeed;
    } else if (e.key === "ArrowLeft") {
        if (playerPos > 0) playerPos -= playerSpeed;
    }

    player.style.left = playerPos + "px";
});

function startGame() {
    // Reset
    score = 0;
    lives = 3;
    missedCoins = 0;
    items = [];
    gameActive = true;
    playerPos = 275;
    player.style.left = playerPos + "px";
    spawnRate = 700;
    personalBestBeaten = false;


    // Clear board from old items
    document.querySelectorAll(".item").forEach(el => el.remove());

    updateUI();
    modal.classList.add("hidden");

    // Start loops
    startSpawning();
    gameLoopInterval = requestAnimationFrame(gameLoop);
}

function startSpawning() {
    clearInterval(spawnInterval);
    spawnInterval = setInterval(createItem, spawnRate);
}

function updateUI() {
    scoreEl.textContent = score;
    livesEl.textContent = "❤️".repeat(Math.max(0, lives));
    missedEl.textContent = missedCoins;
}

function createItem() {
    if (!gameActive) return;

    const item = document.createElement("div");
    item.classList.add("item");

    // New item generation logic:
    // 0–0.5   : coin (50%)
    // 0.5–0.75: bomb (25%)
    // 0.75–1.0: dynamite (25%)
    const rand = Math.random();
    let type = "coin";
    let text = "💰";
    let speed = 2 + (score / 100); // base falling speed

    if (rand > 0.5 && rand <= 0.75) {
        type = "bomb";
        text = "💣";
        speed += 1; // bombs are faster
    } else if (rand > 0.75) {
        type = "dynamite";
        text = "🧨";
        speed += 2; // dynamite is very fast
    }

    item.textContent = text;
    item.dataset.type = type;

    // Random X position
    const randomX = Math.floor(Math.random() * (boardWidth - 40));
    item.style.left = randomX + "px";
    item.style.top = "0px";

    gameBoard.appendChild(item);
    items.push({ el: item, y: 0, speed: speed, type: type });
}

function gameLoop() {
    if (!gameActive) return;

    // Iterate backwards to safely splice items while looping
    for (let i = items.length - 1; i >= 0; i--) {
        const itemObj = items[i];

        // In rare cases element may already be removed
        if (!itemObj || !itemObj.el || !itemObj.el.isConnected) {
            items.splice(i, 1);
            continue;
        }

        // Move item down
        itemObj.y += itemObj.speed;
        itemObj.el.style.top = itemObj.y + "px";

        // 1) Collision check (catch / hit)
        if (checkCollision(player, itemObj.el)) {
            handleCollision(itemObj, i);
            continue;
        }

        // 2) Missed (reached bottom)
        if (itemObj.y > boardHeight) {
            itemObj.el.remove();
            items.splice(i, 1);

            // If we missed a coin → penalty
            if (itemObj.type === "coin") {
                missedCoins++;
                updateUI();

                if (missedCoins >= maxMissed) {
                    gameOver("You missed too many coins 💸");
                    return;
                }
            }
        }
    }

    // Increase difficulty as score grows
    if (score > 0 && score % 100 === 0 && spawnRate > 300) {
        spawnRate -= 10;
        startSpawning();
    }

    gameLoopInterval = requestAnimationFrame(gameLoop);
}


function checkCollision(playerDiv, itemDiv) {
    const pRect = playerDiv.getBoundingClientRect();
    const iRect = itemDiv.getBoundingClientRect();

    return !(
        pRect.top > iRect.bottom ||
        pRect.bottom < iRect.top ||
        pRect.right < iRect.left ||
        pRect.left > iRect.right
    );
}

function handleCollision(itemObj, index) {
    // Remove the item
    itemObj.el.remove();
    items.splice(index, 1);

    if (itemObj.type === "coin") {
        score += 10;

        // subtle green effect
        gameBoard.style.boxShadow = "inset 0 0 20px rgba(0,255,0,0.2)";
        setTimeout(() => gameBoard.style.boxShadow = "none", 100);
    }
    else if (itemObj.type === "bomb") {
        lives--;
        hurtEffect();
    }
    else if (itemObj.type === "dynamite") {
        lives -= 2; // dynamite removes 2 lives
        hurtEffect();
    }

    updateUI();

    if (lives <= 0) {
        gameOver("You ran out of lives! 💀");
    }
}

function hurtEffect() {
    gameBoard.style.borderColor = "red";
    gameBoard.style.backgroundColor = "rgba(255,0,0,0.1)";

    setTimeout(() => {
        gameBoard.style.borderColor = "rgba(255,255,255,0.3)";
        gameBoard.style.backgroundColor = "rgba(255,255,255,0.1)";
    }, 200);
}

function gameOver(reason) {
    gameActive = false;
  
    clearInterval(spawnInterval);
    cancelAnimationFrame(gameLoopInterval);

    const users = loadUsers();
    const me = getCurrentUser();
    const user = users.find(u => u.username === me);
    const prevBest = user?.stats?.catcher?.bestScore || 0;

    const win = score > prevBest;
    if (win) playSfx("win");  // not working?

    addGameHistoryEntry({
        username: me,
        game: "Coin Catcher",
        score: score,
        win: win,
        level: null,
        stars: null,
        ts: Date.now()
    });

    saveStats();

    document.getElementById("finalScore").textContent = score;
    endReasonEl.textContent = win ? "you broke the record! 🎉": reason;
    modal.classList.remove("hidden");
}

function restartGame() {
    startGame();
}

function saveStats() {
    const users = loadUsers();

    if (!currentUser) return;

    const userIndex = users.findIndex(u => u.username === currentUser);

    if (userIndex !== -1) {
        const user = users[userIndex];

        if (!user.stats) {
            user.stats = {
                trivia: { plays: 0, bestScore: 0 },
                catcher: { plays: 0, bestScore: 0 }
            };
        }

        user.stats.catcher.plays++;

        if (score > user.stats.catcher.bestScore) {
            user.stats.catcher.bestScore = score;
        }

        saveUsers(users);
    }
}

// Start
startGame();
