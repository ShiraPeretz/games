/* js/trivia.js */

/* בדיקת התחברות */
const currentUser = getCurrentUser();
if (!currentUser) location.href = "../auth/login.html";

/* --- מאגר שאלות מחולק לשלבים --- */
const allQuestions = {
    1: [ // שלב 1
        { q: "מי כתב את 'הארי פוטר'?", a: ["טולקין", "רולינג", "קינג", "מרטין"], correct: 1 },
        { q: "מהי בירת צרפת?", a: ["לונדון", "ברלין", "פריז", "רומא"], correct: 2 },
        { q: "איזה צבע מתקבל מערבוב כחול וצהוב?", a: ["ירוק", "סגול", "כתום", "חום"], correct: 0 },
        { q: "כמה רגליים יש לעכביש?", a: ["6", "8", "4", "10"], correct: 1 }
    ],
    2: [ // שלב 2
        { q: "איזה יסוד כימי מסומן באות O?", a: ["זהב", "חמצן", "כסף", "ברזל"], correct: 1 },
        { q: "באיזו שנה הוקמה המדינה?", a: ["1945", "1967", "1948", "1950"], correct: 2 },
        { q: "מהו כוכב הלכת הגדול ביותר?", a: ["צדק", "שבתאי", "ארץ", "מאדים"], correct: 0 },
        { q: "כמה ימים בשנה מעוברת?", a: ["365", "366", "360", "364"], correct: 1 }
    ],
    3: [ // שלב 3
        { q: "מי צייר את המונה ליזה?", a: ["ואן גוך", "פיקאסו", "דה וינצ'י", "רמברנדט"], correct: 2 },
        { q: "מהי היבשת הגדולה ביותר?", a: ["אפריקה", "אירופה", "אמריקה", "אסיה"], correct: 3 },
        { q: "איזו חיה היא המהירה ביותר ביבשה?", a: ["אריה", "צ'יטה", "נמר", "סוס"], correct: 1 },
        { q: "כמה שניות יש בשעה?", a: ["3600", "60", "1000", "2400"], correct: 0 }
    ],
    4: [ // שלב 4
        { q: "מהי בירת יפן?", a: ["בייג'ינג", "סיאול", "טוקיו", "בנגקוק"], correct: 2 },
        { q: "איזה איבר בגוף מייצר אינסולין?", a: ["כבד", "לבלב", "כליות", "לב"], correct: 1 }
    ],
    5: [ // שלב 5
        { q: "מי היה ראש הממשלה הראשון?", a: ["בגין", "בן גוריון", "רבין", "שרון"], correct: 1 }
    ]
};

/* --- לוגיקת משחק --- */
const urlParams = new URLSearchParams(window.location.search);
const currentLevel = parseInt(urlParams.get('level')) || 1;
const questions = allQuestions[currentLevel] || allQuestions[1];

let currentQIndex = 0;
let score = 0;
let correctCount = 0; // <-- משתנה חדש לספירת תשובות נכונות
let timerInterval;
let timeLeft = 30;
let isAnswering = false;

// משתנים לגלגלי עזרה
let used5050 = false;
let usedTime = false;

/* אלמנטים */
const questionEl = document.getElementById("questionText");
const answersDiv = document.getElementById("answersContainer");
const scoreEl = document.getElementById("score");
const timerEl = document.getElementById("timer");
const endScreen = document.getElementById("endScreen");

// עדכון כותרת השלב
const headerTitle = document.querySelector(".game-header");
if(headerTitle) {
    const existingLevelInd = document.getElementById("levelIndicator");
    if(!existingLevelInd) {
        headerTitle.insertAdjacentHTML('afterbegin', `<div id="levelIndicator" style="position:absolute; top:15px; right:20px; color:#00eaff; font-weight:bold;">שלב ${currentLevel}</div>`);
    }
}

/* התחלה */
function startGame() {
    currentQIndex = 0;
    score = 0;
    correctCount = 0; // <-- איפוס המונה
    timeLeft = 30;
    isAnswering = false;
    
    // איפוס גלגלי עזרה
    used5050 = false;
    usedTime = false;
    const btn5050 = document.getElementById("btn5050");
    const btnTime = document.getElementById("btnTime");
    if(btn5050) { btn5050.disabled = false; btn5050.style.opacity = "1"; }
    if(btnTime) { btnTime.disabled = false; btnTime.style.opacity = "1"; }

    if(scoreEl) scoreEl.textContent = 0;
    if(endScreen) endScreen.classList.add("hidden");
    
    startTimer();
    loadQuestion();
}

function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        if(timerEl) {
            timerEl.textContent = timeLeft;
            if (timeLeft <= 5) timerEl.style.color = "#ff4d4d";
            else timerEl.style.color = "white";
        }

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            endGame(false); 
        }
    }, 1000);
}

