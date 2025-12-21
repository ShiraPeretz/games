/* בדיקת משתמש */
const currentUser = getCurrentUser();
if (!currentUser) location.href = "../auth/login.html";

/* אלמנטים */
const gameBoard = document.getElementById("gameBoard");
const player = document.getElementById("player");
const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");
const missedEl = document.getElementById("missed");
const modal = document.getElementById("gameOverModal");
const endReasonEl = document.getElementById("endReason");

/* משתני משחק */
let score = 0;
let lives = 3;
let missedCoins = 0;
const maxMissed = 10;
let gameActive = false;
let playerPos = 275;
const boardWidth = 600;
const boardHeight = 500;
const playerSpeed = 25; // תנועה קצת יותר מהירה

let items = []; 
let spawnInterval;
let gameLoopInterval;
let spawnRate = 700; // התחלה מהירה יותר (היה 800)

/* תנועת שחקן */
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
    // איפוס
    score = 0;
    lives = 3;
    missedCoins = 0;
    items = [];
    gameActive = true;
    playerPos = 275;
    player.style.left = playerPos + "px";
    spawnRate = 700;
    
    // ניקוי לוח
    document.querySelectorAll(".item").forEach(e => e.remove());
    
    updateUI();
    modal.classList.add("hidden");

    // התחלת לולאות
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
    
    // לוגיקה חדשה ליצירת אובייקטים:
    // 0-0.5: מטבע (50%)
    // 0.5-0.75: פצצה (25%)
    // 0.75-1.0: דינמיט (25%)
    const rand = Math.random();
    let type = "coin";
    let text = "💰";
    let speed = 2 + (score / 100); // מהירות בסיסית

    if (rand > 0.5 && rand <= 0.75) {
        type = "bomb";
        text = "💣";
        speed += 1; // פצצה מהירה יותר
    } else if (rand > 0.75) {
        type = "dynamite";
        text = "🧨";
        speed += 2; // דינמיט מהיר מאוד!
    }

    item.textContent = text;
    item.dataset.type = type;

    // מיקום רנדומלי
    const randomX = Math.floor(Math.random() * (boardWidth - 40));
    item.style.left = randomX + "px";
    item.style.top = "0px";
    
    gameBoard.appendChild(item);
    
    items.push({ el: item, y: 0, speed: speed, type: type });
}

function gameLoop() {
    if (!gameActive) return;

    items.forEach((itemObj, index) => {
        // הזזת הפריט למטה
        itemObj.y += itemObj.speed;
        itemObj.el.style.top = itemObj.y + "px";

        // 1. בדיקת התנגשות (תפיסה/פגיעה)
        if (checkCollision(player, itemObj.el)) {
            handleCollision(itemObj, index);
        }
        // 2. בדיקה אם הגיע לרצפה (פספוס)
        else if (itemObj.y > boardHeight) {
            itemObj.el.remove();
            items.splice(index, 1);
            
            // אם פספסנו מטבע - עונש
            if (itemObj.type === "coin") {
                missedCoins++;
                updateUI();
                if (missedCoins >= maxMissed) {
                    gameOver("פספסת יותר מדי מטבעות! 💸");
                }
            }
        }
    });

    // הגברת קושי ככל שהניקוד עולה
    if (score > 0 && score % 100 === 0 && spawnRate > 300) {
        spawnRate -= 10; // מגביר את קצב יצירת האובייקטים
        startSpawning();
    }

    requestAnimationFrame(gameLoop);
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
    // מחיקה
    itemObj.el.remove();
    items.splice(index, 1);

    if (itemObj.type === "coin") {
        score += 10;
        // אפקט ירוק עדין
        gameBoard.style.boxShadow = "inset 0 0 20px rgba(0,255,0,0.2)";
        setTimeout(() => gameBoard.style.boxShadow = "none", 100);
    } 
    else if (itemObj.type === "bomb") {
        lives--;
        hurtEffect();
    } 
    else if (itemObj.type === "dynamite") {
        lives -= 2; // דינמיט מוריד 2 חיים!
        hurtEffect();
    }

    updateUI();

    if (lives <= 0) {
        gameOver("נגמרו לך החיים! ☠️");
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
    
    saveStats();
    
    document.getElementById("finalScore").textContent = score;
    endReasonEl.textContent = reason;
    modal.classList.remove("hidden");
}

function restartGame() {
    startGame();
}

function saveStats() {
    const users = loadUsers();
    const userIndex = users.findIndex(u => u.username === currentUser);
    
    if (userIndex !== -1) {
        const user = users[userIndex];
        if (!user.stats) user.stats = { trivia: { plays: 0, bestScore: 0 }, catcher: { plays: 0, bestScore: 0 } };
        
        user.stats.catcher.plays++;
        if (score > user.stats.catcher.bestScore) {
            user.stats.catcher.bestScore = score;
        }
        saveUsers(users);
    }
}

// התחלה
startGame();