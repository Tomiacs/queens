// ---------------------------------------------------------------------------
// Queens pályaszerkesztő.
//
// A modell megegyezik a levels.js pálya-formátumával:
//   { id, name, size, regions:{id:{name,color}}, grid:[[id|null,...],...] }
// A validáció a közös puzzle.js-t használja (QueensPuzzle.validateLevel).
// Kimenet: bemásolható JS-objektum + letölthető JSON.
// ---------------------------------------------------------------------------

(function () {
  "use strict";

  const MIN_SIZE = 5;
  const MAX_SIZE = 12;

  // Alap színpaletta új régiókhoz (a játék pályáival összhangban).
  const DEFAULT_COLORS = [
    "#bfa2dd", "#f8c179", "#9ed08e", "#95c8f5", "#f47b5d",
    "#e6ee63", "#b7a98d", "#e6a9c9", "#cdeb4f", "#e4e3df",
    "#7ec8b1", "#f2a6a6",
  ];

  const ERASE = "__erase__";

  // DOM
  const boardEl = document.getElementById("board");
  const paletteEl = document.getElementById("palette");
  const statusEl = document.getElementById("status");
  const loadSelect = document.getElementById("loadSelect");
  const sizeSelect = document.getElementById("sizeSelect");
  const idInput = document.getElementById("idInput");
  const nameInput = document.getElementById("nameInput");
  const exportArea = document.getElementById("exportArea");

  // Állapot
  let size = 8;
  let regions = []; // [{ id, name, color }]
  let grid = []; // size x size: regióId vagy null
  let activeBrush = null; // regióId vagy ERASE
  let cellEls = [];
  let painting = false;

  // -------------------------------------------------------------------------
  // Segédfüggvények
  // -------------------------------------------------------------------------

  function emptyGrid(n) {
    return Array.from({ length: n }, () => new Array(n).fill(null));
  }

  function nextRegionId() {
    // A, B, ... Z, majd R1, R2, ...
    const used = new Set(regions.map((r) => r.id));
    for (let i = 0; i < 26; i++) {
      const ch = String.fromCharCode(65 + i);
      if (!used.has(ch)) return ch;
    }
    let k = 1;
    while (used.has("R" + k)) k++;
    return "R" + k;
  }

  function regionsAsObject() {
    const obj = {};
    for (const r of regions) obj[r.id] = { name: r.name, color: r.color };
    return obj;
  }

  function currentLevel() {
    return {
      id: idInput.value.trim() || "sajat-palya",
      name: nameInput.value.trim() || "Saját pálya",
      size,
      regions: regionsAsObject(),
      grid,
    };
  }

  // -------------------------------------------------------------------------
  // Régiók / paletta
  // -------------------------------------------------------------------------

  function addRegion(color) {
    const id = nextRegionId();
    const region = {
      id,
      name: "Régió " + id,
      color: color || DEFAULT_COLORS[regions.length % DEFAULT_COLORS.length],
    };
    regions.push(region);
    if (!activeBrush || activeBrush === ERASE) activeBrush = id;
    renderPalette();
    return region;
  }

  function deleteRegion(id) {
    regions = regions.filter((r) => r.id !== id);
    // a törölt régió celláit ürítjük
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (grid[r][c] === id) grid[r][c] = null;
      }
    }
    if (activeBrush === id) activeBrush = regions.length ? regions[0].id : ERASE;
    renderPalette();
    applyStyles();
    validateAndExport();
  }

  function renderPalette() {
    paletteEl.innerHTML = "";

    for (const region of regions) {
      const row = document.createElement("div");
      row.className = "brush" + (activeBrush === region.id ? " active" : "");
      row.dataset.id = region.id;

      const swatch = document.createElement("input");
      swatch.type = "color";
      swatch.className = "swatch";
      swatch.value = region.color;
      swatch.title = "Szín módosítása";
      swatch.addEventListener("input", () => {
        region.color = swatch.value;
        applyStyles();
        validateAndExport();
      });
      swatch.addEventListener("click", (e) => e.stopPropagation());

      const name = document.createElement("input");
      name.type = "text";
      name.className = "name";
      name.value = region.name;
      name.addEventListener("input", () => {
        region.name = name.value;
        validateAndExport();
      });
      name.addEventListener("click", (e) => e.stopPropagation());

      const del = document.createElement("button");
      del.className = "del";
      del.textContent = "✕";
      del.title = "Régió törlése";
      del.addEventListener("click", (e) => {
        e.stopPropagation();
        deleteRegion(region.id);
      });

      row.appendChild(swatch);
      row.appendChild(name);
      row.appendChild(del);
      row.addEventListener("click", () => setActiveBrush(region.id));
      paletteEl.appendChild(row);
    }

    // Radír ecset
    const eraser = document.createElement("div");
    eraser.className = "brush eraser" + (activeBrush === ERASE ? " active" : "");
    eraser.innerHTML = '<span class="swatch"></span><span class="name">Radír</span>';
    eraser.addEventListener("click", () => setActiveBrush(ERASE));
    paletteEl.appendChild(eraser);
  }

  function setActiveBrush(id) {
    activeBrush = id;
    renderPalette();
  }

  // -------------------------------------------------------------------------
  // Tábla
  // -------------------------------------------------------------------------

  function buildBoard() {
    boardEl.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    boardEl.style.gridTemplateRows = `repeat(${size}, 1fr)`;
    boardEl.innerHTML = "";
    cellEls = Array.from({ length: size }, () => new Array(size).fill(null));

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const cell = document.createElement("div");
        cell.className = "cell";
        cell.dataset.r = r;
        cell.dataset.c = c;
        cellEls[r][c] = cell;
        boardEl.appendChild(cell);
      }
    }
    applyStyles();
  }

  function colorOf(id) {
    if (id == null) return null;
    const region = regions.find((rg) => rg.id === id);
    return region ? region.color : null;
  }

  // Háttérszínek + régióhatárok frissítése a meglévő cellákon (nem épít újra).
  function applyStyles() {
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const cell = cellEls[r][c];
        const id = grid[r][c];
        const color = colorOf(id);
        cell.classList.toggle("empty", id == null);
        cell.style.background = color || "";

        const diff = (rr, cc) =>
          rr < 0 || cc < 0 || rr >= size || cc >= size || grid[rr][cc] !== id;
        cell.classList.toggle("edge-top", diff(r - 1, c));
        cell.classList.toggle("edge-bottom", diff(r + 1, c));
        cell.classList.toggle("edge-left", diff(r, c - 1));
        cell.classList.toggle("edge-right", diff(r, c + 1));
        cell.classList.toggle("last-col", c === size - 1);
        cell.classList.toggle("last-row", r === size - 1);
      }
    }
  }

  function paintCell(r, c) {
    if (r < 0 || c < 0 || r >= size || c >= size) return;
    const value = activeBrush === ERASE ? null : activeBrush;
    if (grid[r][c] === value) return;
    grid[r][c] = value;
    applyStyles();
    validateAndExport();
  }

  // Festés kattintással és húzással (pointer események).
  boardEl.addEventListener("pointerdown", (e) => {
    const cell = e.target.closest(".cell");
    if (!cell || activeBrush == null) return;
    e.preventDefault();
    painting = true;
    paintCell(+cell.dataset.r, +cell.dataset.c);
  });
  boardEl.addEventListener("pointerover", (e) => {
    if (!painting) return;
    const cell = e.target.closest(".cell");
    if (!cell) return;
    paintCell(+cell.dataset.r, +cell.dataset.c);
  });
  window.addEventListener("pointerup", () => (painting = false));

  // -------------------------------------------------------------------------
  // Méret
  // -------------------------------------------------------------------------

  function setSize(newSize, keep) {
    const old = grid;
    const oldSize = size;
    size = newSize;
    grid = emptyGrid(size);
    if (keep) {
      for (let r = 0; r < Math.min(oldSize, size); r++) {
        for (let c = 0; c < Math.min(oldSize, size); c++) {
          grid[r][c] = old[r][c];
        }
      }
    }
    buildBoard();
    validateAndExport();
  }

  // -------------------------------------------------------------------------
  // Validáció + export
  // -------------------------------------------------------------------------

  function setStatus(text, type) {
    statusEl.textContent = text;
    statusEl.className = "status" + (type ? " " + type : "");
  }

  function validateAndExport() {
    const level = currentLevel();
    const res = QueensPuzzle.validateLevel(level);
    if (res.ok) {
      setStatus("✓ Érvényes pálya – pontosan egy megoldás.", "win");
    } else {
      // A festetlen cellák inkább figyelmeztetés (még nincs kész), a többi hiba.
      const onlyUnpainted = res.errors.every((m) => m.includes("festetlen"));
      setStatus(res.errors.join(" · "), onlyUnpainted ? "warn" : "error");
    }
    exportArea.value = toLevelSource(level);
  }

  // A pálya kiírása a levels.js stílusához illő JS-objektumként.
  function toLevelSource(level) {
    const q = (s) => JSON.stringify(String(s));
    const lines = [];
    lines.push("{");
    lines.push(`  id: ${q(level.id)},`);
    lines.push(`  name: ${q(level.name)},`);
    lines.push(`  size: ${level.size},`);
    lines.push("  regions: {");
    for (const region of regions) {
      lines.push(`    ${region.id}: { name: ${q(region.name)}, color: ${q(region.color)} },`);
    }
    lines.push("  },");
    lines.push("  grid: [");
    for (let r = 0; r < level.size; r++) {
      const row = level.grid[r].map((id) => q(id == null ? "" : id)).join(", ");
      lines.push(`    [${row}],`);
    }
    lines.push("  ],");
    lines.push("},");
    return lines.join("\n");
  }

  // -------------------------------------------------------------------------
  // Betöltés meglévő pályából / új pálya
  // -------------------------------------------------------------------------

  function loadFromLevel(lvl) {
    size = lvl.size;
    regions = Object.keys(lvl.regions).map((id) => ({
      id,
      name: lvl.regions[id].name,
      color: lvl.regions[id].color,
    }));
    grid = lvl.grid.map((row) => row.map((id) => (id === "" ? null : id)));
    idInput.value = lvl.id + "-masolat";
    nameInput.value = lvl.name + " (másolat)";
    activeBrush = regions.length ? regions[0].id : ERASE;
    sizeSelect.value = String(size);
    renderPalette();
    buildBoard();
    validateAndExport();
  }

  function startBlank(newSize) {
    size = newSize;
    regions = [];
    grid = emptyGrid(size);
    idInput.value = "";
    nameInput.value = "";
    // két kezdő régió, hogy legyen mivel festeni
    addRegion();
    addRegion();
    activeBrush = regions[0].id;
    sizeSelect.value = String(size);
    renderPalette();
    buildBoard();
    validateAndExport();
  }

  // -------------------------------------------------------------------------
  // Eseménykötések
  // -------------------------------------------------------------------------

  document.getElementById("addRegionBtn").addEventListener("click", () => {
    addRegion();
    validateAndExport();
  });

  document.getElementById("clearBtn").addEventListener("click", () => {
    grid = emptyGrid(size);
    applyStyles();
    validateAndExport();
  });

  sizeSelect.addEventListener("change", () => {
    setSize(+sizeSelect.value, true);
  });

  loadSelect.addEventListener("change", () => {
    const val = loadSelect.value;
    if (val === "__blank__") {
      startBlank(+sizeSelect.value || 8);
    } else {
      const lvl = (window.LEVELS || []).find((l) => l.id === val);
      if (lvl) loadFromLevel(lvl);
    }
  });

  document.getElementById("copyBtn").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(exportArea.value);
      flashButton("copyBtn", "Másolva ✓");
    } catch (e) {
      exportArea.focus();
      exportArea.select();
      flashButton("copyBtn", "Jelöld ki és másold");
    }
  });

  document.getElementById("downloadBtn").addEventListener("click", () => {
    const level = currentLevel();
    // JSON-ként az üres cellák maradjanak null helyett "" – de itt hagyjuk null-t,
    // a JSON így is beolvasható; a játék az ""-t is null-ként kezeli.
    const json = JSON.stringify(level, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = (level.id || "palya") + ".json";
    a.click();
    URL.revokeObjectURL(a.href);
  });

  function flashButton(id, text) {
    const btn = document.getElementById(id);
    const orig = btn.textContent;
    btn.textContent = text;
    setTimeout(() => (btn.textContent = orig), 1200);
  }

  // -------------------------------------------------------------------------
  // Indítás
  // -------------------------------------------------------------------------

  function init() {
    // méretválasztó
    for (let s = MIN_SIZE; s <= MAX_SIZE; s++) {
      const opt = document.createElement("option");
      opt.value = String(s);
      opt.textContent = `${s} × ${s}`;
      sizeSelect.appendChild(opt);
    }
    sizeSelect.value = "8";

    // betöltés-választó
    const blank = document.createElement("option");
    blank.value = "__blank__";
    blank.textContent = "Új, üres pálya";
    loadSelect.appendChild(blank);
    for (const lvl of window.LEVELS || []) {
      const opt = document.createElement("option");
      opt.value = lvl.id;
      opt.textContent = "Másolat: " + lvl.name;
      loadSelect.appendChild(opt);
    }

    startBlank(8);
  }

  init();
})();
