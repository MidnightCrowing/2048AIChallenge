let game_start = false;
let game_progress = "none";
let player_score = 0;
let ai_score = 0;
const socket = io.connect('http://localhost:8413');

function titleStart() {
    document.getElementById("welcome").style.display = "none";
    document.getElementById("difficultySelection").style.display = "block";
    document.getElementById("scoreChallenge").style.display = "none";
    document.getElementById("gameContainer").style.display = "none";
}

function confirmDifficulty() {
    if (game_start) {
        document.getElementById("start-btn").innerText = "重来";
        document.getElementById("player-score").innerText = player_score;
        document.getElementById("ai-score").innerText = ai_score;
    } else {
        document.getElementById("start-btn").innerText = "开始";
        document.getElementById("player-score").innerText = "暂无";
        document.getElementById("ai-score").innerText = "暂无";
    }

    const selectedDifficulty = document.querySelector('input[name="difficulty"]:checked');
    let selected_test;
    if (selectedDifficulty) {
        document.getElementById("welcome").style.display = "none";
        document.getElementById("difficultySelection").style.display = "none";
        document.getElementById("scoreChallenge").style.display = "block";
        document.getElementById("gameContainer").style.display = "none";

        sendData('game_difficult_change', selectedDifficulty.value);

        const difficulty_a = document.getElementById("difficulty");
        if (selectedDifficulty.value === "easy") {
            selected_test = "简单";
        } else if (selectedDifficulty.value === "medium") {
            selected_test = "中等";
        } else {
            selected_test = "困难";
        }
        difficulty_a.textContent = "难度: " + selected_test;

    } else {
        alert("请先选择难度！");
    }
}

function startGame() {
    game_start = true;

    document.getElementById("welcome").style.display = "none";
    document.getElementById("difficultySelection").style.display = "none";
    document.getElementById("scoreChallenge").style.display = "none";
    document.getElementById("gameContainer").style.display = "block";

    // 切换游戏进度
    if (game_progress === "none") {
        game_progress = "player";
    } else if (game_progress === "player") {
        game_progress = "ai";
        player_score = getScore();
    } else {
        game_progress = "none";
        ai_score = getScore();
        confirmDifficulty();
        return;
    }

    // 设置玩家名字
    let player_name = (game_progress === "player") ? "You" : "AI";
    document.getElementById("player-name").innerText = "Player: " + player_name;

    resetGame();

    startTimer();

    if (game_progress === "ai") {
        sendData('board_info');
    }
}

function checkGameOver() {
    // 获取包含 "Game over!" 文本的 <p> 元素
    const gameOverParagraph = document.querySelector('.game-message p');

    // 提取 <p> 元素中的文本内容
    const gameOverText = gameOverParagraph.textContent;

    return gameOverText === "Game over!";
}

function resetGame() {
    document.dispatchEvent(RKeyEvent);

    // 清除 "Game over!" 文本
    const gameOverParagraph = document.querySelector('.game-message p');
    gameOverParagraph.textContent = "";
}

function getScore() {
    /* 获取游戏分数 */
    const scoreContainer = document.querySelector('.score-container'); // 获取包含数字的 <div> 元素
    const scoreText = scoreContainer.textContent; // 提取 <div> 元素中的文本内容
    const resultArray = scoreText.split('+'); // 使用+号作为分隔符进行拆分
    // 获取拆分后的第一个部分
    return resultArray[0];
}

function getGameBoard() {
    /* 获取棋盘数据 */
    // 获取包含特定类名的父元素
    const parentElement = document.querySelector('.tile-container');

    const classNames = [];
    let result = [];

    // 检查父元素是否存在
    if (parentElement) {
        // 获取父元素下的所有子元素
        const childElements = parentElement.children;

        // 遍历子元素并输出它们的类名
        for (let i = 0; i < childElements.length; i++) {
            const childClassName = childElements[i].className;
            classNames.push(childClassName);
            // console.log(childClassName);
        }

        result = Array.from({length: 4}, () => Array(4).fill(0));
        const regex = /tile tile-(\d+) tile-position-(\d)-(\d)/;
        for (const entry of classNames) {
            const [, num, x, y] = entry.match(regex).map(Number);
            result[y - 1][x - 1] = Math.max(result[y - 1][x - 1], num);
        }
    } else {
        console.error('未找到具有类名 "tile-container" 的元素。');
    }

    return result
}

function startTimer() {
    // 定义计时器
    let intervalId = setInterval(function () {
        if (checkGameOver()) {
            clearInterval(intervalId); // 关闭计时器
            setTimeout(function () {
                startGame();
            }, 3000);
        }
    }, 1000);
}

function sendData(event, data = null) {
    if (event === "board_info") {
        socket.emit("board_info", getGameBoard());
    } else {
        socket.emit('game_difficult_change', data);
    }
}

