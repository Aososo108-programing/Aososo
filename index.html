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
let gameStarted = false;
let remainingTime = 30;
let yourScore = 0;
let opponentScore = 0;
let playerNickname;
let gameRef;
let opponentNickname = "";

// マッチング開始
function startMatching() {
    playerNickname = document.getElementById('nickname').value;

    if (!playerNickname) {
        alert("ニックネームを入力してください！");
        return;
    }

    // ゲームのリファレンス作成
    gameRef = database.ref('games/' + playerNickname);
    gameRef.set({
        player1: "waiting",
        player2: "waiting"
    }).then(() => {
        console.log("[DEBUG] マッチング情報が送信されました");
    }).catch((error) => {
        console.error("[ERROR] データ送信エラー:", error);
    });

    // リアルタイムでゲームデータを監視
    gameRef.on('value', (snapshot) => {
        const gameData = snapshot.val();
        console.log("[DEBUG] 取得したゲームデータ:", gameData);

        if (gameData) {
            handleGameData(gameData);
        } else {
            console.log("[DEBUG] ゲームデータがありません");
        }
    });
}

function handleGameData(gameData) {
    console.log("[DEBUG] 現在のゲームデータ:", gameData);

    if (gameData.player1 === "waiting") {
        gameRef.update({ player1: playerNickname });
        console.log("[DEBUG] player1 に設定されました:", playerNickname);
    } else if (gameData.player2 === "waiting" && gameData.player1 !== playerNickname) {
        gameRef.update({ player2: playerNickname });
        console.log("[DEBUG] player2 に設定されました:", playerNickname);
    } else if (gameData.player1 && gameData.player2 && gameData.player1 !== gameData.player2) {
        matchFound(gameData);
    }
}

function matchFound(gameData) {
    // 対戦相手の名前を正しく取得
    opponentNickname = gameData.player1 === playerNickname 
        ? gameData.player2 
        : gameData.player1;

    // 対戦相手が"waiting"の場合のチェック
    if (!opponentNickname || opponentNickname === "waiting") {
        console.log("[DEBUG] 対戦相手を待っています...");
        document.getElementById("matching-status").textContent = `対戦相手を待っています...`;
        return;
    }

    console.log("[DEBUG] マッチング成功！対戦相手:", opponentNickname);

    // 正しい対戦相手名を表示
    document.getElementById("matching-status").textContent = `${opponentNickname}さんとマッチングしました！`;
    document.getElementById("ready-btn").style.display = "block";
}

// ゲーム開始ボタンのイベントリスナー
document.getElementById('start-btn').addEventListener('click', startMatching);
