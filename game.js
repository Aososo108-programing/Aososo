// Firebaseの設定
const firebaseConfig = {
    apiKey: "AIzaSy...YourAPIKeyHere...",
    authDomain: "aososo-6cb52.firebaseapp.com",
    databaseURL: "https://aososo-6cb52-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "aososo-6cb52",
    storageBucket: "aososo-6cb52.firebasestorage.app",
    messagingSenderId: "13878478089",
    appId: "1:13878478089:web:92108377595e94ad64ffd8",
};

// Firebase初期化
const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// グローバル変数
let playerNickname = "";
let opponentNickname = "";
let gameRef = null;
let gameWords = ["キャベツ", "トマト", "ナス", "カメラ", "ノート", "ペン"];
let currentWord = "";
let timerInterval;

// DOM要素取得
const nicknameInput = document.getElementById("nickname-input");
const startButton = document.getElementById("start-btn");
const readyButton = document.getElementById("ready-btn");
const matchingStatus = document.getElementById("matching-status");
const gameArea = document.getElementById("game-area");
const currentWordDisplay = document.getElementById("current-word");
const typingInput = document.getElementById("typing-input");
const timeLeftDisplay = document.getElementById("time-left");
const resultArea = document.getElementById("result-area");
const resultMessage = document.getElementById("result-message");

// イベントリスナー
startButton.addEventListener("click", startMatching);
readyButton.addEventListener("click", markReady);

// ゲームのマッチング処理
function startMatching() {
    playerNickname = nicknameInput.value.trim();

    if (!playerNickname) {
        alert("ニックネームを入力してください！");
        return;
    }

    matchingStatus.textContent = "マッチング中...";
    gameRef = database.ref("games/" + playerNickname);

    gameRef.set({
        player1: playerNickname,
        player2: "waiting",
        player1Ready: false,
        player2Ready: false,
        gameStarted: false,
    }).then(() => {
        matchingStatus.textContent = "対戦相手を待っています...";
    });

    gameRef.on("value", (snapshot) => {
        const gameData = snapshot.val();

        if (!gameData) return;

        if (gameData.player2 !== "waiting" && !opponentNickname) {
            opponentNickname = gameData.player2;
            matchingStatus.textContent = `${opponentNickname}さんとマッチングしました！`;
            readyButton.style.display = "inline-block";
        }

        if (gameData.player1Ready && gameData.player2Ready && !gameData.gameStarted) {
            gameRef.update({ gameStarted: true });
        }

        if (gameData.gameStarted) {
            startGame();
        }
    });
}

// 準備完了ボタン処理
function markReady() {
    if (!gameRef) return;

    const readyField = playerNickname === opponentNickname ? "player1Ready" : "player2Ready";
    gameRef.update({ [readyField]: true }).then(() => {
        matchingStatus.textContent = "準備完了！ゲーム開始を待っています...";
        readyButton.disabled = true;
    });
}

// ゲーム開始処理
function startGame() {
    gameArea.style.display = "block";
    matchingStatus.style.display = "none";
    readyButton.style.display = "none";

    startTimer(30);
    showNextWord();
}

// 単語表示と入力監視
function showNextWord() {
    currentWord = gameWords[Math.floor(Math.random() * gameWords.length)];
    currentWordDisplay.textContent = currentWord;
    typingInput.value = "";

    typingInput.addEventListener("input", checkInput);
}

// 入力チェック
function checkInput() {
    if (typingInput.value.trim() === currentWord) {
        showNextWord();
    }
}

// タイマー処理
function startTimer(seconds) {
    let timeLeft = seconds;
    timeLeftDisplay.textContent = timeLeft;

    timerInterval = setInterval(() => {
        timeLeft--;
        timeLeftDisplay.textContent = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            endGame();
        }
    }, 1000);
}

// ゲーム終了処理
function endGame() {
    gameArea.style.display = "none";
    resultArea.style.display = "block";
    resultMessage.textContent = "ゲーム終了！";
}
