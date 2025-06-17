// --- 基本ステータス定義 ---
const enemyMaxHP = 30;
const playerMaxHP = 20;
let enemyHP = enemyMaxHP;
let playerHP = playerMaxHP;
let playerDefending = false;
let enemyDefending = false;

// --- デッキ・手札・捨て札 ---
let deck = [];
let hand = [];
let discardPile = [];

// --- 使用可能カードの種類 ---
const cardPool = [
  { name: "攻撃", type: "attack", value: 6 },
  { name: "防御", type: "defend", value: 0 },
  { name: "回復", type: "heal", value: 5 },
];

// --- HTMLの要素取得 ---
const handDiv = document.getElementById("hand");
const enemyHPSpan = document.getElementById("enemy-hp");
const enemyHPBar = document.getElementById("enemy-hp-bar");
const playerHPSpan = document.getElementById("player-hp");
const playerHPBar = document.getElementById("player-hp-bar");
const result = document.getElementById("result");
const log = document.getElementById("log");
const deckCountSpan = document.getElementById("deck-count");
const discardCountSpan = document.getElementById("discard-count");
const turnIndicator = document.getElementById("turn-indicator");

// --- 初期セットアップ処理 ---
function initializeDeck() {
  deck = [];
  discardPile = [];
  for (let i = 0; i < 4; i++) deck.push({ ...cardPool[0] });
  for (let i = 0; i < 3; i++) deck.push({ ...cardPool[1] });
  for (let i = 0; i < 3; i++) deck.push({ ...cardPool[2] });
}

function shuffleDeck() {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
}

function reshuffleIfNeeded() {
  if (deck.length === 0 && discardPile.length > 0) {
    deck = [...discardPile];
    discardPile = [];
    shuffleDeck();
  }
}

function drawCards(num) {
  console.log("drawCards 実行: ", num);
  for (let i = 0; i < num; i++) {
    reshuffleIfNeeded();
    if (deck.length === 0) break;
    hand.push(deck.pop());
  }
  console.log("drawCards 後の手札の数: ", hand.length);
  updateDeckInfo();
}


function updateDeckInfo() {
  deckCountSpan.textContent = deck.length;
  discardCountSpan.textContent = discardPile.length;
}

function updateHPDisplay() {
  enemyHPSpan.textContent = enemyHP;
  enemyHPBar.value = enemyHP;
  playerHPSpan.textContent = playerHP;
  playerHPBar.value = playerHP;
}

function renderCards() {
  console.log("renderCards 実行: 手札の枚数", hand.length);

  handDiv.innerHTML = "";
  hand.forEach((card, index) => {
    const cardElem = document.createElement("div");
    cardElem.className = `card ${card.type}`;
    cardElem.innerHTML = `${card.name}<br><small>${getCardEffectText(card)}</small>`;
    cardElem.onclick = () => {
      if (enemyHP <= 0 || playerHP <= 0) return;
      handlePlayerAction(card, index);
    };
    handDiv.appendChild(cardElem);
  });
}


function getCardEffectText(card) {
  switch (card.type) {
    case "attack": return `敵に${card.value}ダメージ`;
    case "defend": return "次のダメージ半減";
    case "heal": return `HP+${card.value}`;
  }
}

let isPlayerTurn = true; // グローバル変数として追加

function handlePlayerAction(card, index) {
  if (!isPlayerTurn) return; // プレイヤーのターンでなければ何もしない
  isPlayerTurn = false; // 以降の操作をロック

  let logText = "";
  if (card.type === "attack") {
    let dmg = enemyDefending ? Math.floor(card.value / 2) : card.value;
    if (enemyDefending) logText += "敵は防御中！ダメージ半減。\n";
    enemyHP -= dmg;
    if (enemyHP < 0) enemyHP = 0;
    logText += `あなたの攻撃：敵に${dmg}ダメージ\n`;
  } else if (card.type === "defend") {
    playerDefending = true;
    logText += "あなたは防御した！\n";
  } else if (card.type === "heal") {
    playerHP = Math.min(playerMaxHP, playerHP + card.value);
    logText += `あなたは${card.value}回復！\n`;
  }

  discardPile.push(card);
  hand.splice(index, 1);
  updateHPDisplay();

  if (enemyHP === 0) {
    result.innerText = "勝利！";
    log.innerText = logText;
    isPlayerTurn = true; // 勝利時はロック解除
    return;
  }

  // 敵のターンに移行
  setTimeout(() => {
    showTurn("敵のターン...");
    const enemyLog = enemyTurn();
    log.innerText = logText + enemyLog;
    updateHPDisplay();
    if (playerHP === 0) {
      result.innerText = "敗北...";
    }
    playerDefending = false;
    enemyDefending = false;
    drawCards(1);
    renderCards();
    showTurn("あなたのターン！");
    isPlayerTurn = true; // プレイヤーのターン開始時にロック解除
  }, 800);
}

function enemyTurn() {
  const actions = ["attack", "defend", "heal"];
  const choice = actions[Math.floor(Math.random() * actions.length)];
  let logText = "";
  if (choice === "attack") {
    let dmg = playerDefending ? 2 : 5;
    if (playerDefending) logText += "あなたは防御中！ダメージ半減。\n";
    playerHP -= dmg;
    if (playerHP < 0) playerHP = 0;
    logText += `敵の攻撃：あなたに${dmg}ダメージ\n`;
  } else if (choice === "defend") {
    enemyDefending = true;
    logText += "敵は防御した！\n";
  } else if (choice === "heal") {
    const heal = 4;
    enemyHP = Math.min(enemyMaxHP, enemyHP + heal);
    logText += `敵は${heal}回復！\n`;
  }
  return logText;
}

function showTurn(text) {
  turnIndicator.textContent = text;
  turnIndicator.style.visibility = "visible";
  setTimeout(() => {
    turnIndicator.style.visibility = "hidden";
  }, 3000);
}

// --- ゲーム開始時処理 ---
initializeDeck();
shuffleDeck();
drawCards(5);
updateHPDisplay();
updateDeckInfo();
renderCards();
showTurn("あなたのターン！");