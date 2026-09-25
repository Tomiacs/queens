// ---------------------------------------------------------------------------
// Pálya-definíciók a Queens játékhoz.
//
// Egy pálya (level) felépítése:
//   {
//     id:      egyedi azonosító (string)
//     name:    megjelenített név
//     size:    a tábla mérete (NxN)
//     regions: { regióId: { name, color } }  – a színrégiók leírása
//     grid:    size x size mátrix, minden cella egy regióId-t tartalmaz
//   }
//
// Új pálya hozzáadása: készíts egy hasonló objektumot és told bele a LEVELS
// tömbbe. A grid minden karaktere/eleme egy regióId-ra hivatkozik, amit a
// regions objektumban definiáltál. A megoldásnak teljesülnie kell:
//   - minden sorban, oszlopban és régióban pontosan egy királynő,
//   - két királynő nem érintkezhet (átlósan sem).
// A grid önmagában definiálja a pályát; megoldást nem kell megadni.
// ---------------------------------------------------------------------------

const LEVELS = [
  {
    id: "linkedin-sample",
    name: "1. pálya",
    size: 8,
    regions: {
      G: { name: "Szürke",  color: "#e4e3df" },
      T: { name: "Drapp",   color: "#b7a98d" },
      B: { name: "Kék",     color: "#95c8f5" },
      R: { name: "Piros",   color: "#f47b5d" },
      O: { name: "Narancs", color: "#f8c179" },
      P: { name: "Lila",    color: "#bfa2dd" },
      L: { name: "Lime",    color: "#cdeb4f" },
      N: { name: "Zöld",    color: "#9ed08e" },
    },
    // Sorok fentről lefelé, oszlopok balról jobbra.
    grid: [
      ["G", "G", "G", "G", "G", "G", "G", "G"],
      ["G", "G", "T", "T", "T", "T", "T", "G"],
      ["G", "G", "G", "B", "B", "G", "G", "G"],
      ["G", "G", "G", "B", "B", "R", "R", "G"],
      ["O", "O", "O", "B", "P", "R", "R", "G"],
      ["O", "O", "O", "B", "P", "G", "G", "G"],
      ["L", "L", "L", "B", "G", "G", "G", "G"],
      ["N", "G", "G", "G", "G", "G", "G", "G"],
    ],
  },

  {
    id: "linkedin-7x7",
    name: "2. pálya",
    size: 7,
    regions: {
      G: { name: "Zöld",    color: "#9ed08e" },
      O: { name: "Narancs", color: "#f8c179" },
      A: { name: "Szürke",  color: "#d9d9d9" },
      P: { name: "Lila",    color: "#bfa2dd" },
      B: { name: "Kék",     color: "#95c8f5" },
      R: { name: "Piros",   color: "#f47b5d" },
      Y: { name: "Sárga",   color: "#e6ee63" },
    },
    // Sorok fentről lefelé, oszlopok balról jobbra.
    grid: [
      ["G", "G", "G", "O", "O", "O", "A"],
      ["G", "G", "P", "O", "B", "O", "A"],
      ["G", "P", "P", "P", "B", "B", "A"],
      ["G", "G", "P", "P", "P", "R", "R"],
      ["Y", "P", "P", "P", "P", "P", "R"],
      ["Y", "Y", "P", "Y", "P", "R", "R"],
      ["Y", "Y", "Y", "Y", "Y", "Y", "R"],
    ],
  },

  {
    id: "linkedin-9x9",
    name: "3. pálya",
    size: 9,
    regions: {
      P: { name: "Lila",    color: "#bfa2dd" },
      O: { name: "Narancs", color: "#f8c179" },
      G: { name: "Zöld",    color: "#9ed08e" },
      B: { name: "Kék",     color: "#95c8f5" },
      K: { name: "Rózsa",   color: "#e6a9c9" },
      D: { name: "Piros",   color: "#f47b5d" },
      Y: { name: "Sárga",   color: "#e6ee63" },
      T: { name: "Drapp",   color: "#b7a98d" },
      W: { name: "Szürke",  color: "#e4e3df" },
    },
    // Sorok fentről lefelé, oszlopok balról jobbra.
    grid: [
      ["P", "P", "P", "P", "P", "P", "P", "P", "P"],
      ["P", "O", "O", "G", "G", "B", "B", "B", "P"],
      ["P", "O", "G", "G", "G", "G", "G", "B", "P"],
      ["P", "O", "G", "G", "G", "G", "G", "B", "K"],
      ["P", "P", "P", "G", "D", "G", "K", "K", "K"],
      ["P", "Y", "G", "G", "G", "G", "G", "T", "K"],
      ["P", "Y", "G", "G", "G", "G", "G", "T", "W"],
      ["P", "Y", "Y", "Y", "G", "G", "T", "T", "W"],
      ["P", "P", "P", "P", "P", "P", "W", "W", "W"],
    ],
  },

  {
    id: "linkedin-8x8-hard",
    name: "4. pálya (nehéz)",
    size: 8,
    regions: {
      P: { name: "Lila",    color: "#bfa2dd" },
      O: { name: "Narancs", color: "#f8c179" },
      B: { name: "Kék",     color: "#95c8f5" },
      G: { name: "Zöld",    color: "#9ed08e" },
      W: { name: "Szürke",  color: "#d9d9d9" },
      R: { name: "Piros",   color: "#f47b5d" },
      L: { name: "Lime",    color: "#cdeb4f" },
      T: { name: "Drapp",   color: "#b7a98d" },
    },
    // Sorok fentről lefelé, oszlopok balról jobbra.
    grid: [
      ["P", "O", "O", "O", "B", "B", "B", "B"],
      ["P", "O", "O", "O", "B", "G", "G", "B"],
      ["P", "O", "O", "O", "W", "G", "O", "O"],
      ["P", "O", "O", "W", "W", "O", "O", "O"],
      ["O", "O", "R", "R", "O", "O", "L", "L"],
      ["O", "O", "R", "O", "O", "O", "L", "L"],
      ["O", "O", "O", "O", "O", "O", "O", "O"],
      ["O", "O", "T", "T", "T", "T", "O", "O"],
    ],
  },
];

// Elérhetővé tesszük a böngészőben (és Node-ban, ha később kellene).
if (typeof window !== "undefined") {
  window.LEVELS = LEVELS;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = { LEVELS };
}
