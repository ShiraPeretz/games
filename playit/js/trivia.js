/* js/trivia.js */

/* Login check */
//const currentUser = requireAuth("../auth/login.html", "auth/login.html");
//if (!currentUser) retu;
const username = getCurrentUser();
if (!username) {
  location.href = "../auth/login.html";
}

/* --- Question bank by levels --- */
const allQuestions = {
  1: [
    { q: "Who wrote 'Harry Potter'?", a: ["Tolkien", "Rowling", "King", "Martin"], correct: 1 },
    { q: "What is the capital of France?", a: ["London", "Berlin", "Paris", "Rome"], correct: 2 },
    { q: "What color do you get by mixing blue and yellow?", a: ["Green", "Purple", "Orange", "Brown"], correct: 0 },
    { q: "How many legs does a spider have?", a: ["6", "8", "4", "10"], correct: 1 }
  ],
  2: [
    { q: "Which chemical element is represented by the letter O?", a: ["Gold", "Oxygen", "Silver", "Iron"], correct: 1 },
    { q: "In which year was the country founded?", a: ["1945", "1967", "1948", "1950"], correct: 2 },
    { q: "Which is the largest planet?", a: ["Jupiter", "Saturn", "Earth", "Mars"], correct: 0 },
    { q: "How many days are in a leap year?", a: ["365", "366", "360", "364"], correct: 1 }
  ],
  3: [
    { q: "Who painted the Mona Lisa?", a: ["Van Gogh", "Picasso", "Da Vinci", "Rembrandt"], correct: 2 },
    { q: "What is the largest continent?", a: ["Africa", "Europe", "America", "Asia"], correct: 3 },
    { q: "Which land animal is the fastest?", a: ["Lion", "Cheetah", "Tiger", "Horse"], correct: 1 },
    { q: "How many seconds are in an hour?", a: ["3600", "60", "1000", "2400"], correct: 0 }
  ],
  4: [
    { q: "What is the capital of Japan?", a: ["Beijing", "Seoul", "Tokyo", "Bangkok"], correct: 2 },
    { q: "Which organ produces insulin?", a: ["Liver", "Pancreas", "Kidneys", "Heart"], correct: 1 }
  ],
  5: [
    { q: "Who was the first Prime Minister?", a: ["Begin", "Ben-Gurion", "Rabin", "Sharon"], correct: 1 }
  ]
};

/* --- Game setup --- */
const urlParams = new URLSearchParams(window.location.search);
const currentLevel = parseInt(urlParams.get("level"), 10) || 1;
const questions = allQuestions[currentLevel] || allQuestions[1];

/* --- State --- */
let currentQIndex = 0;
let score = 0;
let correctCount = 0;
let timerInterval = null;
let timeLeft = 30;
let isAnswering = false;

/* Help-wheel state */
let used5050 = false;
let usedTime = false;

/* Help costs (change as you like) */
const COST_5050 = 20;
const COST_TIME = 10;

/* --- Elements --- */
const questionEl = document.getElementById("questionText");
const answersDiv = document.getElementById("answersContainer");
const scoreEl = document.getElementById("score");
const timerEl = document.getElementById("timer");
const endScreen = document.getElementById("endScreen");

/* Level indicator (center, no overlap) */
const headerTitle = document.querySelector(".game-header");
if (headerTitle && !document.getElementById("levelIndicator")) {
  const levelEl = document.createElement("div");
  levelEl.id = "levelIndicator";
  levelEl.className = "level-box";
  levelEl.textContent = `Level ${currentLevel}`;

  // Put it between score and timer
  headerTitle.insertBefore(levelEl, headerTitle.lastElementChild);
}


/* --- UI helpers --- */
function updateScoreUI() {
  if (scoreEl) scoreEl.textContent = score;
}

function updateTimerUI() {
  if (!timerEl) return;

  timerEl.textContent = timeLeft;

  if (timeLeft <= 5) timerEl.style.color = "#ff4d4d";
  else timerEl.style.color = "white";
}

/**
 * Deduct points for help usage.
 * Returns true if deduction succeeded.
 * Prevents score from going below 0 by default.
 */
function spendPoints(cost) {
  if (score < cost) {
    alert("Not enough points to use this help.");
    return false;
  }
  score -= cost;
  updateScoreUI();
  return true;
}

/* --- Start --- */
function startGame() {
  currentQIndex = 0;
  score = 0;
  correctCount = 0;
  timeLeft = 30;
  isAnswering = false;

  used5050 = false;
  usedTime = false;

  const btn5050 = document.getElementById("btn5050");
  const btnTime = document.getElementById("btnTime");
  if (btn5050) {
    btn5050.disabled = false;
    btn5050.style.opacity = "1";
  }
  if (btnTime) {
    btnTime.disabled = false;
    btnTime.style.opacity = "1";
  }

  updateScoreUI();
  if (endScreen) endScreen.classList.add("hidden");

  startTimer();
  loadQuestion();
}

function startTimer() {
  clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerUI();

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      endGame(false);
    }
  }, 1000);
}

