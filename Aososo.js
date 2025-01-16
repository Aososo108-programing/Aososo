// Firebaseの設定
const firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "your-auth-domain",
    databaseURL: "your-database-url",
    projectId: "your-project-id",
    storageBucket: "your-storage-bucket",
    messagingSenderId: "your-messaging-sender-id",
    appId: "your-app-id",
};

const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// ゲームの状態管理
let yourScore = 0;
let opponentScore = 0;
let gameStarted = false;
let gameTimer;
let remainingTime = 30;
let typingSentence;
let playerRef = database.ref('players');
let gameRef;

// 50種類のタイピング文（ランダムで選ばれる）
const sentences = [
    "きゅうり", "トマト", "なすび", "さくらんぼ", "ジャガイモ", "にんじん",
    "スプーン", "フォーク", "お箸", "ナイフ", "ボール", "ペン", "ノート",
    "タオル", "時計", "テレビ", "パソコン", "本", "鉛筆", "テーブル", "椅子",
    "リモコン", "ランプ", "コンピュータ", "携帯", "掃除機", "冷蔵庫", "エアコン",
    "ピアノ", "ギター", "ドラム", "花瓶", "シャンプー", "歯ブラシ", "歯磨き粉",
    "靴下", "帽子", "シャツ", "ジーンズ", "スカート", "バッグ", "サングラス",
    "自転車", "車", "バス", "飛行機", "船", "公園", "道", "川", "山", "空"
];

// マッチング開始ボタン
document.getElementById('match-btn').addEventListener('click', startMatching);

function startMatching() {
    // 「マッチング開始」ボタンを無効化
    document.getElementById('match-btn').disabled = true;
    document.getElementById('status').textContent = "マッチング中...";

    // プレイヤーの状態をFirebaseに保存し、対戦相手を探す
    gameRef = database.ref('games').push();
    gameRef.set({
        player1: "waiting",
        player2: "waiting"
    });

    // プレイヤーがマッチングしたらゲームを開始
    gameRef.on('value', snapshot => {
        const gameData = snapshot.val();
        if (gameData && gameData.player1 === "waiting") {
            gameRef.update({ player1: "ready" });
        } else if (gameData && gameData.player2 === "waiting") {
            gameRef.update({ player2: "ready" });
        } else if (gameData && gameData.player1 === "ready" && gameData.player2 === "ready") {
            startGame();
        }
    });
}

function startGame() {
    gameStarted = true;
    remainingTime = 30;
    yourScore = 0;
    opponentScore = 0;
    document.getElementById('your-score').textContent = yourScore;
    document.getElementById('opponent-score').textContent = opponentScore;
    document.getElementById('status').textContent = "ゲーム中...";
    
    // ランダムな文を表示
    typingSentence = sentences[Math.floor(Math.random() * sentences.length)];
    document.getElementById('sentence').textContent = typingSentence;
    
    // タイマー開始
    gameTimer = setInterval(() => {
        remainingTime--;
        document.getElementById('timer').textContent = `残り時間: ${remainingTime}`;
        if (remainingTime <= 0) {
            endGame();
        }
    }, 1000);
    
    // 入力を受け付ける
    document.getElementById('typing-input').disabled = false;
    document.getElementById('typing-input').focus();
}

function endGame() {
    clearInterval(gameTimer);
    document.getElementById('typing-input').disabled = true;

    if (yourScore > opponentScore) {
        document.getElementById('status').textContent = `あなたは勝利しました！ あなたのスコア: ${yourScore} 相手のスコア: ${opponentScore}`;
    } else if (yourScore < opponentScore) {
        document.getElementById('status').textContent = `あなたは負けました！ あなたのスコア: ${yourScore} 相手のスコア: ${opponentScore}`;
    } else {
        document.getElementById('status').textContent = `引き分けです！ あなたのスコア: ${yourScore} 相手のスコア: ${opponentScore}`;
    }
}
