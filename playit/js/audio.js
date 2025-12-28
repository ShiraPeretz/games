/********************************
 *  AUDIO / SOUND EFFECTS
 ********************************/

const SFX = {
    win: new Audio("../sounds/capaim.mp3"),
    lose: new Audio("../sounds/lose.mp3"),
    click: new Audio("../sounds/click.mp3")
};

// הגדרות כלליות
Object.values(SFX).forEach(a => {
    a.volume = 0.7;
    a.preload = "auto";
});

let audioUnlocked = false;

// פותח אודיו פעם אחת (חובה לדפדפן)
function unlockAudio() {
    if (audioUnlocked) return;
    audioUnlocked = true;

    const a = SFX.win;
    const oldVol = a.volume;
    a.volume = 0.01;

    a.play().then(() => {
        a.pause();
        a.currentTime = 0;
        a.volume = oldVol;
    }).catch(() => {});
}

// ניגון רגיל
function playSfx(type) {
    const audio = SFX[type];
    if (!audio) return;

    audio.currentTime = 0;
    audio.play().catch(() => {});
}
