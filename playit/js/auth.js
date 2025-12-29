/* js/auth.js */

/********************
 * REGISTER (Sign Up)
 ********************/
const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const users = loadUsers(); // function from storage.js
        const fullName = document.getElementById("fullName").value;
        const username = document.getElementById("username").value.trim();
        const email = document.getElementById("email").value.trim().toLowerCase();
        const password = document.getElementById("password").value;

        // Check if the username already exists
        if (users.find(u => u.username === username)) {
            alert("Username already exists");
            return;
        }

        const newUser = {
            fullName,
            username,
            email,
            password,
            createdAt: new Date().toISOString(),

            // Security fields
            loginAttempts: 0,
            blockedUntil: null,

            // Game data
            stats: {
                trivia: { plays: 0, bestScore: 0 },
                catcher: { plays: 0, bestScore: 0 }
            },
            totalPoints: 0,
            achievements: []
        };

        users.push(newUser);
        saveUsers(users);

        // Auto login after registration
        performLogin(username);
    });
}

/********************
 * LOGIN (Sign In)
 ********************/
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const username = document.getElementById("loginUsername").value.trim();
        const password = document.getElementById("loginPassword").value;
        const users = loadUsers();

        // Find the user (do not check password yet)
        const userIndex = users.findIndex(u => u.username === username);
        const user = users[userIndex];

        if (!user) {
            // Generic message for security
            alert("Username or password is incorrect");
            return;
        }

        // 1) Check if the account is currently blocked
        if (user.blockedUntil && new Date(user.blockedUntil) > new Date()) {
            const remainingTime = Math.ceil((new Date(user.blockedUntil) - new Date()) / 1000);
            alert(`Account blocked due to too many failed attempts. Try again in ${remainingTime} seconds.`);
            return;
        }

        // 2) Check password
        if (user.password === password) {
            // --- SUCCESS ---

            // Reset failed attempts and block status
            user.loginAttempts = 0;
            user.blockedUntil = null;
            saveUsers(users); // save the reset

            performLogin(username);

        } else {
            // --- FAILURE ---

            user.loginAttempts = (user.loginAttempts || 0) + 1;

            // Block after 3 attempts
            if (user.loginAttempts >= 3) {
                // Block for 1 minute (60,000 ms)
                user.blockedUntil = new Date(Date.now() + 60 * 1000).toISOString();
                user.loginAttempts = 0; // reset counter so it starts fresh after block
                alert("Wrong password 3 times. Account blocked for one minute!");
            } else {
                alert(`Wrong password. You have ${3 - user.loginAttempts} attempts left before being blocked.`);
            }
            saveUsers(users); // save updated counter/block
        }
    });
}

/* Helper function to log in (shared by registration and login) */
function performLogin(username) {
    setCurrentUser(username); // from storage.js

    // --- Session Timeout requirement ---
    // Save session creation time (now) and set expiry for 20 minutes
    const sessionData = {
        user: username,
        expiry: new Date(Date.now() + 20 * 60 * 1000).toISOString() // 20 minutes from now
    };
    localStorage.setItem("session", JSON.stringify(sessionData));
    // setSessionCookie(username, 20);

    // Effects and page redirect
    if (typeof launchConfetti === "function") launchConfetti();

    setTimeout(() => {
        // If we are inside /auth (like login.html), go up and then to /pages
        location.href = "../pages/games.html";
    }, 1500);
}
