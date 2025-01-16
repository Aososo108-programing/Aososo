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
let score = 0;

// ゲーム開始ボタンのクリックイベント
document.getElementById('start-btn').addEventListener('click', () => {
    score = 0;
    updateScore();
    startGame();
});

// スコアの更新
function updateScore() {
    document.getElementById('score').textContent = score;
    // Firebaseのデータベースにスコアを保存
    const scoreRef = database.ref('scores/1');  // 'scores/1'は一つのユーザーのスコア
    scoreRef.set(score);
}

// ゲームのロジック（簡単なカウンターチャレンジ）
function startGame() {
    const gameInterval = setInterval(() => {
        score++;
        updateScore();

        if (score >= 10) {  // スコアが10に達したらゲーム終了
            clearInterval(gameInterval);
            alert("ゲーム終了！ スコア: " + score);
        }
    }, 1000);
}