function loadQuestion() {
    const qData = questions[currentQIndex];
    if(questionEl) questionEl.textContent = qData.q;
    if(answersDiv) answersDiv.innerHTML = "";

    qData.a.forEach((ans, index) => {
        const btn = document.createElement("button");
        btn.textContent = ans;
        btn.className = "answer-btn";
        btn.onclick = () => checkAnswer(index, qData.correct, btn);
        answersDiv.appendChild(btn);
    });
}

/* --- גלגלי עזרה --- */
function use5050() {
    if (used5050 || isAnswering) return;
    used5050 = true;
    const btn = document.getElementById("btn5050");
    if(btn) { btn.disabled = true; btn.style.opacity = "0.5"; }

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
    usedTime = true;
    const btn = document.getElementById("btnTime");
    if(btn) { btn.disabled = true; btn.style.opacity = "0.5"; }

    timeLeft += 15;
    if(timerEl) {
        timerEl.textContent = timeLeft;
        timerEl.style.color = "#00ff00";
        setTimeout(()=> timerEl.style.color = "white", 500);
    }
}

/* --- בדיקת תשובה --- */
function checkAnswer(selectedIndex, correctIndex, btnElement) {
    if (isAnswering) return;
    isAnswering = true;

    // האם זו השאלה האחרונה?
    const isLastQuestion = currentQIndex === questions.length - 1;
    if (isLastQuestion) clearInterval(timerInterval);

    if (selectedIndex === correctIndex) {
        btnElement.classList.add("correct");
        score += 10 + Math.max(0, Math.floor(timeLeft / 2));
        correctCount++; // <-- ספירת תשובה נכונה
        if(scoreEl) scoreEl.textContent = score;
        btnElement.innerHTML += " ✅";
    } else {
        btnElement.classList.add("wrong");
        const allBtns = document.querySelectorAll(".answer-btn");
        if(allBtns[correctIndex]) allBtns[correctIndex].classList.add("correct");
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

/* --- סיום משחק --- */
function endGame(finishedQuestions) {
    clearInterval(timerInterval);
    
    // 1. חישוב תנאי המעבר: יותר מ-50% תשובות נכונות
    const passingThreshold = questions.length / 2; // למשל ב-4 שאלות, צריך יותר מ-2 (כלומר 3 ומעלה)
    const isWin = correctCount > passingThreshold;

    let stars = 0;
    const finalScoreEl = document.getElementById("finalScore");
    const endMsgEl = document.getElementById("endMsg");
    const starDisplayEl = document.getElementById("starDisplay");
    const nextLevelBtn = document.getElementById("nextLevelBtn");

    if (isWin) {
        // --- ניצחון: חישוב כוכבים ---
        const maxPossibleScore = questions.length * 25; 
        if (score > maxPossibleScore * 0.8) stars = 3;
        else if (score > maxPossibleScore * 0.5) stars = 2;
        else stars = 1;

        // שמירת ההתקדמות ב-storage (זה מה שפותח את השלב הבא)
        completeLevel("trivia", currentLevel, stars);

        // עדכון UI לניצחון
        if(starDisplayEl) starDisplayEl.innerHTML = "⭐".repeat(stars);
        if(endMsgEl) {
            endMsgEl.textContent = "כל הכבוד! עברת שלב!";
            endMsgEl.style.color = "#00eaff";
        }
        if(nextLevelBtn) {
            nextLevelBtn.style.display = "inline-block";
            nextLevelBtn.onclick = () => location.href = "levels.html";
        }

    } else {
        // --- כישלון: לא ענה מספיק נכון ---
        // לא שומרים כוכבים (נשאר 0 או הכמות הקודמת שהייתה)
        // השלב הבא לא ייפתח ב-storage.js כי לא קראנו ל-completeLevel או ששלחנו 0

        if(starDisplayEl) starDisplayEl.innerHTML = "❌";
        if(endMsgEl) {
            // הודעה מפורטת למה נכשל
            endMsgEl.textContent = `לא עברת...\nצדקת ב-${correctCount} מתוך ${questions.length} שאלות`;
            endMsgEl.style.color = "#ff4d4d";
            endMsgEl.style.whiteSpace = "pre-wrap"; // מאפשר ירידת שורה
        }
        // הסתרת הכפתור למפה/שלב הבא
        if(nextLevelBtn) nextLevelBtn.style.display = "none";
    }

    if(finalScoreEl) finalScoreEl.textContent = score;
    if(endScreen) endScreen.classList.remove("hidden");
}

function goToNextLevel() {
    location.href = `levels.html`;
}

// התחלה אוטומטית
startGame();