/* js/confetti.js */

// Load the confetti library if it is not already loaded
(function loadConfettiLibrary() {
    if (typeof confetti === "undefined") {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js";
        script.onload = () => console.log("🎉 Confetti library loaded");
        document.head.appendChild(script);
    }
})();

function launchConfetti() {

    // Play login success sound
    const sound = new Audio("../sounds/login.mp3");
    sound.volume = 0.7;
    sound.play();

    const duration = 2000; // effect duration in milliseconds
    const endTime = Date.now() + duration;

    (function frame() {
        // Left side burst
        confetti({
            particleCount: 18,
            angle: 60,
            spread: 90,
            origin: { x: 0 },
            colors: ["#00e5ff", "#6a5cff", "#9b5cff", "#ffffff"],
            scalar: 1.3
        });

        // Right side burst
        confetti({
            particleCount: 18,
            angle: 120,
            spread: 90,
            origin: { x: 1 },
            colors: ["#00e5ff", "#6a5cff", "#9b5cff", "#ffffff"],
            scalar: 1.3
        });

        // Continue animation until duration ends
        if (Date.now() < endTime) {
            requestAnimationFrame(frame);
        }
    })();
}
