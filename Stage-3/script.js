const runes = document.querySelectorAll('.rune-tile');
const startBtn = document.getElementById('start-btn');
const statusText = document.getElementById('status-text');
const scoreDisplay = document.getElementById('score');
const gameInterface = document.getElementById('game-interface');

let sequence = [];
let playerSequence = [];
let level = 0;
let isPlaying = false;
const WIN_CONDITION = 6; // The quest finishes after 6 successful oaths

function flashRune(rune) {
    rune.classList.add('active');
    setTimeout(() => rune.classList.remove('active'), 350);
}

async function playRound() {
    isPlaying = false;
    playerSequence = [];
    level++;
    scoreDisplay.innerText = level;
    statusText.innerText = `Oath ${level} of ${WIN_CONDITION}: Watch the Divine Light...`;

    const nextRune = Math.floor(Math.random() * 4);
    sequence.push(nextRune);

    for (let i = 0; i < sequence.length; i++) {
        await new Promise(res => setTimeout(res, 600));
        flashRune(runes[sequence[i]]);
    }
    
    statusText.innerText = "Repeat the Oath, Initiate!";
    isPlaying = true;
}

runes.forEach((rune, index) => {
    rune.addEventListener('click', () => {
        if (!isPlaying) return;
        flashRune(rune);
        playerSequence.push(index);
        checkSequence(playerSequence.length - 1);
    });
});

function checkSequence(currentIndex) {
    if (playerSequence[currentIndex] !== sequence[currentIndex]) {
        statusText.innerText = "You have strayed from the path! RESETTING.";
        gameInterface.classList.add('incorrect');
        
        sequence = [];
        level = 0;
        isPlaying = false;
        startBtn.querySelector('span').innerText = "ACTIVATE";
        setTimeout(() => gameInterface.classList.remove('incorrect'), 600);
        return;
    }

    if (playerSequence.length === sequence.length) {
        // Check if the Paladin has completed the final oath
        if (level === WIN_CONDITION) {
            handleVictory();
        } else {
            statusText.innerText = "Virtue Confirmed! Deepen your devotion.";
            gameInterface.classList.add('correct');
            setTimeout(() => {
                gameInterface.classList.remove('correct');
                playRound();
            }, 1100);
        }
    }
}

function handleVictory() {
    isPlaying = false;
    statusText.innerText = "The Trial is Complete. You are a True Paladin!";
    gameInterface.classList.add('correct');
    startBtn.querySelector('span').innerText = "ASCENDED";
    startBtn.style.background = "radial-gradient(circle, #fff 0%, #ffd700 100%)";
    startBtn.style.boxShadow = "0 0 50px #ffd700";
    
    // Disable clicks on runes after victory
    runes.forEach(rune => rune.style.pointerEvents = 'none');
}

startBtn.addEventListener('click', () => {
    if (sequence.length === 0 && level < WIN_CONDITION) {
        startBtn.querySelector('span').innerText = "CHANNEL";
        playRound();
    }
});
