(() => {
  "use strict";

  const STORAGE_KEY = "yams-game-state-v1";
  const PIP_PATTERNS = {
    1: [4],
    2: [2, 6],
    3: [2, 4, 6],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 2, 3, 5, 6, 8],
  };

  function dieFaceHtml(value) {
    const on = new Set(PIP_PATTERNS[value]);
    let pips = "";
    for (let i = 0; i < 9; i++) {
      pips += `<span class="pip${on.has(i) ? " pip-on" : ""}"></span>`;
    }
    return pips;
  }

  const CATEGORIES = [
    { key: "as", label: "As", section: "top", compute: (d) => sumValue(d, 1) },
    { key: "deux", label: "Deux", section: "top", compute: (d) => sumValue(d, 2) },
    { key: "trois", label: "Trois", section: "top", compute: (d) => sumValue(d, 3) },
    { key: "quatre", label: "Quatre", section: "top", compute: (d) => sumValue(d, 4) },
    { key: "cinq", label: "Cinq", section: "top", compute: (d) => sumValue(d, 5) },
    { key: "six", label: "Six", section: "top", compute: (d) => sumValue(d, 6) },
    { key: "brelan", label: "Brelan", section: "bottom", compute: (d) => (hasCount(d, 3) ? sumAll(d) : 0) },
    { key: "carre", label: "Carré", section: "bottom", compute: (d) => (hasCount(d, 4) ? sumAll(d) : 0) },
    { key: "full", label: "Full", section: "bottom", compute: (d) => (isFullHouse(d) ? 25 : 0) },
    { key: "petiteSuite", label: "Petite suite", section: "bottom", compute: (d) => (isSmallStraight(d) ? 30 : 0) },
    { key: "grandeSuite", label: "Grande suite", section: "bottom", compute: (d) => (isLargeStraight(d) ? 40 : 0) },
    { key: "yams", label: "Yams", section: "bottom", compute: (d) => (isYamsRoll(d) ? 50 : 0) },
    { key: "chance", label: "Chance", section: "bottom", compute: (d) => sumAll(d) },
  ];

  const TOP_KEYS = CATEGORIES.filter((c) => c.section === "top").map((c) => c.key);
  const BOTTOM_KEYS = CATEGORIES.filter((c) => c.section === "bottom").map((c) => c.key);

  // --- Dice / scoring helpers ---

  function diceCounts(dice) {
    const c = {};
    dice.forEach((d) => (c[d] = (c[d] || 0) + 1));
    return c;
  }

  function sumAll(dice) {
    return dice.reduce((a, b) => a + b, 0);
  }

  function sumValue(dice, v) {
    return dice.filter((d) => d === v).reduce((a, b) => a + b, 0);
  }

  function hasCount(dice, n) {
    return Object.values(diceCounts(dice)).some((c) => c >= n);
  }

  function isFullHouse(dice) {
    const counts = Object.values(diceCounts(dice)).sort((a, b) => b - a);
    return counts.length === 2 && counts[0] === 3 && counts[1] === 2;
  }

  function isSmallStraight(dice) {
    const set = new Set(dice);
    const runs = [
      [1, 2, 3, 4],
      [2, 3, 4, 5],
      [3, 4, 5, 6],
    ];
    return runs.some((run) => run.every((v) => set.has(v)));
  }

  function isLargeStraight(dice) {
    const sorted = [...dice].sort((a, b) => a - b).join("");
    return sorted === "12345" || sorted === "23456";
  }

  function isYamsRoll(dice) {
    return hasCount(dice, 5);
  }

  // --- Totals ---

  function upperSum(scores) {
    return TOP_KEYS.reduce((s, k) => s + (scores[k] || 0), 0);
  }

  function bonus(scores) {
    return upperSum(scores) >= 63 ? 35 : 0;
  }

  function lowerSum(scores) {
    return BOTTOM_KEYS.reduce((s, k) => s + (scores[k] || 0), 0);
  }

  function totalScore(scores) {
    return upperSum(scores) + bonus(scores) + lowerSum(scores);
  }

  function emptyScores() {
    const scores = {};
    CATEGORIES.forEach((c) => (scores[c.key] = null));
    return scores;
  }

  // --- State ---

  function defaultState() {
    return {
      players: [],
      currentPlayerIndex: 0,
      dice: [1, 1, 1, 1, 1],
      history: [],
      started: false,
    };
  }

  let state = loadState();

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.players)) return defaultState();
      return parsed;
    } catch (e) {
      return defaultState();
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function isGameOver() {
    return (
      state.started &&
      state.players.length > 0 &&
      state.players.every((p) => CATEGORIES.every((c) => p.scores[c.key] !== null))
    );
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  // --- Mutations ---

  function addPlayer(name) {
    const trimmed = name.trim();
    if (!trimmed) return;
    state.players.push({
      id: `p${Date.now()}${Math.random().toString(36).slice(2, 6)}`,
      name: trimmed,
      scores: emptyScores(),
    });
    saveState();
    render();
  }

  function removePlayer(id) {
    state.players = state.players.filter((p) => p.id !== id);
    saveState();
    render();
  }

  function startGame() {
    if (state.players.length === 0) return;
    state.started = true;
    state.currentPlayerIndex = 0;
    state.dice = [1, 1, 1, 1, 1];
    state.history = [];
    saveState();
    render();
  }

  function cycleDie(index) {
    state.dice[index] = (state.dice[index] % 6) + 1;
    saveState();
    render();
  }

  function selectCategory(key) {
    const player = state.players[state.currentPlayerIndex];
    if (!player || player.scores[key] !== null) return;
    const score = CATEGORIES.find((c) => c.key === key).compute(state.dice);
    player.scores[key] = score;
    state.history.push({ playerIndex: state.currentPlayerIndex, key });
    state.currentPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;
    state.dice = [1, 1, 1, 1, 1];
    saveState();
    render();
  }

  function undo() {
    const last = state.history.pop();
    if (!last) return;
    state.players[last.playerIndex].scores[last.key] = null;
    state.currentPlayerIndex = last.playerIndex;
    state.dice = [1, 1, 1, 1, 1];
    saveState();
    render();
  }

  function resetGame() {
    if (!confirm("Démarrer une nouvelle partie ? Les scores actuels seront perdus.")) return;
    state = defaultState();
    saveState();
    render();
  }

  // --- Rendering ---

  const setupScreen = document.getElementById("setup-screen");
  const gameScreen = document.getElementById("game-screen");
  const gameoverScreen = document.getElementById("gameover-screen");
  const playerListEl = document.getElementById("player-list");
  const setupHint = document.getElementById("setup-hint");
  const diceRow = document.getElementById("dice-row");
  const scoreboard = document.getElementById("scoreboard");
  const currentPlayerNameEl = document.getElementById("current-player-name");
  const roundInfoEl = document.getElementById("round-info");
  const rankingList = document.getElementById("ranking-list");

  function roundsInfoText() {
    const totalRounds = CATEGORIES.length;
    const completedRounds = Math.floor(state.history.length / state.players.length);
    const currentRound = Math.min(completedRounds + 1, totalRounds);
    const remaining = totalRounds - completedRounds;
    const plural = remaining > 1 ? "s" : "";
    return `Manche ${currentRound} / ${totalRounds} — ${remaining} manche${plural} restante${plural}`;
  }

  function render() {
    const gameOver = isGameOver();

    setupScreen.classList.toggle("hidden", state.started);
    gameScreen.classList.toggle("hidden", !state.started || gameOver);
    gameoverScreen.classList.toggle("hidden", !gameOver);

    if (!state.started) {
      renderSetup();
    } else if (gameOver) {
      renderGameOver();
    } else {
      renderGame();
    }
  }

  function renderSetup() {
    playerListEl.innerHTML = state.players
      .map(
        (p) => `
      <li>
        <span>${escapeHtml(p.name)}</span>
        <button data-remove="${p.id}" aria-label="Retirer">×</button>
      </li>`
      )
      .join("");

    playerListEl.querySelectorAll("[data-remove]").forEach((btn) => {
      btn.addEventListener("click", () => removePlayer(btn.getAttribute("data-remove")));
    });

    setupHint.style.display = state.players.length === 0 ? "block" : "none";
  }

  function renderGame() {
    const player = state.players[state.currentPlayerIndex];
    currentPlayerNameEl.textContent = player.name;
    roundInfoEl.textContent = roundsInfoText();

    diceRow.innerHTML = state.dice
      .map((v, i) => `<div class="die" data-die="${i}">${dieFaceHtml(v)}</div>`)
      .join("");
    diceRow.querySelectorAll("[data-die]").forEach((el) => {
      el.addEventListener("click", () => cycleDie(Number(el.getAttribute("data-die"))));
    });

    scoreboard.innerHTML = buildScoreboardHtml();
    scoreboard.querySelectorAll("[data-cat]").forEach((el) => {
      el.addEventListener("click", () => selectCategory(el.getAttribute("data-cat")));
    });
  }

  function buildScoreboardHtml() {
    const headerCells = state.players
      .map((p, i) => `<th class="${i === state.currentPlayerIndex ? "col-current" : ""}">${escapeHtml(p.name)}</th>`)
      .join("");

    const rowsForKeys = (keys) =>
      keys
        .map((key) => {
          const cat = CATEGORIES.find((c) => c.key === key);
          const cells = state.players
            .map((p, i) => {
              const filled = p.scores[key];
              if (filled !== null) {
                return `<td class="cell-filled"><span class="check">✓</span>${filled}</td>`;
              }
              if (i === state.currentPlayerIndex) {
                const potential = cat.compute(state.dice);
                return `<td class="cell-playable col-current" data-cat="${key}">${potential}</td>`;
              }
              return `<td class="cell-empty col">—</td>`;
            })
            .join("");
          return `<tr><td class="label">${cat.label}</td>${cells}</tr>`;
        })
        .join("");

    const subtotalRow = `<tr class="subtotal-row"><td class="label">Sous-total</td>${state.players
      .map((p, i) => `<td class="${i === state.currentPlayerIndex ? "col-current" : ""}">${upperSum(p.scores)}</td>`)
      .join("")}</tr>`;

    const bonusRow = `<tr><td class="label">Bonus (63+)</td>${state.players
      .map((p, i) => `<td class="${i === state.currentPlayerIndex ? "col-current" : ""}">${bonus(p.scores)}</td>`)
      .join("")}</tr>`;

    const totalRow = `<tr class="total-row"><td class="label">Total</td>${state.players
      .map((p, i) => `<td class="${i === state.currentPlayerIndex ? "col-current" : ""}">${totalScore(p.scores)}</td>`)
      .join("")}</tr>`;

    return `
      <thead><tr><th class="label"></th>${headerCells}</tr></thead>
      <tbody>
        ${rowsForKeys(TOP_KEYS)}
        ${subtotalRow}
        ${bonusRow}
        ${rowsForKeys(BOTTOM_KEYS)}
        ${totalRow}
      </tbody>
    `;
  }

  function renderGameOver() {
    const ranked = [...state.players].sort((a, b) => totalScore(b.scores) - totalScore(a.scores));
    rankingList.innerHTML = ranked
      .map(
        (p, i) => `
      <li>
        <span>${i + 1}. ${escapeHtml(p.name)}</span>
        <strong>${totalScore(p.scores)}</strong>
      </li>`
      )
      .join("");
  }

  // --- Events ---

  document.getElementById("add-player-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = document.getElementById("player-name-input");
    addPlayer(input.value);
    input.value = "";
    input.focus();
  });

  document.getElementById("start-game-btn").addEventListener("click", startGame);
  document.getElementById("undo-btn").addEventListener("click", undo);
  document.getElementById("reset-btn").addEventListener("click", resetGame);
  document.getElementById("new-game-btn").addEventListener("click", resetGame);

  render();
})();
