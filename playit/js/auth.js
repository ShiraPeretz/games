/* js/auth.js */

/********************
 * REGISTER (הרשמה)
 ********************/
const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const users = loadUsers(); // פונקציה מ-storage.js
        const fullName = document.getElementById("fullName").value;
        const username = document.getElementById("username").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        // בדיקה אם המשתמש קיים
        if (users.find(u => u.username === username)) {
            alert("שם המשתמש כבר קיים במערכת");
            return;
        }

        const newUser = {
            fullName,
            username,
            email,
            password,
            createdAt: new Date().toISOString(),
            // שדות לאבטחה
            loginAttempts: 0, 
            blockedUntil: null,
            // נתונים למשחקים
            stats: {
                trivia: { plays: 0, bestScore: 0 },
                catcher: { plays: 0, bestScore: 0 }
            },
            achievements: []
        };

        users.push(newUser);
        saveUsers(users);
        
        // התחברות אוטומטית לאחר הרשמה
        performLogin(username);
    });
}

/********************
 * LOGIN (התחברות)
 ********************/
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const username = document.getElementById("loginUsername").value;
        const password = document.getElementById("loginPassword").value;
        const users = loadUsers();
        
        // חיפוש המשתמש (לא בודקים סיסמה עדיין)
        const userIndex = users.findIndex(u => u.username === username);
        const user = users[userIndex];

        if (!user) {
            alert("שם משתמש או סיסמה שגויים"); // הודעה כללית לאבטחה
            return;
        }

        // 1. בדיקה אם המשתמש חסום
        if (user.blockedUntil && new Date(user.blockedUntil) > new Date()) {
            const remainingTime = Math.ceil((new Date(user.blockedUntil) - new Date()) / 1000);
            alert(`החשבון חסום עקב ריבוי ניסיונות. נסה שוב בעוד ${remainingTime} שניות.`);
            return;
        }

        // 2. בדיקת סיסמה
        if (user.password === password) {
            // -- הצלחה --
            
            // איפוס ניסיונות כושלים וחסימות
            user.loginAttempts = 0;
            user.blockedUntil = null;
            saveUsers(users); // שמירת האיפוס

            performLogin(username);

        } else {
            // -- כישלון --
            
            user.loginAttempts = (user.loginAttempts || 0) + 1;
            
            // חסימה אחרי 3 ניסיונות
            if (user.loginAttempts >= 3) {
                // חסימה לדקה אחת (60000 מילישניות)
                user.blockedUntil = new Date(Date.now() + 60 * 1000).toISOString();
                user.loginAttempts = 0; // איפוס המונה כדי שיתחיל מחדש אחרי החסימה
                alert("סיסמה שגויה 3 פעמים. החשבון נחסם לדקה!");
            } else {
                alert(`סיסמה שגויה. נותרו לך ${3 - user.loginAttempts} ניסיונות לפני חסימה.`);
            }
            
            saveUsers(users); // שמירת המונה המעודכן
        }
    });
}

/* פונקציית עזר לביצוע הכניסה (משותפת להרשמה ולהתחברות) */
function performLogin(username) {
    setCurrentUser(username); // מ-storage.js

    // --- דרישת Session Timeout ---
    // שמירת זמן היצירה של ה-Session (עכשיו)
    // נגדיר תוקף של 20 דקות
    const sessionData = {
        user: username,
        expiry: new Date(Date.now() + 20 * 60 * 1000).toISOString() // 20 דקות מעכשיו
    };
    localStorage.setItem("session", JSON.stringify(sessionData));

    // אפקטים ומעבר עמוד
    if (typeof launchConfetti === "function") launchConfetti();
    
    setTimeout(() => {
        // אם אנחנו בתיקיית auth (כמו login.html), צריך לצאת החוצה ואז ל-pages
        // אם אנחנו ב-index.html, הנתיב שונה. נניח שאנחנו ב-auth:
        location.href = "../pages/games.html"; 
    }, 1500);
}