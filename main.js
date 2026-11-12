const target = document.getElementById('target');
const scoreDisplay = document.getElementById('score');
const timeDisplay = document.getElementById('time');
const startBtn = document.getElementById('start-btn');
const gameArea = document.getElementById('game-area');

let score = 0;
let timeLeft = 10;
let gameActive = false;
let timer;

// Функция, которая двигает мишень в случайное место
function moveTarget() {
    const maxX = gameArea.clientWidth - 50;
    const maxY = gameArea.clientHeight - 50;
    const x = Math.floor(Math.random() * maxX);
    const y = Math.floor(Math.random() * maxY);
    target.style.left = x + 'px';
    target.style.top = y + 'px';
}

// Клик по мишени
target.addEventListener('click', () => {
    if (!gameActive) return;
    score++;
    scoreDisplay.innerText = score;
    moveTarget();
});

// Кнопка "Начать игру"
startBtn.addEventListener('click', () => {
    score = 0;
    timeLeft = 10;
    gameActive = true;
    scoreDisplay.innerText = score;
    timeDisplay.innerText = timeLeft;
    target.style.display = 'block';
    startBtn.disabled = true;
    
    moveTarget(); // Сразу двигаем мишень

    // Таймер
    timer = setInterval(() => {
        timeLeft--;
        timeDisplay.innerText = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timer);
            gameActive = false;
            target.style.display = 'none';
            startBtn.disabled = false;
            alert('Игра окончена! Твои очки: ' + score);
        }
    }, 1000);
});
