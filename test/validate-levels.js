// ---------------------------------------------------------------------------
// Pálya-érvényesítő teszt.
//
// Minden LEVELS-beli pályára ellenőrzi (a közös puzzle.js-en keresztül), hogy:
//   - a grid mérete size x size, minden cella definiált régió,
//   - a régiók száma pontosan size, és mind összefüggő,
//   - a Queens-szabályok szerint PONTOSAN EGY megoldása van.
//
// Futtatás: `npm test`  vagy  `node test/validate-levels.js`
// Nem nulla kilépési kóddal jelez hibát (CI-barát).
// ---------------------------------------------------------------------------

const assert = require("assert");
const path = require("path");
const { LEVELS } = require(path.join(__dirname, "..", "levels.js"));
const { validateLevel } = require(path.join(__dirname, "..", "puzzle.js"));

function run() {
  assert.ok(Array.isArray(LEVELS) && LEVELS.length > 0, "Nincs egyetlen pálya sem.");
  let ok = 0;
  for (const level of LEVELS) {
    const res = validateLevel(level);
    assert.ok(res.ok, `${level.id}: ${res.errors.join(" ")}`);
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