function loadQuestion() {
  const qData = questions[currentQIndex];
  if (!qData) return;

  if (questionEl) questionEl.textContent = qData.q;
  if (answersDiv) answersDiv.innerHTML = "";

  qData.a.forEach((ans, index) => {
    const btn = document.createElement("button");
    btn.textContent = ans;
    btn.className = "answer-btn";
    btn.onclick = () => checkAnswer(index, qData.correct, btn);
    answersDiv.appendChild(btn);
  });
}

/* --- Help wheels --- */
/* NOTE: your HTML uses onclick="use5050()" and onclick="addTime()" */
function use5050() {
  if (used5050 || isAnswering) return;

  // Deduct score FIRST
  if (!spendPoints(COST_5050)) return;

  used5050 = true;
  const btn = document.getElementById("btn5050");
  if (btn) {
    btn.disabled = true;
    btn.style.opacity = "0.5";
  }

  const correct = questions[currentQIndex].correct;
  const allBtns = document.querySelectorAll(".answer-btn");
  let removed = 0;

  allBtns.forEach((b, idx) => {
    if (idx !== correct && removed < 2) {
      b.style.visibility = "hidden";
      removed++;
    }
  });
}

function addTime() {
  if (usedTime || isAnswering) return;

  // Deduct score FIRST
  if (!spendPoints(COST_TIME)) return;

  usedTime = true;
  const btn = document.getElementById("btnTime");
  if (btn) {
    btn.disabled = true;
    btn.style.opacity = "0.5";
  }

  timeLeft += 15;
  if (timerEl) {
    timerEl.textContent = timeLeft;
    timerEl.style.color = "#00ff00";
    setTimeout(() => {
      if (timerEl) timerEl.style.color = "white";
    }, 500);
  }
}

/* --- Answer check --- */
function checkAnswer(selectedIndex, correctIndex, btnElement) {
  if (isAnswering) return;
  isAnswering = true;

  const isLastQuestion = currentQIndex === questions.length - 1;
  if (isLastQuestion) clearInterval(timerInterval);

  if (selectedIndex === correctIndex) {
    btnElement.classList.add("correct");
    score += 10 + Math.max(0, Math.floor(timeLeft / 2));
    correctCount++;
    updateScoreUI();
    btnElement.innerHTML += " ✅";
  } else {
    btnElement.classList.add("wrong");
    const allBtns = document.querySelectorAll(".answer-btn");
    if (allBtns[correctIndex]) allBtns[correctIndex].classList.add("correct");
  }

  setTimeout(() => {
    currentQIndex++;
    if (currentQIndex < questions.length) {
      isAnswering = false;
      loadQuestion();
    } else {
      endGame(true);
    }
  }, 1500);
}

/* --- Game end --- */
function endGame(finishedQuestions) {
  clearInterval(timerInterval);

  const passingThreshold = questions.length / 2;
  const isWin = correctCount > passingThreshold;

  let stars = 0;

  const finalScoreEl = document.getElementById("finalScore");
  const endMsgEl = document.getElementById("endMsg");
  const starDisplayEl = document.getElementById("starDisplay");
  const nextLevelBtn = document.getElementById("nextLevelBtn");

  if (isWin) {
    const maxPossibleScore = questions.length * 25;
    if (score > maxPossibleScore * 0.8) stars = 3;
    else if (score > maxPossibleScore * 0.5) stars = 2;
    else stars = 1;

    completeLevel("trivia", currentLevel, stars);

    if (starDisplayEl) starDisplayEl.innerHTML = "⭐".repeat(stars);
    if (endMsgEl) {
      endMsgEl.textContent = "Well done! You passed the level!";
      endMsgEl.style.color = "#00eaff";
    }
    if (nextLevelBtn) {
      nextLevelBtn.style.display = "inline-block";
      nextLevelBtn.onclick = () => (location.href = "levels.html");
    }
  } else {
    if (starDisplayEl) starDisplayEl.innerHTML = "❌";
    if (endMsgEl) {
      endMsgEl.textContent = `You did not pass...\nYou got ${correctCount} out of ${questions.length} correct`;
      endMsgEl.style.color = "#ff4d4d";
      endMsgEl.style.whiteSpace = "pre-wrap";
    }
    if (nextLevelBtn) nextLevelBtn.style.display = "none";
  }

  if (finalScoreEl) finalScoreEl.textContent = score;
  if (endScreen) endScreen.classList.remove("hidden");

  playSfx(isWin ? "win" : "lose");

  saveTriviaStats(score, isWin);

  addGameHistoryEntry({
  username: getCurrentUser(),
  game: "Trivia",
  score: score,
  win: isWin,
  level: currentLevel,
  stars: stars,
  ts: Date.now()
});

}

function saveTriviaStats(finalScore, didWin) {
  const users = loadUsers();
  const username = getCurrentUser();
  const user = users.find((u) => u.username === username);
  if (!user) return;

  if (!user.stats) user.stats = {};
  if (!user.stats.trivia) user.stats.trivia = { plays: 0, bestScore: 0 };

  user.stats.trivia.plays += 1;

  if (finalScore > (user.stats.trivia.bestScore || 0)) {
    user.stats.trivia.bestScore = finalScore;
  }

  user.stats.trivia.wins = user.stats.trivia.wins || 0;
  if (didWin) user.stats.trivia.wins += 1;

  saveUsers(users);
}

/* Auto start */
startGame();
