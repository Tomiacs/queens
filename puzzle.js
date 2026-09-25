// ---------------------------------------------------------------------------
// Közös Queens-logika: solver és pálya-validáció.
// Ugyanezt használja a játék tesztje (test/validate-levels.js) és a
// pályaszerkesztő (editor.js) is – így nincs duplikált szabály-kód.
//
// Egy "level" objektum: { size, regions:{id:{name,color}}, grid:[[id,...],...] }
// A grid cellái regióId-k; a szerkesztőben a még festetlen cella lehet null/"".
// ---------------------------------------------------------------------------

(function () {
  "use strict";

  function inBounds(n, r, c) {
    return r >= 0 && c >= 0 && r < n && c < n;
  }

  // regióId -> a hozzá tartozó cellák [r,c] listája (a festetlen cellák kimaradnak)
  function regionCells(level) {
    const n = level.size;
    const map = {};
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        const id = level.grid[r][c];
        if (id == null || id === "") continue;
        (map[id] || (map[id] = [])).push([r, c]);
      }
    }
    return map;
  }

  // Azok a régióId-k, amelyek NEM összefüggőek (négy irányú szomszédság szerint).
  function nonContiguousRegions(level) {
    const n = level.size;
    const map = regionCells(level);
    const bad = [];
    for (const id in map) {
      const cells = map[id];
      const seen = new Set();
      const stack = [cells[0]];
      seen.add(cells[0][0] + "," + cells[0][1]);
      while (stack.length) {
        const [r, c] = stack.pop();
        for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nr = r + dr, nc = c + dc;
          if (!inBounds(n, nr, nc)) continue;
          if (level.grid[nr][nc] === id && !seen.has(nr + "," + nc)) {
            seen.add(nr + "," + nc);
            stack.push([nr, nc]);
          }
        }
      }
      if (seen.size !== cells.length) bad.push(id);
    }
    return bad;
  }

  // Megszámolja az érvényes megoldásokat (backtracking, soronként egy királynő).
  // A `limit` fölött rövidre zár – a validációhoz elég tudni, hogy 0 / 1 / >1.
  function countSolutions(level, limit) {
    limit = limit || Infinity;
    const n = level.size;
    const grid = level.grid;
    let count = 0;
    const cols = new Set();
    const regs = new Set();
    let prev = null; // az előző sor királynőjének [r,c]-je

    function dfs(r) {
      if (count >= limit) return;
      if (r === n) {
        count++;
        return;
      }
      for (let c = 0; c < n; c++) {
        const id = grid[r][c];
        if (id == null || id === "") continue; // festetlen cellára nem tehető
        if (cols.has(c) || regs.has(id)) continue;
        if (prev && Math.abs(prev[0] - r) <= 1 && Math.abs(prev[1] - c) <= 1) continue;
        cols.add(c);
        regs.add(id);
        const save = prev;
        prev = [r, c];
        dfs(r + 1);
        cols.delete(c);
        regs.delete(id);
        prev = save;
        if (count >= limit) return;
      }
    }

    dfs(0);
    return count;
  }

  // Teljes érvényesítés. Visszaad: { ok, errors:[...], solutions }.
  // Részben kész (festetlen cellás) pályára is hívható – ilyenkor hibát jelez.
  function validateLevel(level) {
    const n = level.size;
    const errors = [];

    if (!Number.isInteger(n) || n < 1) {
      return { ok: false, errors: ["Érvénytelen méret."], solutions: null };
    }
    if (!Array.isArray(level.grid) || level.grid.length !== n) {
      return { ok: false, errors: [`A rács nem ${n} sorból áll.`], solutions: null };
    }

    let unpainted = 0;
    const regionIds = new Set();
    const undefinedRegions = new Set();

    for (let r = 0; r < n; r++) {
      if (!Array.isArray(level.grid[r]) || level.grid[r].length !== n) {
        errors.push(`A(z) ${r + 1}. sor nem ${n} cellából áll.`);
        continue;
      }
      for (let c = 0; c < n; c++) {
        const id = level.grid[r][c];
        if (id == null || id === "") {
          unpainted++;
          continue;
        }
        regionIds.add(id);
        if (!level.regions || !level.regions[id]) undefinedRegions.add(id);
      }
    }

    if (unpainted > 0) errors.push(`${unpainted} festetlen cella van.`);
    undefinedRegions.forEach((id) =>
      errors.push(`A(z) "${id}" régió nincs a palettán definiálva.`)
    );
    if (unpainted === 0 && regionIds.size !== n) {
      errors.push(`${regionIds.size} régió van, de ${n} kell (régiónként egy királynő).`);
    }

    const bad = nonContiguousRegions(level);
    bad.forEach((id) => {
      const label = (level.regions && level.regions[id] && level.regions[id].name) || id;
      errors.push(`A(z) "${label}" régió nem összefüggő.`);
    });

    let solutions = null;
    if (errors.length === 0) {
      solutions = countSolutions(level, 2);
      if (solutions === 0) errors.push("Nincs megoldás.");
      else if (solutions > 1) errors.push("Több megoldása van – a pálya nem egyértelmű.");
    }

    return { ok: errors.length === 0, errors, solutions };
  }

  const api = { regionCells, nonContiguousRegions, countSolutions, validateLevel };

  if (typeof window !== "undefined") window.QueensPuzzle = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})();
