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

const playerDown = new Image();
const playerUp = new Image();
const playerMiddle = new Image();

const backgroundImg = new Image();
const pipeImg = new Image();

let crashed = false;
let playing = false;
let gameScore = 0;


const pipes = [];
const pipeGap = 120;
const gravity = 2.5;
let gameTime = 0;

/** 
 * @param {MouseEvent} x
 */
function onBtnUnfocus(x) {
    x.currentTarget.blur();
}

function onLoad() {
    gameCanvas = document.getElementById('gameCanvas').getContext('2d');

    playerSpriteDropdown = document.getElementById('playerSprite');
    backgroundDropdown = document.getElementById('bgSprite');
    pipeDropdown = document.getElementById('pipeSprite');
    bgmPlayer = document.getElementById('bgmPlayer');

    if (document.cookie === '') regenerateCookie()
    else gameData = JSON.parse(document.cookie);

    playerSpriteDropdown.value = gameData.selectedSprite;
    backgroundDropdown.value = gameData.selectedBackground;
    pipeDropdown.value = gameData.selectedPipe;

    document.getElementById('playBtn').addEventListener('mouseup', (e) => onBtnUnfocus(e));
    document.getElementById('playBtn').addEventListener('mouseleave', (e) => onBtnUnfocus(e));
    document.getElementById('resetBtn').addEventListener('mouseup', (e) => onBtnUnfocus(e));
    document.getElementById('resetBtn').addEventListener('mouseleave', (e) => onBtnUnfocus(e));


    playerSpriteDropdown.addEventListener('change', (e) => {
        const newValue = e.currentTarget.value;
        gameData.selectedSprite = newValue;
        document.cookie = JSON.stringify(gameData);
        location.reload // Reload page to get latest data
    });
    backgroundDropdown.addEventListener('change', (e) => {
        const newValue = e.currentTarget.value;
        gameData.selectedBackground = newValue;
        document.cookie = JSON.stringify(gameData);
        location.reload // Reload page to get latest data
    });
    pipeDropdown.addEventListener('change', (e) => {
        const newValue = e.currentTarget.value;
        gameData.selectedPipe = newValue;
        document.cookie = JSON.stringify(gameData);
        location.reload // Reload page to get latest data
    })

    updateHighScoreTally();

    gameCanvas.canvas.addEventListener('mousedown', () => {
        birdY -= 40; // change as needed during testing
        if (playing) playSoundEffect("audio_wing.wav");
    });

    playerUp.src = `../img/playerSprites/${gameData.selectedSprite}-up.png`
    playerMiddle.src = `../img/playerSprites/${gameData.selectedSprite}-middle.png`;
    playerDown.src = `../img/playerSprites/${gameData.selectedSprite}-down.png`

    backgroundImg.src = `../img/backgrounds/${gameData.selectedBackground}.png`;
    pipeImg.src = `../img/pipeSprites/${gameData.selectedPipe}.png`;
}

function startGame() {
    if (playing) return; // A game is already in progress
    gameScore = 0;
    gameTime = 0;
    crashed = false;
    playing = true;
    birdY = gameCanvas.canvas.height / 2;

    requestAnimationFrame(renderGameFrame);
}

