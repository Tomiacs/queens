// ---------------------------------------------------------------------------
// Queens játék logika + rajzolás.
// A pályákat a levels.js szolgáltatja (window.LEVELS).
// ---------------------------------------------------------------------------

(function () {
  "use strict";

  // Cellák állapotai
  const EMPTY = 0;
  const X = 1;
  const QUEEN = 2;

  const QUEEN_CHAR = "♛";
  const X_CHAR = "✕";

  // DOM elemek
  const boardEl = document.getElementById("board");
  const statusEl = document.getElementById("status");
  const timerEl = document.getElementById("timer");
  const levelSelect = document.getElementById("levelSelect");
  const resetBtn = document.getElementById("resetBtn");

  // Aktuális játékállapot
  let level = null; // aktuális pálya-objektum
  let size = 0;
  let marks = []; // size x size: EMPTY | X | QUEEN
  let autoX = []; // size x size: bool – az adott X automatikus-e
  let cellEls = []; // size x size: DOM referencia
  let solved = false;

  // Időzítő
  let timerId = null;
  let startedAt = null;

  // -------------------------------------------------------------------------
  // Segédfüggvények
  // -------------------------------------------------------------------------

  function makeMatrix(n, value) {
    const m = new Array(n);
    for (let r = 0; r < n; r++) {
      m[r] = new Array(n).fill(value);
    }
    return m;
  }

  function inBounds(r, c) {
    return r >= 0 && r < size && c >= 0 && c < size;
  }

  function regionAt(r, c) {
    return level.grid[r][c];
  }

  // -------------------------------------------------------------------------
  // Pálya betöltése és felépítése
  // -------------------------------------------------------------------------

  function loadLevel(lvl) {
    level = lvl;
    size = lvl.size;
    marks = makeMatrix(size, EMPTY);
    autoX = makeMatrix(size, false);
    solved = false;
    buildBoard();
    resetTimer();
    setStatus("", "");
  }

  function buildBoard() {
    boardEl.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    boardEl.style.gridTemplateRows = `repeat(${size}, 1fr)`;
    boardEl.innerHTML = "";
    cellEls = makeMatrix(size, null);

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const cell = document.createElement("div");
        cell.className = "cell";
        cell.dataset.r = r;
        cell.dataset.c = c;
        cell.setAttribute("role", "gridcell");
        cell.tabIndex = 0;

        const region = regionAt(r, c);
        cell.style.background = level.regions[region].color;

        // Régió-határok (vastag vonal, ha a szomszéd más régió vagy tábla széle)
        if (r === 0 || regionAt(r - 1, c) !== region) cell.classList.add("edge-top");
        if (r === size - 1 || regionAt(r + 1, c) !== region) cell.classList.add("edge-bottom");
        if (c === 0 || regionAt(r, c - 1) !== region) cell.classList.add("edge-left");
        if (c === size - 1 || regionAt(r, c + 1) !== region) cell.classList.add("edge-right");

        if (c === size - 1) cell.classList.add("last-col");
        if (r === size - 1) cell.classList.add("last-row");

        cellEls[r][c] = cell;
        boardEl.appendChild(cell);
      }
    }
    renderAll();
  }

  // -------------------------------------------------------------------------
  // Interakció
  // -------------------------------------------------------------------------
  //  - sima kattintás: X ki/be kapcsolása (üres <-> X)
  //  - dupla kattintás: királynő le/felrakása (+ tiltott mezők automatikus X-elése)
  // -------------------------------------------------------------------------

  function onSingleClick(r, c) {
    if (solved) return;
    const m = marks[r][c];
    if (m === QUEEN) {
      // Királynőt csak dupla kattintás vesz le – sima kattintást itt figyelmen kívül hagyjuk.
      return;
    }
    if (m === X) {
      marks[r][c] = EMPTY;
      autoX[r][c] = false;
    } else {
      marks[r][c] = X;
      autoX[r][c] = false; // kézzel rakott X
    }
    afterChange();
  }

  function onDoubleClick(r, c) {
    if (solved) return;
    if (marks[r][c] === QUEEN) {
      marks[r][c] = EMPTY;
    } else {
      marks[r][c] = QUEEN;
      autoX[r][c] = false;
    }
    recomputeAutoX();
    afterChange();
  }

  // A királynők köré automatikusan X-eket rakunk a tiltott mezőkre.
  function recomputeAutoX() {
    // Először töröljük a korábbi automatikus X-eket.
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (autoX[r][c] && marks[r][c] === X) {
          marks[r][c] = EMPTY;
        }
        autoX[r][c] = false;
      }
    }

    const queens = [];
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (marks[r][c] === QUEEN) queens.push([r, c]);
      }
    }

    const markAuto = (r, c) => {
      if (!inBounds(r, c)) return;
      if (marks[r][c] === EMPTY) {
        marks[r][c] = X;
        autoX[r][c] = true;
      }
    };

    for (const [qr, qc] of queens) {
      // egész sor és oszlop
      for (let i = 0; i < size; i++) {
        markAuto(qr, i);
        markAuto(i, qc);
      }
      // átlós szomszédok (a Queens-ben csak a közvetlen érintkezés tilos,
      // de a sor/oszlop már fentebb lefedve – itt a 8 szomszéd is kap X-et)
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          markAuto(qr + dr, qc + dc);
        }
      }
      // ugyanabban a régióban minden mezőt kizárunk
      const region = regionAt(qr, qc);
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (regionAt(r, c) === region) markAuto(r, c);
        }
      }
    }
  }

  function afterChange() {
    if (startedAt === null) startTimer();
    const conflicts = findConflicts();
    renderAll(conflicts);
    checkWin(conflicts);
  }

  // -------------------------------------------------------------------------
  // Szabály-ellenőrzés
  // -------------------------------------------------------------------------

  // Visszaadja a konfliktusban lévő királynők halmazát ("r,c" kulcsokkal).
  function findConflicts() {
    const queens = [];
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (marks[r][c] === QUEEN) queens.push([r, c]);
      }
    }
    const bad = new Set();
    const key = (r, c) => `${r},${c}`;

    for (let i = 0; i < queens.length; i++) {
      for (let j = i + 1; j < queens.length; j++) {
        const [r1, c1] = queens[i];
        const [r2, c2] = queens[j];
        const sameRow = r1 === r2;
        const sameCol = c1 === c2;
        const sameRegion = regionAt(r1, c1) === regionAt(r2, c2);
        const adjacent = Math.abs(r1 - r2) <= 1 && Math.abs(c1 - c2) <= 1;
        if (sameRow || sameCol || sameRegion || adjacent) {
          bad.add(key(r1, c1));
          bad.add(key(r2, c2));
        }
      }
    }
    return bad;
  }

  function checkWin(conflicts) {
    let queenCount = 0;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (marks[r][c] === QUEEN) queenCount++;
      }
    }
    if (queenCount === size && conflicts.size === 0) {
      solved = true;
      stopTimer();
      setStatus(`Megoldva! Idő: ${formatTime(elapsedMs())} 🎉`, "win");
    } else if (conflicts.size > 0) {
      setStatus("Ütközés – két királynő nem érintkezhet, és sor/oszlop/szín is egyedi.", "error");
    } else {
      setStatus("", "");
    }
  }

  // -------------------------------------------------------------------------
  // Rajzolás
  // -------------------------------------------------------------------------

  function renderAll(conflicts) {
    conflicts = conflicts || new Set();
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        renderCell(r, c, conflicts.has(`${r},${c}`));
      }
    }
  }

  function renderCell(r, c, isConflict) {
    const cell = cellEls[r][c];
    const m = marks[r][c];

    let inner = "";
    if (m === QUEEN) {
      inner = `<span class="mark queen">${QUEEN_CHAR}</span>`;
    } else if (m === X) {
      inner = `<span class="mark x-mark">${X_CHAR}</span>`;
    }
    cell.innerHTML = inner;

    cell.classList.toggle("auto", m === X && autoX[r][c]);
    cell.classList.toggle("conflict", !!isConflict);
  }

  // -------------------------------------------------------------------------
  // Állapotüzenet
  // -------------------------------------------------------------------------

  function setStatus(text, type) {
    statusEl.textContent = text;
    statusEl.className = "status" + (type ? " " + type : "");
  }

  // -------------------------------------------------------------------------
  // Időzítő
  // -------------------------------------------------------------------------

  function startTimer() {
    startedAt = Date.now();
    timerId = setInterval(updateTimer, 250);
    updateTimer();
  }

  function stopTimer() {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
  }

  function resetTimer() {
    stopTimer();
    startedAt = null;
    timerEl.textContent = "0:00";
  }

  function elapsedMs() {
    return startedAt === null ? 0 : Date.now() - startedAt;
  }

  function updateTimer() {
    timerEl.textContent = formatTime(elapsedMs());
  }

  function formatTime(ms) {
    const total = Math.floor(ms / 1000);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  // -------------------------------------------------------------------------
  // Eseménykezelés
  // -------------------------------------------------------------------------
  // A dupla kattintás megbízható kezeléséhez saját kattintás-számlálót
  // használunk, hogy a sima klikk ne süljön el rögtön a duplán is.
  // -------------------------------------------------------------------------

  let clickTimer = null;
  const DOUBLE_MS = 250;

  boardEl.addEventListener("click", (e) => {
    const cell = e.target.closest(".cell");
    if (!cell) return;
    const r = +cell.dataset.r;
    const c = +cell.dataset.c;

    if (clickTimer) {
      // Ez a második kattintás -> dupla klikk
      clearTimeout(clickTimer);
      clickTimer = null;
      onDoubleClick(r, c);
    } else {
      clickTimer = setTimeout(() => {
        clickTimer = null;
        onSingleClick(r, c);
      }, DOUBLE_MS);
    }
  });

  // Böngésző saját dblclick (pl. szövegkijelölés) letiltása a táblán.
  boardEl.addEventListener("dblclick", (e) => e.preventDefault());

  // Billentyűzet: Enter = X, szóköz = királynő.
  boardEl.addEventListener("keydown", (e) => {
    const cell = e.target.closest(".cell");
    if (!cell) return;
    const r = +cell.dataset.r;
    const c = +cell.dataset.c;
    if (e.key === "Enter") {
      e.preventDefault();
      onSingleClick(r, c);
    } else if (e.key === " ") {
      e.preventDefault();
      onDoubleClick(r, c);
    }
  });

  resetBtn.addEventListener("click", () => {
    loadLevel(level);
  });

  levelSelect.addEventListener("change", () => {
    const lvl = LEVELS.find((l) => l.id === levelSelect.value);
    if (lvl) loadLevel(lvl);
  });

  // -------------------------------------------------------------------------
  // Indítás
  // -------------------------------------------------------------------------

  function init() {
    if (!window.LEVELS || LEVELS.length === 0) {
      setStatus("Nincs betölthető pálya.", "error");
      return;
    }
    // Pályaválasztó feltöltése
    levelSelect.innerHTML = "";
    for (const lvl of LEVELS) {
      const opt = document.createElement("option");
      opt.value = lvl.id;
      opt.textContent = lvl.name;
      levelSelect.appendChild(opt);
    }
    levelSelect.value = LEVELS[0].id;
    loadLevel(LEVELS[0]);
  }

  init();
})();
