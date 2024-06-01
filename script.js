const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const tileSize = 25;
const maze = [
    "#######################",
    "#R.......#.......#....#",
    "#####.###.#.#####.#####",
    "#...#.....#.#.....#...#",
    "#.#.#.#####.###.#.####",
    "#.#...#.......#.#.....#",
    "#.#####.#####.#.#####.#",
    "#.......#.....#.......#",
    "#########.###.###.#####",
    "#.......#...#.......#.#",
    "#.###.#.###.#######.#.#",
    "#...#.#.....#.......#.#",
    "###.#.#####.#.#####.#.#",
    "#.#.#.......#.#.....#.#",
    "#.#.#########.#.#####.#",
    "#.#...........#.......#",
    "#######################"
];

const rabbitImg = new Image();
rabbitImg.src = 'rabbit.svg';

const pinxImg = new Image();
pinxImg.src = 'pinx.svg';

let rabbit = { x: 1, y: 1 };
let pinx = [
    { x: 5, y: 1, strategy: 'aggressive' },
    { x: 1, y: 5, strategy: 'ambush' },
    { x: 15, y: 1, strategy: 'patrol', patrolIndex: 0 },
    { x: 1, y: 15, strategy: 'random' }
];

const patrolPaths = [
    [{ x: 15, y: 1 }, { x: 15, y: 5 }, { x: 10, y: 5 }, { x: 10, y: 1 }],
    [{ x: 1, y: 15 }, { x: 5, y: 15 }, { x: 5, y: 10 }, { x: 1, y: 10 }]
];

function drawMaze() {
    for (let y = 0; y < maze.length; y++) {
        for (let x = 0; x < maze[y].length; x++) {
            if (maze[y][x] === '#') {
                ctx.fillStyle = 'black';
                ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
            } else {
                ctx.fillStyle = 'lightgrey';
                ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
            }
        }
    }
}

function drawCharacters() {
    ctx.drawImage(rabbitImg, rabbit.x * tileSize, rabbit.y * tileSize, tileSize, tileSize);
    pinx.forEach(p => {
        ctx.drawImage(pinxImg, p.x * tileSize, p.y * tileSize, tileSize, tileSize);
    });
}

function moveRabbit(dx, dy) {
    const newX = rabbit.x + dx;
    const newY = rabbit.y + dy;
    if (maze[newY][newX] !== '#') {
        rabbit.x = newX;
        rabbit.y = newY;
    }
}

document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowUp':
            moveRabbit(0, -1);
            break;
        case 'ArrowDown':
            moveRabbit(0, 1);
            break;
        case 'ArrowLeft':
            moveRabbit(-1, 0);
            break;
        case 'ArrowRight':
            moveRabbit(1, 0);
            break;
    }
    draw();
});

function movePinx() {
    pinx.forEach(p => {
        let dx = 0, dy = 0;
        if (p.strategy === 'aggressive') {
            if (rabbit.x > p.x) dx = 1;
            else if (rabbit.x < p.x) dx = -1;
            if (rabbit.y > p.y) dy = 1;
            else if (rabbit.y < p.y) dy = -1;
        } else if (p.strategy === 'ambush') {
            if (Math.abs(rabbit.x - p.x) > Math.abs(rabbit.y - p.y)) {
                dx = (rabbit.x > p.x) ? 1 : -1;
            } else {
                dy = (rabbit.y > p.y) ? 1 : -1;
            }
        } else if (p.strategy === 'patrol') {
            let path = patrolPaths[p.patrolIndex % patrolPaths.length];
            let target = path[Math.floor(p.patrolIndex / patrolPaths.length) % path.length];
            if (p.x === target.x && p.y === target.y) p.patrolIndex++;
            else {
                if (target.x > p.x) dx = 1;
                else if (target.x < p.x) dx = -1;
                if (target.y > p.y) dy = 1;
                else if (target.y < p.y) dy = -1;
            }
        } else if (p.strategy === 'random') {
            dx = Math.floor(Math.random() * 3) - 1;
            dy = Math.floor(Math.random() * 3) - 1;
        }
        const newX = p.x + dx;
        const newY = p.y + dy;
        if (maze[newY][newX] !== '#') {
            p.x = newX;
            p.y = newY;
        }
    });
}

function gameLoop() {
    movePinx();
    draw();
    requestAnimationFrame(gameLoop);
}

rabbitImg.onload = () => {
    pinxImg.onload = () => {
        draw();
        gameLoop();
    };
};
