// games/playit/js/level.js
    const username = getCurrentUser();
    if (!username) {
      location.href = "../auth/login.html";
    }

    // Build the map dynamically
    const levelsGrid = document.getElementById("levelsGrid");
    const progress = getUserProgress("trivia"); // New function from storage.js

    // Define level names (can add more)
    const levelNames = ["Beginners", "Advanced", "Experts", "Geniuses", "The Final Boss"];

    for (let i = 1; i <= 5; i++) {
      const isUnlocked = i <= progress.maxLevel;
      const stars = progress.levels[i] || 0;
      const starString = "⭐".repeat(stars) + "☆".repeat(3 - stars); // Always shows 3 stars

      const card = document.createElement("div");
      card.className = "level-card " + (isUnlocked ? "unlocked" : "locked");

      if (isUnlocked) {
        card.innerHTML =
          '<div class="level-num">' + i + '</div>' +
          '<div class="level-stars">' + starString + '</div>' +
          '<div class="level-title">' + levelNames[i - 1] + '</div>';

        card.onclick = function () {
          location.href = "trivia.html?level=" + i;
        };
      } else {
        card.innerHTML =
          '<div class="lock-icon">🔒</div>' +
          '<div class="level-title">Locked</div>';
      }

      levelsGrid.appendChild(card);
    }
  