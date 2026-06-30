const choices = {
  rock: '✊',
  paper: '🖐️',
  scissors: '✌️'
};

const beats = {
    rock: 'scissors',
    paper: 'rock',
    scissors: 'paper'
};

const duration = 120;
const earnings_per_win = 50;

let state = {
    score: 0,
    earnings: 0,
    timeLeft: duration,
    running: false,
    locked: false,
};

let timerInterval = null;

const scoreDisplay = document.getElementById('score-display');
const earningsDisplay = document.getElementById('earnings-display');
const timerDisplay = document.getElementById('timer-display');
const timerPill = document.getElementById('timer-pill');
const playerIcon = document.getElementById('player-icon');
const computerIcon = document.getElementById('computer-icon');
const resultBanner = document.getElementById('result-banner');
const resultText = document.getElementById('result-text');
const resultSub = document.getElementById('result-sub');
const modalOverlay = document.getElementById('modal-overlay');
const modalEmoji = document.getElementById('modal-emoji');
const modalTitle = document.getElementById('modal-title');
const modalEarnings = document.getElementById('modal-earnings');
const modalScoreLine = document.getElementById('modal-score-line');
const arena = document.getElementById('arena');
const playAgainBtn = document.getElementById('play-again-btn');
const startBtn = document.getElementById('start-btn');
const choiceBtns = document.querySelectorAll('.choice-btn');

const getComputerChoice = () => {
    const options = Object.keys(choices);
    return options[Math.floor(Math.random() * 3)];
};

function formatTimer(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

function determineResult(playerChoice, computerChoice) {
    if (playerChoice === computerChoice) { return 'draw'; }
    if (beats[playerChoice] === computerChoice) {return 'win'; }
    return 'lose';
}

function spawnText(text, color) {
    const label = document.createElement('div');
    const arenaRect = arena.getBoundingClientRect();
    label.className = 'float-label';
    label.textContent = text;
    label.style.color = color;
    label.style.left = `${arenaRect.width / 2}px`;
    label.style.top = `${arenaRect.height * 0.2}px`;
    arena.appendChild(label);
    label.addEventListener('animationend', () => label.remove());
}

function updateScoreDisplay() {
    scoreDisplay.textContent = state.score;
    scoreDisplay.classList.remove('bump');
    void scoreDisplay.offsetWidth;
    scoreDisplay.classList.add('bump');
}

function updateEarningsDisplay() {
    earningsDisplay.textContent = `$${Math.max(0, state.earnings)}`;
}

function updateTimerDisplay() {
    timerDisplay.textContent = formatTimer(state.timeLeft);
    if(state.timeLeft <= 10) {
        timerPill.classList.add('urgent');
    }else {
        timerPill.classList.remove('urgent');
    }
}

function startGame() {
    state = {
        score: 0,
        earnings: 0,
        timeLeft: duration,
        running: true,
        locked: false
    };
    updateScoreDisplay();
    updateEarningsDisplay();
    updateTimerDisplay();

    playerIcon.textContent = '❓';
    computerIcon.textContent = '❓';
    playerIcon.classList.remove('reveal', 'shaking');
    computerIcon.classList.remove('reveal', 'shaking');
    resultBanner.className = 'result-banner';
    startBtn.disabled = true;

    choiceBtns.forEach(btn => {
        btn.disabled = false;
        btn.classList.remove('picked');
    });

    timerInterval = setInterval(() => {
        state.timeLeft--;
        updateTimerDisplay();
        if (state.timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

function playRound(playerChoice) {
    if (!state.running || state.locked) return;
    state.locked = true;

    const computerChoice = getComputerChoice();

    playerIcon.textContent = '✊';
    computerIcon.textContent = '✊';
    playerIcon.classList.add('shaking');
    computerIcon.classList.add('shaking');
    resultBanner.className = 'result-banner';

    choiceBtns.forEach(btn => {
        btn.classList.toggle('picked', btn.dataset.choice === playerChoice);
        btn.disabled = true;
    });

    setTimeout(() => {
        playerIcon.classList.remove('shaking');
        computerIcon.classList.remove('shaking');

        playerIcon.textContent = choices[playerChoice];
        computerIcon.textContent = choices[computerChoice];

        playerIcon.classList.remove('reveal');
        computerIcon.classList.remove('reveal');
        void playerIcon.offsetWidth;
        playerIcon.classList.add('reveal');
        computerIcon.classList.add('reveal');

        setTimeout(() => {
            const result = determineResult(playerChoice, computerChoice);
            showResult(result, playerChoice, computerChoice);
            updateScore(result);

            setTimeout(() => {
                resultBanner.className = 'result-banner';
                choiceBtns.forEach(btn => {
                    btn.classList.remove('picked');
                    if (state.running) btn.disabled = false;
                });
                state.locked = false;
            }, 800);
        }, 400);
    }, 600);
}

function showResult(result, playerChoice, computerChoice) {
    resultBanner.className = `result-banner ${result} show`;
    if(result === 'win') {
        resultText.textContent = '🎉 YOU WIN!';
        resultSub.textContent = `${choices[playerChoice]} beats ${choices[computerChoice]}`;
        spawnText('$50', '#10B981');
    }else if (result === 'lose') {
        resultText.textContent = '💀 YOU LOSE';
        resultSub.textContent = `${choices[computerChoice]} beats ${choices[playerChoice]}`;
        spawnText('-1 point', '#EF4444')
    }else {
        resultText.textContent = '🤝 DRAW';
        resultSub.textContent = `Both played ${choices[playerChoice]}`;
    }
}

function updateScore(result) {
    if(result === 'win') {
        state.score++;
        state.earnings += earnings_per_win;
    }else if(result === 'lose') {
        state.score--;
        state.earnings -= earnings_per_win;
    }
    updateScoreDisplay();
    updateEarningsDisplay();
}

function endGame() {
    clearInterval(timerInterval);
    state.running = false;
    choiceBtns.forEach(btn => btn.disabled = true);
    startBtn.disabled = false;
    setTimeout(showModal, 600);
}

function showModal() {
    const finalEarnings = Math.max(0, state.earnings)

    if(state.score >= 5){
        modalEmoji.textContent = '🏆';
        modalTitle.textContent = 'Champion!';
    }else if (state.score > 0) {
        modalEmoji.textContent = '🎉';
        modalTitle.textContent = 'Nice Work!';
    }else if (state.score === 0) {
        modalEmoji.textContent = '😐';
        modalTitle.textContent = 'Better Luck Next Time!';
    }else {
        modalEmoji.textContent = '💸';
        modalTitle.textContent = 'Yikes!';
    }

    modalEarnings.textContent = `$${finalEarnings}`;
    modalScoreLine.textContent = `Final Score: ${state.score} points${state.score != 1 ? 's' : ''}`;
    modalOverlay.classList.add('show');
}

function hideModal() {
    modalOverlay.classList.remove('show');
}

startBtn.addEventListener('click', startGame);
playAgainBtn.addEventListener('click', () => {
    hideModal();
    setTimeout(startGame, 300);
});
choiceBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        playRound(btn.dataset.choice);
    });
});