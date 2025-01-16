// FirebaseのSDKをインポート
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js';
import { getDatabase, ref, set, onValue } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js';

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
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// ゲームの状態管理
let gameStarted = false;
let remainingTime = 30;
let yourScore = 0;
let opponentScore = 0;
let playerNickname;
let gameRef;
let playerRef;
let opponentNickname = "";

// マッチング開始
function startMatching() {
    // ニックネームを取得
    playerNickname = document.getElementById('nickname').value;

    if (!playerNickname) {
        alert("ニックネームを入力してください！");
        return;
    }

    // Firebaseにマッチング情報を送信
    gameRef = ref(database, 'games/' + playerNickname);
    set(gameRef, {
        player1: "waiting",
        player2: "waiting"
    }).then(() => {
        console.log("マッチング情報が送信されました");
    }).catch((error) => {
        console.error("データ送信エラー:", error);
    });

    // マッチングの監視
    onValue(gameRef, (snapshot) => {
        const gameData = snapshot.val();
        if (gameData && gameData.player1 === "waiting") {
            set(gameRef, { player1: playerNickname });
        } else if (gameData && gameData.player2 === "waiting" && gameData.player1 !== playerNickname) {
            set(gameRef, { player2: playerNickname });
        } else if (gameData && gameData.player1 && gameData.player2 && gameData.player1 !== gameData.player2) {
            matchFound(gameData);
        }
    });
}

function matchFound(gameData) {
    opponentNickname = gameData.player1 === playerNickname ? gameData.player2 : gameData.player1;
    
    document.getElementById('matching-status').textContent = `${opponentNickname}さんとマッチングしました！`;
    document.getElementById('ready-btn').style.display = 'block';
}
