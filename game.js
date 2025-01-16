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
let matchingStatus; // グローバルスコープで定義

// ページの読み込みが完了したら実行
document.addEventListener("DOMContentLoaded", () => {
    const startButton = document.getElementById("start-btn");
    const readyButton = document.getElementById("ready-btn");
    const nicknameInput = document.getElementById("nickname");
    matchingStatus = document.getElementById("matching-status"); // スコープ修正

    // ゲーム開始ボタンのクリックイベント
    startButton.addEventListener("click", () => {
        playerNickname = nicknameInput.value.trim();

        if (!playerNickname) {
            alert("ニックネームを入力してください！");
            return;
        }

        matchingStatus.textContent = "対戦相手を待っています...";
        startMatching();
    });

    // 準備完了ボタンのクリックイベント
    readyButton.addEventListener("click", () => {
        if (gameRef) {
            gameRef.update({ gameStarted: true })
                .then(() => {
                    matchingStatus.textContent = "ゲームを開始しました！";
                    readyButton.disabled = true;
                })
                .catch((error) => {
                    console.error("準備完了の更新エラー:", error);
                });
        }
    });
});

// マッチング処理
function startMatching() {
    if (!playerNickname) return;

    // ゲームルームを作成または取得
    gameRef = database.ref("games/" + playerNickname);

    gameRef.set({
        player1: playerNickname,
        player2: "waiting",
        gameStarted: false,
    }).then(() => {
        console.log("[DEBUG] ゲームデータが作成されました");
    }).catch((error) => {
        console.error("[DEBUG] データ送信エラー:", error);
    });

    // ゲームデータの変更を監視
    gameRef.on("value", (snapshot) => {
        const gameData = snapshot.val();
        console.log("[DEBUG] 取得したゲームデータ:", gameData);

        if (gameData) {
            if (gameData.player1 === playerNickname && gameData.player2 === "waiting") {
                matchingStatus.textContent = "対戦相手を待っています...";
            } else if (gameData.player1 === playerNickname && gameData.player2 !== "waiting") {
                opponentNickname = gameData.player2;
                matchingStatus.textContent = `${opponentNickname}さんとマッチングしました！`;
                document.getElementById("ready-btn").style.display = "inline-block";
            }
        }
    });
}
