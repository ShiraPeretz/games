// טוען את הספרייה אם עוד לא נטענה
(function loadConfetti() {
    if (typeof confetti === "undefined") {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js";
        script.onload = () => console.log("🎉 Confetti loaded");
        document.head.appendChild(script);
    }
})();

function launchConfetti() {

    const sound = new Audio("../sounds/login.mp3");
    sound.volume = 0.7;
    sound.play();

    const duration = 2000;
    const end = Date.now() + duration;

    (function frame() {
        confetti({
            particleCount: 18,
            angle: 60,
            spread: 90,
            origin: { x: 0 },
            colors: ["#00e5ff", "#6a5cff", "#9b5cff", "#ffffff"],
            scalar: 1.3
        });

        confetti({
            particleCount: 18,
            angle: 120,
            spread: 90,
            origin: { x: 1 },
            colors: ["#00e5ff", "#6a5cff", "#9b5cff", "#ffffff"],
            scalar: 1.3
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    })();
}
