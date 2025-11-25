`use strict`
// Monolithic file here I come!

// This is what happens when I can't use TypeScript
/**
 * @type { CanvasRenderingContext2D }
 */
let gameCanvas;
let gameData;

/**
 * @type { number }
 */
let birdY = 325;

/**
 * @type { HTMLInputElement }
 */
let speedSlider;

/**
 * @type { HTMLSelectElement }
 */
let playerSpriteDropdown;

/**
 * @type { HTMLSelectElement }
 */
let backgroundDropdown;

/**
 * @type { HTMLSelectElement }
 */
let pipeDropdown;

/** 
 * @param {MouseEvent} x
 */
function onBtnUnfocus(x) {
    x.currentTarget.blur();
}

function onLoad() {
    gameCanvas = document.getElementById('gameCanvas').getContext('2d');

    speedSlider = document.getElementById('speedSlider');
    playerSpriteDropdown = document.getElementById('playerSprite');
    backgroundDropdown = document.getElementById('bgSprite');
    pipeDropdown = document.getElementById('pipeSprite');

    if (document.cookie === '') {
        regenerateCookie()
    }
    else gameData = JSON.parse(document.cookie);

    document.getElementById('playBtn').addEventListener('mouseup', (e) => onBtnUnfocus(e));
    document.getElementById('playBtn').addEventListener('mouseleave', (e) => onBtnUnfocus(e));
    document.getElementById('resetBtn').addEventListener('mouseup', (e) => onBtnUnfocus(e));
    document.getElementById('resetBtn').addEventListener('mouseleave', (e) => onBtnUnfocus(e));

    speedSlider.addEventListener('change', (e) => {
        const newValue = e.currentTarget.value;
        console.log(newValue)
        gameData.speed = newValue;
        document.cookie = JSON.stringify(gameData);
        document.getElementById('speedText').innerHTML = `${speed}x`;
    });
    playerSpriteDropdown.addEventListener('change', (e) => {
        const newValue = e.currentTarget.value;
        gameData.selectedSprite = newValue;
        document.cookie = JSON.stringify(gameData);
    });
    backgroundDropdown.addEventListener('change', (e) => {
        const newValue = e.currentTarget.value;
        gameData.selectedBackground = newValue;
        document.cookie = JSON.stringify(gameData);
    });
    pipeDropdown.addEventListener('change', (e) => {
        const newValue = e.currentTarget.value;
        gameData.selectedPipe = newValue;
        document.cookie = JSON.stringify(gameData);
    })

    updateHighScoreTally();

    gameCanvas.canvas.addEventListener('mousedown', () => {
        birdY -= 45; // change as needed during testing
    });
}


function drawGame() {
    let gameHighScore = 0;

    const playerImg = new Image();
    // According to the mozilla developer documentation, gifs work on the 2d canvas
    playerImg.src = `../img/playerSprites/${gameData.selectedSprite}.gif`;

    const backgroundImg = new Image();
    backgroundImg.src = `../img/backgrounds/${gameData.selectedBackground}.png`;

    const pipeImgTop = new Image();
    pipeImgTop.src = `../img/pipeSprites/${gameData.selectedPipe}-top.png`;

    const pipeImgBottom = new Image();
    pipeImgBottom.src = `../img/pipeSprites/${gameData.selectedPipe}-bottom.png`;

    const w = gameCanvas.canvas.width;
    const h = gameCanvas.canvas.height;

    let pipeX = w;
    let pipeGap = 150;

    const gravity = 2;

    // Randomly generate coordinates then send to an array containing all pipe locations
    const pipeHeight = Math.floor(Math.random() * 250) + 50;

    // TODO: implement some sort of loop to prevent the game from stopping
    setInterval(() => {
        // Clear Screen
        gameCanvas.clearRect(0, 0, w, h);

        // Draw background
        gameCanvas.drawImage(backgroundImg, 0, 0, w, h);

        // Draw Top Pipe
        gameCanvas.drawImage(pipeImgTop, pipeX, pipeHeight - pipeImgTop.height);

        // Draw Bottom Pipe
        gameCanvas.drawImage(pipeImgBottom, pipeX, pipeHeight + pipeGap);

        // Draw Player
        gameCanvas.drawImage(playerImg, 50, birdY);

        // Apply gravity
        birdY += gravity; // TODO: instead of just subtracting height, implement something similar actual gravity
        // Move pipes toward player
        pipeX -= gameData.speed * 2;

        // Check if any collision has occured


    }, 1000 / (60 * gameData.speed)); // at 1.00, game runs at 60 refreshes per second. slower or faster speeds can be dialed in by setting the game speed. For example, if you set the speed to 0.5, the game will now refresh at 30FPS

    // At this point, the player has crashed
    // Clear screen, save high score and exit
    console.log("Crashed!");
    gameCanvas.clearRect(0, 0, gameCanvas.canvas.width, gameCanvas.canvas.height);
    gameData.highScore = gameHighScore;
    document.cookie = JSON.stringify(gameData);
    updateHighScoreTally();
}

function updateHighScoreTally() {
    document.getElementById('highScoreTally').innerHTML = `High Score: ${new Intl.NumberFormat().format(gameData.highScore)}`;
}

function regenerateCookie() {
    const cookie = {
        highScore: 0,
        selectedSprite: "flappybird",
        selectedBackground: "regularday",
        selectedPipe: "regulargreen",
        speed: 1.00
    };

    gameData = cookie;
    document.cookie = JSON.stringify(cookie);
}

function resetData() {
    regenerateCookie();
    location.reload();
}

function resetGame() {
    // Pure genius
    location.reload();
}

/**
 * @returns { boolean }
 */
function hasCollided() {
    // Implement collision checks (collided with pipe, collided with ceiling/ground (top/bottom of canvas respectively))
}
