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
let playerSlot;

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
        if (gameRef && playerSlot) {
            gameRef.update({ [`${playerSlot}Ready`]: true })
                .then(() => {
                    matchingStatus.textContent = "準備完了！対戦相手を待っています...";
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
    // 空いている部屋を検索
    database.ref("games").once("value").then((snapshot) => {
        const games = snapshot.val();
        let roomFound = false;

        if (games) {
            for (const roomId in games) {
                const game = games[roomId];
                if (game.player1 && !game.player2) {
                    // 空いている部屋に参加
                    joinRoom(roomId, "player2", matchingStatus);
                    roomFound = true;
                    break;
                }
            }
        }

        if (!roomFound) {
            // 新しい部屋を作成
            const newRoomId = `room_${Date.now()}`;
            createRoom(newRoomId, matchingStatus);
        }
    });
}

// 新しい部屋を作成
function createRoom(roomId, matchingStatus) {
    gameRef = database.ref(`games/${roomId}`);
    playerSlot = "player1";

    gameRef.set({
        player1: playerNickname,
        player2: null,
        player1Ready: false,
        player2Ready: false,
        gameStarted: false,
    }).then(() => {
        console.log("[DEBUG] 新しい部屋を作成しました:", roomId);
        matchingStatus.textContent = "対戦相手を待っています...";
        listenForChanges();
    });
}

// 既存の部屋に参加
function joinRoom(roomId, slot, matchingStatus) {
    gameRef = database.ref(`games/${roomId}`);
    playerSlot = slot;

    gameRef.update({ [slot]: playerNickname }).then(() => {
        console.log("[DEBUG] 部屋に参加しました:", roomId);
        matchingStatus.textContent = "対戦相手とマッチングしました！";
        listenForChanges();
    });
}

// ゲームデータの変更を監視
function listenForChanges() {
    gameRef.on("value", (snapshot) => {
        const gameData = snapshot.val();
        console.log("[DEBUG] ゲームデータ更新:", gameData);

        if (gameData) {
            // 対戦相手の情報を取得
            opponentNickname = playerSlot === "player1" ? gameData.player2 : gameData.player1;

            if (opponentNickname) {
                document.getElementById("ready-btn").style.display = "inline-block";
                document.getElementById("matching-status").textContent = `${opponentNickname}さんとマッチングしました！`;
            }

            // 両者が準備完了したらゲームを開始
            if (gameData.player1Ready && gameData.player2Ready) {
                document.getElementById("matching-status").textContent = "ゲーム開始！";
                console.log("[DEBUG] ゲームを開始します！");
                gameRef.update({ gameStarted: true });
            }
        }
    });
}
