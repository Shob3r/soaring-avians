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

const playerImg = new Image();
// According to the mozilla developer documentation, gifs work on the 2d canvas

const backgroundImg = new Image();

const pipeImgTop = new Image();

const pipeImgBottom = new Image();

let crashed = false;
let gameHighScore = 0;


const pipes = [];
const pipeGap = 150;
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

    speedSlider = document.getElementById('speedSlider');
    playerSpriteDropdown = document.getElementById('playerSprite');
    backgroundDropdown = document.getElementById('bgSprite');
    pipeDropdown = document.getElementById('pipeSprite');

    if (document.cookie === '') regenerateCookie()
    else gameData = JSON.parse(document.cookie);

    speedSlider.value = gameData.speed;
    playerSpriteDropdown.value = gameData.selectedSprite;
    backgroundDropdown.value = gameData.selectedBackground;
    pipeDropdown.value = gameData.selectedPipe;

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
        playSoundEffect("audio_wing.wav");
    });


    playerImg.src = `../img/playerSprites/${gameData.selectedSprite}.gif`;
    backgroundImg.src = `../img/backgrounds/${gameData.selectedBackground}.png`;
    pipeImgTop.src = `../img/pipeSprites/${gameData.selectedPipe}-top.png`;
    pipeImgBottom.src = `../img/pipeSprites/${gameData.selectedPipe}-bottom.png`;
}

function startGame() {
    gameHighScore = 0;
    gameTime = 0;
    crashed = false;
    birdY = gameCanvas.canvas.height / 2;

    requestAnimationFrame(renderGameFrame)
}

function renderGameFrame() {
    if (crashed) {
        requestAnimationFrame(endGame)
        return;
    }

    // Clear Screen
    gameCanvas.clearRect(0, 0, gameCanvas.canvas.width, gameCanvas.canvas.height);

    // Draw background
    gameCanvas.drawImage(backgroundImg, 0, 0, gameCanvas.canvas.width, gameCanvas.canvas.height);

    // Draw Player
    gameCanvas.drawImage(playerImg, 50, birdY);

    if (gameTime % 150 === 0) {
        pipes.push({
            hPos: gameCanvas.canvas.width,
            height: Math.floor(Math.random() * 250) + 50,
        });
    }
    // Generate a new random pipe
    for (let i = 0; i < pipes.length; i++) {
        gameCanvas.drawImage(pipeImgTop, pipes[i].hPos, pipes[i].height - pipeImgTop.height);
        gameCanvas.drawImage(pipeImgBottom, pipes[i].hPos, pipes[i].height + pipeGap)
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
    if (birdY <= 10 || birdY >= gameCanvas.canvas.height - 50) {
        // Game over
        crashed = true
    };
    gameHighScore += 0.1;
    if(gameTime % 60 / gameData.speed === 0) {
        gameHighScore += 10;
    }
    gameTime += 1;
    requestAnimationFrame(renderGameFrame);
}

function endGame() {
    console.log("Crashed!");
    playSoundEffect("audio_die.wav");
    alert(`You Crashed! Your high score: ${Math.round(gameHighScore)}`);
    gameCanvas.clearRect(0, 0, gameCanvas.canvas.width, gameCanvas.canvas.height);
    gameData.highScore = Math.round(gameHighScore);
    document.cookie = JSON.stringify(gameData);
    pipes.splice(0, pipes.length); // Remove all indicies in the pipe array to prevent them from re-rendering in scenarios where multiple playthroughs are done in one session
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
    document.body.appendChild(audio)

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
