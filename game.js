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
let gameStarted = false;
let remainingTime = 30;
let yourScore = 0;
let opponentScore = 0;
let playerNickname;
let gameRef;
let playerRef;
let opponentNickname = "";

// タイピング文（50種類）
const sentences = [
    "きゅうり", "トマト", "なすび", "さくらんぼ", "ジャガイモ", "にんじん",
    "スプーン", "フォーク", "お箸", "ナイフ", "ボール", "ペン", "ノート",
    "タオル", "時計", "テレビ", "パソコン", "本", "鉛筆", "テーブル", "椅子",
    "リモコン", "ランプ", "コンピュータ", "携帯", "掃除機", "冷蔵庫", "エアコン",
    "ピアノ", "ギター", "ドラム", "花瓶", "シャンプー", "歯ブラシ", "歯磨き粉",
    "靴下", "帽子", "シャツ", "ジーンズ", "スカート", "バッグ", "サングラス",
    "自転車", "車", "バス", "飛行機", "船", "公園", "道", "川", "山", "空"
];

// マッチング開始ボタンがクリックされたとき
document.getElementById('start-btn').addEventListener('click', startMatching);

// 準備完了ボタンがクリックされたとき
document.getElementById('ready-btn').addEventListener('click', readyUp);

// マッチング開始
function startMatching() {
    // ニックネームを取得
    playerNickname = document.getElementById('nickname').value;

    // ニックネームが空なら何もしない
    if (!playerNickname) {
        alert("ニックネームを入力してください！");
        return;
    }

    // ボタンとニックネーム入力を非表示に
    document.getElementById('nickname-container').style.display = 'none';
    document.getElementById('start-btn').style.display = 'none';
    document.getElementById('match-status').style.display = 'block';
    document.getElementById('matching-status').textContent = "マッチング中...";

    // Firebaseでマッチングを待機
    gameRef = database.ref('games').push();
    gameRef.set({
        player1: "waiting",
        player2: "waiting"
    });

    // マッチングの監視
    gameRef.on('value', snapshot => {
        const gameData = snapshot.val();
        if (gameData && gameData.player1 === "waiting") {
            gameRef.update({ player1: playerNickname });
        } else if (gameData && gameData.player2 === "waiting" && gameData.player1 !== playerNickname) {
            gameRef.update({ player2: playerNickname });
        } else if (gameData && gameData.player1 && gameData.player2 && gameData.player1 !== gameData.player2) {
            matchFound(gameData);
        }
    });
}

// マッチングが見つかったとき
function matchFound(gameData) {
    opponentNickname = gameData.player1 === playerNickname ? gameData.player2 : gameData.player1;
    
    // マッチング成功メッセージ
    document.getElementById('matching-status').textContent = `${opponentNickname}さんとマッチングしました！`;
    document.getElementById('ready-btn').style.display = 'block';
}

// 準備完了ボタンを押したとき
function readyUp() {
    // プレイヤーが準備完了を押したとき
    gameRef.update({
        [`player${gameData.player1 === playerNickname ? 1 : 2}Status`]: 'ready'
    });

    if (gameData.player1Status === 'ready' && gameData.player2Status === 'ready') {
        startCountdown();
    }
}

// ゲーム開始前のカウントダウン
function startCountdown() {
    let count = 3;
    const countdown = setInterval(() => {
        document.getElementById('matching-status').textContent = `ゲーム開始まで: ${count}`;
        count--;
        if (count < 0) {
            clearInterval(countdown);
            startGame();
        }
    }, 1000);
}

// ゲーム開始
function startGame() {
    gameStarted = true;
    document.getElementById('game-status').style.display = 'block';
    document.getElementById('matching-status').style.display = 'none';

    // ランダムな文を表示
    let typingSentence = sentences[Math.floor(Math.random() * sentences.length)];
    document.getElementById('sentence').textContent = typingSentence;

    // 入力を受け付ける
    document.getElementById('typing-input').disabled = false;
    document.getElementById('typing-input').focus();

    // タイマー開始
    const timer = setInterval(() => {
        remainingTime--;
        document.getElementById('timer').textContent = `残り時間: ${remainingTime}`;
        if (remainingTime <= 0) {
            clearInterval(timer);
            endGame();
        }
    }, 1000);
}

// ゲーム終了
function endGame() {
    // 結果を表示
    document.getElementById('typing-input').disabled = true;

    if (yourScore > opponentScore) {
        document.getElementById('status').textContent = `あなたは勝利しました！ あなたのスコア: ${yourScore} 相手のスコア: ${opponentScore}`;
    } else if (yourScore < opponentScore) {
        document.getElementById('status').textContent = `あなたは負けました！ あなたのスコア: ${yourScore} 相手のスコア: ${opponentScore}`;
    } else {
        document.getElementById('status').textContent = `引き分けです！ あなたのスコア: ${yourScore} 相手のスコア: ${opponentScore}`;
    }
}
