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
let gameRef = null; // 初期化を明示的に設定

// ページの読み込みが完了したら実行
document.addEventListener("DOMContentLoaded", () => {
    const startButton = document.getElementById("start-btn");
    const readyButton = document.getElementById("ready-btn");
    const nicknameInput = document.getElementById("nickname");
    const matchingStatus = document.getElementById("matching-status");

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

        matchingStatus.textContent = "対戦相手を待っています...";
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

    // ゲームルームを作成または取得
    gameRef = database.ref("games/" + playerNickname);

    // 初期データを設定
    gameRef
        .set({
            player1: playerNickname,
            player2: "waiting",
            gameStarted: false,
        })
        .then(() => {
            console.log("[DEBUG] ゲームデータが作成されました");

            // データ監視を登録（初期化完了後に呼び出し）
            if (gameRef) {
                gameRef.on("value", (snapshot) => {
                    console.log("[DEBUG] 変更イベントが発火しました");
                    const gameData = snapshot.val();

                    if (gameData) {
                        console.log("[DEBUG] 取得したゲームデータ:", gameData);

                        if (gameData.player1 === playerNickname && gameData.player2 === "waiting") {
                            matchingStatus.textContent = "対戦相手を待っています...";
                        } else if (gameData.player1 === playerNickname && gameData.player2 !== "waiting") {
                            opponentNickname = gameData.player2;
                            matchingStatus.textContent = `${opponentNickname}さんとマッチングしました！`;
                            document.getElementById("ready-btn").style.display = "inline-block";
                        } else {
                            console.warn("[DEBUG] 想定外の状態:", gameData);
                        }
                    } else {
                        console.error("[DEBUG] データが空です。");
                    }
                });
            }
        })
        .catch((error) => {
            console.error("[DEBUG] データ送信エラー:", error);
        });

    // 他のプレイヤーのマッチングをシミュレーション
    simulateOpponent("テストプレイヤー");
}

// テスト用: 対戦相手をシミュレートしてデータを更新
function simulateOpponent(opponentName) {
    if (gameRef) {
        console.log("[DEBUG] simulateOpponent を実行します...");
        gameRef.update({
            player2: opponentName,
        }).then(() => {
            console.log("[DEBUG] テスト用プレイヤーを追加しました:", opponentName);
        }).catch((error) => {
            console.error("[DEBUG] テスト用プレイヤー追加エラー:", error);
        });
    } else {
        console.error("[DEBUG] gameRef が未定義のため simulateOpponent を実行できません。");
    }
}
