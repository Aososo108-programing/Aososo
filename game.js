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

// ページの読み込みが完了したら実行
document.addEventListener("DOMContentLoaded", () => {
    const startButton = document.getElementById("start-btn");
    const readyButton = document.getElementById("ready-btn");
    const nicknameInput = document.getElementById("nickname");
    const matchingStatus = document.getElementById("matching-status");

    // ボタンが存在しない場合のエラーチェック
    if (!startButton || !readyButton || !nicknameInput || !matchingStatus) {
        console.error("必要な要素が見つかりません。HTMLを確認してください。");
        return;
    }

    // ゲーム開始ボタンのクリックイベント
    startButton.addEventListener("click", () => {
        playerNickname = nicknameInput.value.trim();

        if (!playerNickname) {
            alert("ニックネームを入力してください！");
            return;
        }

        matchingStatus.textContent = "対戦相手を探しています...";
        startMatching(matchingStatus);
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
function startMatching(matchingStatus) {
    if (!playerNickname) return;

    // 待機中のゲームルームを探す
    const gamesRef = database.ref("games");
    gamesRef.once("value", (snapshot) => {
        const games = snapshot.val();
        let foundRoom = false;

        // 既存の部屋を探索して空き部屋があれば参加
        for (const roomId in games) {
            const gameData = games[roomId];
            if (gameData.player2 === "waiting") {
                joinRoom(roomId, gameData, matchingStatus);
                foundRoom = true;
                break;
            }
        }

        // 空き部屋がなければ新しい部屋を作成
        if (!foundRoom) {
            createRoom(matchingStatus);
        }
    });
}

// 新しい部屋を作成
function createRoom(matchingStatus) {
    const roomId = database.ref("games").push().key;
    gameRef = database.ref("games/" + roomId);

    gameRef.set({
        player1: playerNickname,
        player2: "waiting",
        gameStarted: false,
    }).then(() => {
        console.log("[DEBUG] 新しいゲームルームを作成しました");
        listenForChanges(matchingStatus);
    }).catch((error) => {
        console.error("[DEBUG] 新しい部屋の作成エラー:", error);
    });
}

// 既存の部屋に参加
function joinRoom(roomId, gameData, matchingStatus) {
    gameRef = database.ref("games/" + roomId);

    gameRef.update({
        player2: playerNickname,
    }).then(() => {
        console.log("[DEBUG] 既存の部屋に参加しました");
        opponentNickname = gameData.player1;
        matchingStatus.textContent = `${opponentNickname}さんとマッチングしました！`;
        document.getElementById("ready-btn").style.display = "inline-block";
        listenForChanges(matchingStatus);
    }).catch((error) => {
        console.error("[DEBUG] 部屋への参加エラー:", error);
    });
}

// ゲームデータの変更を監視
function listenForChanges(matchingStatus) {
    gameRef.on("value", (snapshot) => {
        const gameData = snapshot.val();
        console.log("[DEBUG] 変更イベントが発火しました");
        console.log("[DEBUG] 取得したゲームデータ:", gameData);

        if (gameData) {
            if (gameData.player1 === playerNickname) {
                opponentNickname = gameData.player2 !== "waiting" ? gameData.player2 : null;
            } else if (gameData.player2 === playerNickname) {
                opponentNickname = gameData.player1;
            }

            if (opponentNickname) {
                matchingStatus.textContent = `${opponentNickname}さんとマッチングしました！`;
                document.getElementById("ready-btn").style.display = "inline-block";
            }
        }
    });
}