function renderGameFrame() {
    if (crashed) {
        requestAnimationFrame(endGame);
        return;
    }

    // Clear Screen
    gameCanvas.clearRect(0, 0, gameCanvas.canvas.width, gameCanvas.canvas.height);

    // Draw background
    gameCanvas.drawImage(backgroundImg, 0, 0, gameCanvas.canvas.width, gameCanvas.canvas.height);

    let cyclePlayerImg;
    const frame = gameTime % 170; // 240 for 4 cycles, 60 frames apart
    if(frame < 30) {
        cyclePlayerImg = playerDown;
    }
    else if(frame < 60) {
        cyclePlayerImg = playerMiddle;
    }
    else if(frame < 85) {
        cyclePlayerImg = playerUp;
    }
    else {
        cyclePlayerImg = playerDown;
    }

    gameCanvas.drawImage(cyclePlayerImg, 50, birdY);

    if (gameTime % 150 === 0) {

        // This is a mish-mash of legacy code and fresh code. It just works
        pipes.push({
            hPos: gameCanvas.canvas.width,
            height: Math.floor(Math.random() * (gameCanvas.canvas.height - pipeGap - 100)) + 50, // min 100 up for bottom pipe, min 50 down for top pipe
            scoredPoint: false
        });
    }
    // Generate a new random pipe
    for (let i = 0; i < pipes.length; i++) {
        const p = pipes[i];

        gameCanvas.drawImage(pipeImg, p.hPos, p.height - 640); // 640 being the height of the pipe
        gameCanvas.drawImage(pipeImg, p.hPos, p.height + pipeGap);
    }

    // Apply gravity
    birdY += gravity;

    // Move pipes toward player
    for (let i = 0; i < pipes.length; i++) {
        pipes[i].hPos -= gameData.speed * 2;
        if (pipes[i].hPos <= -50) {
            // Stop rendering pipes that are offscreen to save on memory
            pipes.splice(i, 1);
            pipes.sort();
        }
    }

    // Check if any collision has occured
    // These are the bounds of the player sprite
    const spriteLeft = 50; // Always starts 50px off from the left
    const spriteRight = 104; // Sprite is 54 pixels long. I can directly assign a value here because the x coordinates don't change

    const spriteTop = birdY; // Top of the bird
    const spriteBottom = birdY + 40 // Sprite is 40 pixels tall;  

    if (birdY <= 10 || birdY >= gameCanvas.canvas.height - 50) {
        // Game over
        crashed = true;
    }

    // Computationally expensive and unecessary to check all pipes when only one pipe can be colliding with the player at any given time, so we reference index 0
    const pipeLeft = pipes[0].hPos; // Left-hand side of a pipe
    const pipeRight = pipes[0].hPos + 52; // Width of a pipe is 52 pixels

    // "Safe" y-coordinates to be between when x coordinates overlap with a pipe 
    const gapTop = pipes[0].height;
    const gapBottom = pipes[0].height + pipeGap;

    if (spriteRight > pipeLeft && spriteLeft < pipeRight) {
        if (spriteTop < gapTop || spriteBottom > gapBottom) {
            crashed = true;
        }
    }
    else {
        if(!pipes[0].scoredPoint && spriteRight > pipeLeft + 26) {
            pipes[0].scoredPoint = true
            gameScore += 150;
            document.getElementById("currentScoreTally").innerHTML = `Score: ${gameScore}`
            playSoundEffect("audio_point.wav");
        }
    }

    gameTime += 1;
    requestAnimationFrame(renderGameFrame);
}

function endGame() {
    playing = false
    playSoundEffect("audio_die.wav");
    alert(`You Crashed! Your high score: ${Math.round(gameScore)}`);
    gameCanvas.clearRect(0, 0, gameCanvas.canvas.width, gameCanvas.canvas.height);
    gameData.highScore = Math.round(gameScore);
    document.cookie = JSON.stringify(gameData);
    pipes.splice(0, pipes.length); // Remove all indicies in the pipe array to prevent them from re-rendering in scenarios where multiple playthroughs are done in one session
    document.getElementById("currentScoreTally").innerHTML = 'Score: 0'
    updateHighScoreTally();
}

function updateHighScoreTally() {
    document.getElementById('highScoreTally').innerHTML = `High Score: ${new Intl.NumberFormat().format(gameData.highScore)}`;
}

function regenerateCookie() {
    const cookie = {
        highScore: 0,
        selectedSprite: "yellowbird",
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
 * @param {string} audioName a file in the audio folder. If it doesn't exist, the script will do nothing. Include file extension
 */
function playSoundEffect(audioName) {
    // This is a much better alternative to a singular <audio> element on the html page at any time, which could cause issues with multiple sound effects
    // In this implementation, there can be a virtually unlimited amount of sound effects playing at the same time
    const audio = document.createElement('audio');
    audio.src = `../audio/${audioName}`;
    audio.autoplay = true;
    // Make the audio player invisible
    audio.style.display = 'none'
    // Add audio player to the body
    document.body.appendChild(audio);

    // Remove audio element after completed
    audio.addEventListener('ended', () => {
        audio.remove();
    });

    audio.play().catch((e) => {
        // Whatever the case, just don't play the sound effect;
        console.warn(`${audioName} failed to play: ${e}`)
        return;
    })
}
