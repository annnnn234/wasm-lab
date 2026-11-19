const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');

// Звезды на фоне
let stars = [];
for (let i = 0; i < 100; i++) {
    stars.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, speed: Math.random() * 3 + 1, size: Math.random() * 2 });
}

// Корабль
let player = { x: canvas.width / 2 - 15, y: canvas.height - 40, w: 30, h: 30, speed: 6 };
let bullets = [];
let enemies = [];
let particles = []; // Для взрывов

let score = 0;
let lives = 3;
let gameActive = true;
let canShoot = true;
let frameCount = 0;
let keys = {};

// Управление
document.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); shoot(); }
    keys[e.key] = true;
});
document.addEventListener('keyup', (e) => { keys[e.key] = false; });

function shoot() {
    if (!gameActive || !canShoot) return;
    bullets.push({ x: player.x + player.w / 2 - 2, y: player.y, w: 4, h: 15, speed: 8 });
    canShoot = false;
    setTimeout(() => canShoot = true, 200); // Задержка выстрела
}

// Взрыв (частицы)
function createExplosion(x, y) {
    for (let i = 0; i < 10; i++) {
        particles.push({
            x: x, y: y,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6,
            life: 1
        });
    }
}

function gameLoop() {
    update();
    draw();
    if (gameActive) requestAnimationFrame(gameLoop);
}

function update() {
    // Движение звезд
    stars.forEach(star => {
        star.y += star.speed;
        if (star.y > canvas.height) star.y = 0;
    });

    // Движение игрока
    if (keys['ArrowLeft'] && player.x > 0) player.x -= player.speed;
    if (keys['ArrowRight'] && player.x < canvas.width - player.w) player.x += player.speed;

    // Пули
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].y -= bullets[i].speed;
        if (bullets[i].y < 0) bullets.splice(i, 1);
    }

    // Враги
    frameCount++;
    // Спавн врагов (чем больше очков, тем чаще)
    let spawnRate = Math.max(20, 60 - Math.floor(score / 50));
    if (frameCount % spawnRate === 0) {
        enemies.push({ x: Math.random() * (canvas.width - 40) + 20, y: -20, r: 15, speed: 2 + Math.random() * 2 });
    }

    for (let i = enemies.length - 1; i >= 0; i--) {
        let e = enemies[i];
        e.y += e.speed;

        // Проверка попадания пули во врага
        for (let j = bullets.length - 1; j >= 0; j--) {
            let b = bullets[j];
            let dist = Math.hypot(b.x - e.x, b.y - e.y);
            if (dist < e.r + 5) {
                createExplosion(e.x, e.y);
                enemies.splice(i, 1);
                bullets.splice(j, 1);
                score += 10;
                scoreEl.innerText = score;
                break;
            }
        }

        // Враг задел корабль или пролетел мимо
        if (e && (e.y > canvas.height - 30 && e.x > player.x && e.x < player.x + player.w || e.y > canvas.height + 20)) {
            if (e.y > canvas.height - 30) {
                lives--;
                livesEl.innerText = lives;
                createExplosion(e.x, e.y);
                if (lives <= 0) gameActive = false;
            }
            enemies.splice(i, 1);
        }
    }

    // Частицы взрыва
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.vx; p.y += p.vy; p.life -= 0.05;
        if (p.life <= 0) particles.splice(i, 1);
    }
}

function draw() {
    // Черный фон с легким шлейфом для эффекта скорости
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Рисуем звезды
    ctx.fillStyle = 'white';
    stars.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    });

    if (!gameActive) {
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ff0055';
        ctx.font = '40px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 20);
        ctx.fillStyle = '#fff';
        ctx.font = '20px Courier New';
        ctx.fillText('Обнови страницу, чтобы играть снова', canvas.width / 2, canvas.height / 2 + 30);
        return;
    }

    // Рисуем игрока (Корабль)
    ctx.fillStyle = '#00ffff';
    ctx.beginPath();
    ctx.moveTo(player.x, player.y + player.h);
    ctx.lineTo(player.x + player.w, player.y + player.h);
    ctx.lineTo(player.x + player.w / 2, player.y);
    ctx.fill();

    // Рисуем пули (Лазеры)
    ctx.fillStyle = '#ffff00';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ffff00';
    bullets.forEach(b => ctx.fillRect(b.x, b.y, b.w, b.h));
    ctx.shadowBlur = 0; // Сброс тени

    // Рисуем врагов
    enemies.forEach(e => {
        ctx.fillStyle = '#ff0055';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ff0055';
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    });

    // Рисуем взрывы
    particles.forEach(p => {
        ctx.fillStyle = `rgba(255, ${Math.random() * 200}, 0, ${p.life})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
    });
}

gameLoop();
