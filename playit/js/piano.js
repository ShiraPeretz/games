const board = document.getElementById("board");
const lanes = document.querySelectorAll(".lane");
const scoreEl = document.getElementById("score");

let score = 0;
let speed = 3;
let gameInterval;

function createNote() {
    const laneIndex = Math.floor(Math.random() * lanes.length);
    const note = document.createElement("div");
    note.classList.add("note");
    lanes[laneIndex].appendChild(note);

    let y = -120;

    function fall() {
        y += speed;
        note.style.top = y + "px";

        if (y > 600) {
            gameOver();
        }
    }

    note.interval = setInterval(fall, 16);

    note.addEventListener("click", () => {
        clearInterval(note.interval);
        note.remove();
        score++;
        scoreEl.textContent = score;
    });
}

function startGame() {
    gameInterval = setInterval(createNote, 800);
}

function gameOver() {
    clearInterval(gameInterval);
    alert("💥 הפסדת! ניקוד: " + score);
    location.reload();
}

startGame();