socket.on('move', function (action) {
    // action: 0 -> up, 1 -> left, 2-> right, 3 -> down
    document.dispatchEvent({
        "0": upKeyEvent,
        "1": downKeyEvent,
        "2": leftKeyEvent,
        "3": rightKeyEvent,
    }[action]);

    if (!checkGameOver()) {
        sendData('board_info');
    }
});

// 模拟按下R键
const RKeyEvent = new KeyboardEvent('keydown', {
    key: 'r', // 模拟按下的键为 "r"
    keyCode: 82, // "r" 键的键码值
});

// 模拟按下上箭头键
const upKeyEvent = new KeyboardEvent('keydown', {
    key: 'ArrowUp',
    keyCode: 38,
});

// 模拟按下下箭头键
const downKeyEvent = new KeyboardEvent('keydown', {
    key: 'ArrowDown',
    keyCode: 40,
});

// 模拟按下左箭头键
const leftKeyEvent = new KeyboardEvent('keydown', {
    key: 'ArrowLeft',
    keyCode: 37,
});

// 模拟按下右箭头键
const rightKeyEvent = new KeyboardEvent('keydown', {
    key: 'ArrowRight',
    keyCode: 39,
});

//
// const socket = io.connect('http://localhost:5000');
//
// socket.on('connect', function () {
//     console.log('2048 youhou plug WebSocket Connected');
// });
//
// socket.on('disconnect', function () {
//     console.log('2048 youhou plug WebSocket Disconnected');
// });
//
// // WebSocket获取
// socket.on('message', function (message) {
//     if (['UP', 'LEFT', 'RIGHT', 'DOWN'].includes(message)) {
//         // console.log('Received message: ' + message);
//         SimulateKeyboard(message);
//         sendMessage('ok');
//     } else if (message === 'reset') {
//         resetGame();
//         sendMessage('ok');
//     } else if (message === 'get info') {
//         sendMessage(getGameInfo());
//     } else if (message === 'check') {
//         sendMessage(checkGameOver());
//     }
// });
//
// function sendMessage(message) {
//     socket.emit('message', message);
// }
//
// function SimulateKeyboard(action) {
//     document.dispatchEvent({
//         "UP": upKeyEvent,
//         "LEFT": leftKeyEvent,
//         "RIGHT": rightKeyEvent,
//         "DOWN": downKeyEvent
//     }[action]);
// }
//
// function checkGameOver() {
//     // 获取包含 "Game over!" 文本的 <p> 元素
//     const gameOverParagraph = document.querySelector('.game-message p');
//
//     // 提取 <p> 元素中的文本内容
//     const gameOverText = gameOverParagraph.textContent;
//
//     return gameOverText === "Game over!";
// }
//
// function resetGame() {
//     // 点击新游戏按钮
//     const restartButton = document.querySelector('.restart-button'); // 获取包含类名 "restart-button" 的 <a> 元素
//     if (restartButton) {
//         restartButton.click(); // 模拟点击动作
//     }
//
//     // 清除 "Game over!" 文本
//     const gameOverParagraph = document.querySelector('.game-message p');
//     gameOverParagraph.textContent = "";
// }
//
// function getGameInfo() {
//     /* 获取棋盘数据 */
//     // 获取包含特定类名的父元素
//     const parentElement = document.querySelector('.tile-container');
//
//     const classNames = [];
//     let result = [];
//
//     // 检查父元素是否存在
//     if (parentElement) {
//         // 获取父元素下的所有子元素
//         const childElements = parentElement.children;
//
//         // 遍历子元素并输出它们的类名
//         for (let i = 0; i < childElements.length; i++) {
//             const childClassName = childElements[i].className;
//             classNames.push(childClassName);
//             // console.log(childClassName);
//         }
//
//         result = Array.from({length: 4}, () => Array(4).fill(0));
//         const regex = /tile tile-(\d+) tile-position-(\d)-(\d)/;
//         for (const entry of classNames) {
//             const [, num, x, y] = entry.match(regex).map(Number);
//             result[y - 1][x - 1] = Math.max(result[y - 1][x - 1], num);
//         }
//     } else {
//         console.error('未找到具有类名 "tile-container" 的元素。');
//     }
//
//     /* 获取游戏分数 */
//     const scoreContainer = document.querySelector('.score-container'); // 获取包含数字的 <div> 元素
//     const scoreText = scoreContainer.textContent; // 提取 <div> 元素中的文本内容
//     const resultArray = scoreText.split('+'); // 使用+号作为分隔符进行拆分
//     const resultString = resultArray[0]; // 获取拆分后的第一个部分
//
//     return {'game_score': resultString, 'board': result}
// }