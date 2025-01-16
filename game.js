// Firebaseの設定
const firebaseConfig = {
    apiKey: "AIzaSyC6wfdNTjSEzxbaa25OsSNI0pttUL81A4U",
    authDomain: "aososo-6cb52.firebaseapp.com",
    databaseURL: "https://aososo-6cb52-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "aososo-6cb52",
    storageBucket: "aososo-6cb52.appspot.com",
    messagingSenderId: "13878478089",
    appId: "1:13878478089:web:92108377595e94ad64ffd8"
};

// Firebaseの初期化
const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// グローバル変数
let playerNickname;
let gameRef;
let playerRole; // player1 か player2 を保存
let opponentNickname;

// ゲーム開始ボタンのイベント
document.getElementById("start-btn").addEventListener("click", () => {
    playerNickname = document.getElementById("nickname").value;

    if (!playerNickname) {
        alert("ニックネームを入力してください！");
        return;
    }

    startMatching();
});

// マッチング処理
function startMatching() {
    console.log("[DEBUG] マッチングを開始します...");

    gameRef = database.ref("games/game1");

    gameRef.once("value").then((snapshot) => {
        const gameData = snapshot.val();

        console.log("[DEBUG] 取得したゲームデータ:", gameData);

        if (!gameData) {
            // ゲームデータが存在しない場合、新規作成
            playerRole = "player1";
            gameRef.set({
                player1: playerNickname,
                player2: "waiting"
            });
            console.log("[DEBUG] player1 に設定されました:", playerNickname);
        } else if (gameData.player2 === "waiting") {
            // player2として参加
            playerRole = "player2";
            gameRef.update({
                player2: playerNickname
            });
            console.log("[DEBUG] player2 に設定されました:", playerNickname);
        } else {
            console.log("[DEBUG] マッチングが満員です。");
            alert("現在マッチングが満員です。しばらくしてから再試行してください。");
            return;
        }

        // マッチング情報の監視
        monitorGame();
    });
}

// ゲーム状態を監視
function monitorGame() {
    gameRef.on("value", (snapshot) => {
        const gameData = snapshot.val();

        console.log("[DEBUG] 現在のゲームデータ:", gameData);

        if (gameData) {
            if (gameData.player1 !== "waiting" && gameData.player2 !== "waiting") {
                opponentNickname =
                    playerRole === "player1" ? gameData.player2 : gameData.player1;

                console.log("[DEBUG] マッチング成功！ 対戦相手:", opponentNickname);
                document.getElementById("matching-status").textContent =
                    `${opponentNickname}さんとマッチングしました！`;
            } else {
                console.log("[DEBUG] 対戦相手を待っています...");
                document.getElementById("matching-status").textContent =
                    "対戦相手を待っています...";
            }
        }
    });
}
