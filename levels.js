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
];

// Elérhetővé tesszük a böngészőben (és Node-ban, ha később kellene).
if (typeof window !== "undefined") {
  window.LEVELS = LEVELS;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = { LEVELS };
}
