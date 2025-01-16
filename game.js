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

// ゲームデータ
let isReady = false;
let isOpponentReady = false;
let wordToType = "";
let playerScore = 0;

// ページの読み込みが完了したら実行
document.addEventListener("DOMContentLoaded", () => {
    const startButton = document.getElementById("start-btn");
    const readyButton = document.getElementById("ready-btn");
    const nicknameInput = document.getElementById("nickname");
    const matchingStatus = document.getElementById("matching-status");
    const typingWord = document.getElementById("typing-word");
    const playerInput = document.getElementById("player-input");
    const scoreDisplay = document.getElementById("score");

    // ゲーム開始ボタンのクリックイベント
    startButton.addEventListener("click", () => {
        playerNickname = nicknameInput.value.trim();

        if (!playerNickname) {
            alert("ニックネームを入力してください！");
            return;
        }

        matchingStatus.textContent = "対戦相手を探しています...";
        startMatching(matchingStatus, typingWord, scoreDisplay, playerInput);
    });

    // 準備完了ボタンのクリックイベント
    readyButton.addEventListener("click", () => {
        if (gameRef) {
            isReady = true;
            gameRef.update({ [`${playerNickname}_ready`]: true });
            readyButton.disabled = true;
        }
    });

    // プレイヤーの入力イベント
    playerInput.addEventListener("input", () => {
        if (playerInput.value.trim() === wordToType) {
            handlePlayerWin();
        }
    });
});

// マッチング処理（省略部分は先のコードを参照）

// ゲーム開始ロジック
function startGame(typingWord, scoreDisplay, playerInput) {
    wordToType = generateRandomWord();
    typingWord.textContent = `次の単語を入力してください: ${wordToType}`;
    playerInput.disabled = false;
    playerInput.value = "";
    playerInput.focus();
}

// ランダムな単語を生成
function generateRandomWord() {
    const words = ["apple", "banana", "cherry", "grape", "orange", "melon"];
    return words[Math.floor(Math.random() * words.length)];
}

// プレイヤーが勝利した際の処理
function handlePlayerWin() {
    playerScore++;
    gameRef.update({ winner: playerNickname, gameStarted: false });
    alert(`${playerNickname}の勝利！`);
    resetGame();
}

// ゲームリセット
function resetGame() {
    wordToType = "";
    document.getElementById("player-input").disabled = true;
    gameRef.update({
        gameStarted: false,
        [`${playerNickname}_ready`]: false,
        [`${opponentNickname}_ready`]: false,
    });
    document.getElementById("ready-btn").disabled = false;
}
