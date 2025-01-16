// Firebaseの設定
const firebaseConfig = {
    apiKey: "AIzaSyC6w...",
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

    startButton.addEventListener("click", () => {
        playerNickname = nicknameInput.value.trim();

        if (!playerNickname) {
            alert("ニックネームを入力してください！");
            return;
        }

        matchingStatus.textContent = "マッチング中...";
        startMatching(matchingStatus);
    });

    readyButton.addEventListener("click", () => {
        if (!gameRef) return;

        const readyField = playerNickname === opponentNickname ? "player1Ready" : "player2Ready";

        gameRef.update({ [readyField]: true })
            .then(() => {
                matchingStatus.textContent = "準備完了！ゲーム開始を待っています...";
                readyButton.disabled = true;
            })
            .catch((error) => console.error("準備完了の更新エラー:", error));
    });
});

// マッチング処理
function startMatching(matchingStatus) {
    gameRef = database.ref("games/" + playerNickname);

    gameRef.once("value").then((snapshot) => {
        const gameData = snapshot.val();

        if (gameData) {
            if (gameData.player2 === "waiting") {
                // プレイヤー2として参加
                gameRef.update({ player2: playerNickname }).then(() => {
                    opponentNickname = gameData.player1;
                    matchingStatus.textContent = `${opponentNickname}さんとマッチングしました！`;
                    document.getElementById("ready-btn").style.display = "inline-block";
                });
            } else {
                alert("この部屋は満員です。別のニックネームで試してください。");
            }
        } else {
            // 新しいゲームを作成
            gameRef.set({
                player1: playerNickname,
                player2: "waiting",
                player1Ready: false,
                player2Ready: false,
                gameStarted: false,
            }).then(() => {
                matchingStatus.textContent = "対戦相手を待っています...";
            });
        }
    });

    gameRef.on("value", (snapshot) => {
        const gameData = snapshot.val();

        if (!gameData) return;

        // player2 が設定されたらマッチング完了
        if (gameData.player2 !== "waiting" && !opponentNickname) {
            opponentNickname = gameData.player2;
            matchingStatus.textContent = `${opponentNickname}さんとマッチングしました！`;
            document.getElementById("ready-btn").style.display = "inline-block";
        }

        // 両プレイヤーが準備完了の場合、ゲームを開始
        if (gameData.player1Ready && gameData.player2Ready && !gameData.gameStarted) {
            gameRef.update({ gameStarted: true });
        }

        // ゲーム開始
        if (gameData.gameStarted) {
            startGame();
        }
    });
}

// ゲーム開始処理
function startGame() {
    document.getElementById("game-container").innerHTML = `
        <h1>ゲーム開始！</h1>
        <p>単語を入力してEnterを押してください。</p>
        <div id="game-status"></div>
        <input type="text" id="game-input" placeholder="単語を入力">
    `;

    const words = ["りんご", "みかん", "トマト", "ピーマン", "スプーン", "フォーク", "ナイフ"];
    const gameInput = document.getElementById("game-input");
    const gameStatus = document.getElementById("game-status");

    let score = 0;
    const startTime = Date.now();
    const gameDuration = 30000; // 30秒

    gameInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            const enteredWord = gameInput.value.trim();
            if (words.includes(enteredWord)) {
                score++;
                gameStatus.textContent = `スコア: ${score}`;
            }
            gameInput.value = "";
        }
    });

    const gameTimer = setInterval(() => {
        const elapsedTime = Date.now() - startTime;

        if (elapsedTime >= gameDuration) {
            clearInterval(gameTimer);

            gameRef.update({ [`scores/${playerNickname}`]: score }).then(() => {
                gameRef.once("value").then((snapshot) => {
                    const gameData = snapshot.val();
                    const player1Score = gameData.scores[gameData.player1] || 0;
                    const player2Score = gameData.scores[gameData.player2] || 0;

                    let resultMessage = "ゲーム終了！\n";
                    resultMessage += `${gameData.player1}: ${player1Score}点\n`;
                    resultMessage += `${gameData.player2}: ${player2Score}点\n`;

                    if (player1Score > player2Score) {
                        resultMessage += gameData.player1 === playerNickname ? "あなたの勝ち！" : "あなたの負け...";
                    } else if (player2Score > player1Score) {
                        resultMessage += gameData.player2 === playerNickname ? "あなたの勝ち！" : "あなたの負け...";
                    } else {
                        resultMessage += "引き分け！";
                    }

                    alert(resultMessage);
                });
            });
        }
    }, 1000);
}
