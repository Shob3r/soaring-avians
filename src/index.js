// This is what happens when I can't use TypeScript

/**
 * @type { CanvasRenderingContext2D }
 */
let game;

let gameData;

/** 
 * @param {MouseEvent} x
 */
function onBtnUnfocus(x) {
    x.currentTarget.blur();
}

function onLoad() {
    console.log("Loaded!");
    game = document.getElementById('gameCanvas').getContext('2d');
    if(document.cookie === '') { 
        const initialCookie = {
            highScore: 0,
            selectedSprite: "bird",
            selectedBackground: "normal",
        }
        gameData = initialCookie;
        document.cookie = JSON.stringify(initialCookie);
    }
    else gameData = JSON.parse(document.cookie);

    document.getElementById('playBtn').addEventListener('mouseup', (e) => onBtnUnfocus(e));
    document.getElementById('playBtn').addEventListener('mouseleave', (e) => onBtnUnfocus(e));
    document.getElementById('resetBtn').addEventListener('mouseup', (e) => onBtnUnfocus(e));
    document.getElementById('resetBtn').addEventListener('mouseleave', (e) => onBtnUnfocus(e));

    document.getElementById('highScoreTally').innerHTML = `High Score: ${new Intl.NumberFormat().format(gameData.highScore)}`;
}

function drawMainMenu() {

}

function drawGame() {

}

function saveHighScore(newHs) {
    gameData.highScore = newHs;
    document.cookie = JSON.stringify(gameData); 
}
