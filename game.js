function startMatching() {
    playerNickname = document.getElementById('nickname').value;

    if (!playerNickname) {
        alert("ニックネームを入力してください！");
        return;
    }

    // ゲームのリファレンス作成
    gameRef = database.ref('games/room');

    gameRef.transaction((currentData) => {
        if (!currentData) {
            // データが存在しない場合、新規作成（player1として登録）
            return {
                player1: playerNickname,
                player2: "waiting"
            };
        } else if (currentData.player2 === "waiting") {
            // player2が空いている場合、player2に設定
            currentData.player2 = playerNickname;
            return currentData;
        } else {
            // 両方埋まっている場合、変更しない
            return; // 何も更新しない
        }
    }, (error, committed, snapshot) => {
        if (error) {
            console.error("[ERROR] データ送信エラー:", error);
        } else if (committed) {
            console.log("[DEBUG] マッチング情報が送信されました:", snapshot.val());
            monitorGame(snapshot.val());
        } else {
            console.log("[DEBUG] マッチングに失敗しました。すでに満員の可能性があります。");
        }
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

    // プレイヤーの状態を確認し、対戦相手を設定
    if (gameData.player1 === playerNickname && gameData.player2 === "waiting") {
        console.log("[DEBUG] 対戦相手を待っています...");
        document.getElementById("matching-status").textContent = "対戦相手を待っています...";
    } else if (gameData.player2 !== "waiting" && gameData.player1 !== gameData.player2) {
        matchFound(gameData);
    }
}

function matchFound(gameData) {
    opponentNickname = gameData.player1 === playerNickname 
        ? gameData.player2 
        : gameData.player1;

    if (!opponentNickname || opponentNickname === "waiting") {
        console.log("[DEBUG] 対戦相手を待っています...");
        document.getElementById("matching-status").textContent = `対戦相手を待っています...`;
        return;
    }

    console.log("[DEBUG] マッチング成功！対戦相手:", opponentNickname);
    document.getElementById("matching-status").textContent = `${opponentNickname}さんとマッチングしました！`;
    document.getElementById("ready-btn").style.display = "block";
}
