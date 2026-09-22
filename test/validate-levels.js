// ---------------------------------------------------------------------------
// Pálya-érvényesítő teszt.
//
// Minden LEVELS-beli pályára ellenőrzi, hogy:
//   1. a grid mérete size x size,
//   2. minden gridben szereplő regióId definiálva van a regions-ben,
//   3. a régiók száma pontosan size (így lehet régiónként egy királynő),
//   4. a Queens-szabályok szerint PONTOSAN EGY megoldása van
//      (egy királynő soronként/oszloponként/régiónként, két királynő
//       nem érintkezhet – átlósan sem).
//
// Futtatás: `npm test`  vagy  `node test/validate-levels.js`
// Nem nulla kilépési kóddal jelez hibát (CI-barát).
// ---------------------------------------------------------------------------

const assert = require("assert");
const path = require("path");
const { LEVELS } = require(path.join(__dirname, "..", "levels.js"));

// Megszámolja egy pálya érvényes megoldásait (backtracking).
function countSolutions(level) {
  const n = level.size;
  const grid = level.grid;
  let count = 0;
  const usedCols = new Set();
  const usedRegions = new Set();
  const placed = []; // [r, c] párok

  function canPlace(r, c) {
    if (usedCols.has(c)) return false;
    if (usedRegions.has(grid[r][c])) return false;
    if (placed.length) {
      const [pr, pc] = placed[placed.length - 1];
      // előző sor királynőjével nem érintkezhet (a sorok növekvő sorrendben jönnek)
      if (Math.abs(pr - r) <= 1 && Math.abs(pc - c) <= 1) return false;
    }
    return true;
  }

  function dfs(r) {
    if (r === n) {
      count++;
      return;
    }
    for (let c = 0; c < n; c++) {
      if (!canPlace(r, c)) continue;
      placed.push([r, c]);
      usedCols.add(c);
      usedRegions.add(grid[r][c]);
      dfs(r + 1);
      placed.pop();
      usedCols.delete(c);
      usedRegions.delete(grid[r][c]);
    }
  }

  dfs(0);
  return count;
}

function validateLevel(level) {
  const n = level.size;
  assert.ok(Array.isArray(level.grid), `${level.id}: hiányzó grid`);
  assert.strictEqual(level.grid.length, n, `${level.id}: a grid sorainak száma nem ${n}`);

  const regionsSeen = new Set();
  for (let r = 0; r < n; r++) {
    assert.strictEqual(
      level.grid[r].length,
      n,
      `${level.id}: a(z) ${r}. sor hossza nem ${n}`
    );
    for (let c = 0; c < n; c++) {
      const id = level.grid[r][c];
      assert.ok(
        level.regions[id],
        `${level.id}: a(z) [${r},${c}] cella "${id}" régiója nincs definiálva`
      );
      regionsSeen.add(id);
    }
  }

  assert.strictEqual(
    regionsSeen.size,
    n,
    `${level.id}: ${regionsSeen.size} régió van, de ${n} kell (régiónként egy királynő)`
  );

  const solutions = countSolutions(level);
  assert.strictEqual(
    solutions,
    1,
    `${level.id}: ${solutions} megoldás van, de pontosan 1 kellene (egyértelmű pálya)`
  );
}

function run() {
  assert.ok(Array.isArray(LEVELS) && LEVELS.length > 0, "Nincs egyetlen pálya sem.");
  let ok = 0;
  for (const level of LEVELS) {
    validateLevel(level);
    console.log(`✓ ${level.id} (${level.name}) – ${level.size}x${level.size}, egyértelmű megoldás`);
    ok++;
  }
  console.log(`\nMind a(z) ${ok} pálya érvényes.`);
}

try {
  run();
  process.exit(0);
} catch (err) {
  console.error(`\n✗ Teszt megbukott: ${err.message}`);
  process.exit(1);
}
