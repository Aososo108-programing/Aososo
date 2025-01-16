// Firebaseの設定
const firebaseConfig = {
    apiKey: "AIzaSyC6wfdNTjSEzxbaa25OsSNI0pttUL81A4U",
    authDomain: "aososo-6cb52.firebaseapp.com",
    databaseURL: "https://aososo-6cb52-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "aososo-6cb52",
    storageBucket: "aososo-6cb52.firebasestorage.app",
    messagingSenderId: "13878478089",
    appId: "1:13878478089:web:92108377595e94ad64ffd8",
};

// Firebaseを初期化
const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// ゲームの状態管理
let playerNickname = "";
let opponentNickname = "";
let gameRef;

let isReady = false;
let opponentReady = false;
let playerScore = 0;
let opponentScore = 0;
let wordToType = "";
let wordCount = 0;
let timerInterval;

// 単語リスト
const words = ["apple", "banana", "carrot", "potato", "onion", "tomato", "knife", "spoon", "bottle", "pencil", "eraser"];

// ページの読み込みが完了したら実行
document.addEventListener("DOMContentLoaded", () => {
    const startButton = document.getElementById("start-btn");
    const readyButton = document.getElementById("ready-btn");
    const nicknameInput = document.getElementById("nickname");
    const matchingStatus = document.getElementById("matching-status");
    const typingWord = document.getElementById("typing-word");
    const playerInput = document.getElementById("player-input");
    const scoreDisplay = document.getElementById("score");

    startButton.addEventListener("click", () => {
        playerNickname = nicknameInput.value.trim();

        if (!playerNickname) {
            alert("ニックネームを入力してください！");
            return;
        }

        matchingStatus.textContent = "対戦相手を探しています...";
        startMatching(matchingStatus, readyButton);
    });

    readyButton.addEventListener("click", () => {
        if (gameRef) {
            isReady = true;
            gameRef.update({ [`${playerNickname}_ready`]: true });
            readyButton.disabled = true;
            matchingStatus.textContent = "準備完了！相手を待っています...";
        }
    });

    playerInput.addEventListener("input", () => {
        if (playerInput.value.trim() === wordToType) {
            playerScore++;
            scoreDisplay.textContent = playerScore;
            playerInput.value = "";
            wordToType = generateRandomWord();
            typingWord.textContent = `次の単語: ${wordToType}`;
        }
    });
});

// マッチング処理
function startMatching(matchingStatus, readyButton) {
    gameRef = database.ref("games/" + playerNickname);

    gameRef.set({
        player1: playerNickname,
        player2: "waiting",
        gameStarted: false,
        [`${playerNickname}_ready`]: false,
        [`opponent_ready`]: false,
        [`${playerNickname}_score`]: 0,
        [`opponent_score`]: 0,
    });

    gameRef.on("value", (snapshot) => {
        const gameData = snapshot.val();

        if (gameData) {
            if (gameData.player2 !== "waiting" && gameData.player2 !== playerNickname) {
                opponentNickname = gameData.player2;
                matchingStatus.textContent = `${opponentNickname}さんとマッチングしました！`;
                readyButton.style.display = "inline-block";
            }

            // 両者が準備完了の場合、ゲームを開始
            if (gameData[`${playerNickname}_ready`] && gameData[`${opponentNickname}_ready`] && !gameData.gameStarted) {
                gameRef.update({ gameStarted: true });
            }

            if (gameData.gameStarted) {
                startGame(gameData);
            }
        }
    });
}

// ゲーム開始
function startGame(gameData) {
    document.getElementById("game-area").style.display = "block";
    document.getElementById("player-input").disabled = false;
    wordToType = generateRandomWord();
    document.getElementById("typing-word").textContent = `次の単語: ${wordToType}`;
    startTimer(30); // 30秒のタイマーを開始
}

// タイマー開始
function startTimer(seconds) {
    const timerDisplay = document.getElementById("timer");
    timerDisplay.textContent = `残り時間: ${seconds}秒`;

    timerInterval = setInterval(() => {
        seconds--;
        timerDisplay.textContent = `残り時間: ${seconds}秒`;

        if (seconds <= 0) {
            clearInterval(timerInterval);
            endGame();
        }
    }, 1000);
}

// ゲーム終了
function endGame() {
    document.getElementById("player-input").disabled = true;

    gameRef.once("value").then((snapshot) => {
        const gameData = snapshot.val();
        const player1Score = gameData[`${playerNickname}_score`] || playerScore;
        const player2Score = gameData[`${opponentNickname}_score`] || opponentScore;

        if (player1Score > player2Score) {
            alert(`あなたは勝ちました！ (${player1Score} - ${player2Score})`);
        } else if (player1Score < player2Score) {
            alert(`あなたは負けました！ (${player1Score} - ${player2Score})`);
        } else {
            alert(`引き分けです！ (${player1Score} - ${player2Score})`);
        }

        resetGame();
    });
}

// リセット処理
function resetGame() {
    gameRef.update({
        gameStarted: false,
        [`${playerNickname}_ready`]: false,
        [`${opponentNickname}_ready`]: false,
        [`${playerNickname}_score`]: 0,
        [`${opponentNickname}_score`]: 0,
    });
}

// ランダムな単語を生成
function generateRandomWord() {
    const randomIndex = Math.floor(Math.random() * words.length);
    return words[randomIndex];
}
