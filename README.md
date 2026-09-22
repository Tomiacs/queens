# 👑 Queens

A LinkedIn [Queens](https://www.linkedin.com/games/queens/) játékának böngészős
megvalósítása, tiszta HTML/CSS/JavaScript-ből – build-eszköz és keretrendszer
nélkül.

## Játékszabály

Helyezz el pontosan **egy királynőt minden sorban, minden oszlopban és minden
színrégióban** úgy, hogy két királynő ne érintkezzen (átlósan sem).

## Vezérlés

- **Sima kattintás:** X jelölés ki/be – a kizárt mezők jelölésére.
- **Dupla kattintás:** királynő lerakása. Ilyenkor a program automatikusan
  kiikszeli a tiltott mezőket (sor, oszlop, átlós szomszédok, azonos szín).
  Újabb dupla kattintás leveszi a királynőt.
- Billentyűzet: **Enter** = X, **Szóköz** = királynő.

## Futtatás

Mivel a lap külső JS-fájlokat tölt be, egyszerű helyi szerverrel érdemes
megnyitni (a `file://` közvetlen megnyitás nem futtatja a scripteket):

```bash
npm start
```

Ezután nyisd meg: <http://localhost:8777>

## Tesztek

```bash
npm test
```

A teszt minden pályára ellenőrzi, hogy a méret és a régiók helyesek-e, és hogy a
pályának **pontosan egy** megoldása van (egyértelmű feladvány).

## Projektstruktúra

| Fájl | Szerep |
|------|--------|
| `index.html` | A lap váza és az eszköztár |
| `styles.css` | Megjelenés: színrégiók, határvonalak, jelölések |
| `game.js` | Játéklogika, rajzolás, szabály-ellenőrzés, időzítő |
| `levels.js` | Pálya-definíciók |
| `server.js` | Pici statikus fejlesztői szerver |
| `test/validate-levels.js` | Pálya-érvényesítő teszt |

## Új pálya hozzáadása

Told bele egy új objektumot a `levels.js` `LEVELS` tömbjébe:

```js
{
  id: "egyedi-azonosito",
  name: "2. pálya",
  size: 8,
  regions: {
    A: { name: "Piros", color: "#f47b5d" },
    // ... size darab régió
  },
  grid: [
    ["A", "A", /* ... */],
    // ... size x size, minden cella egy regióId
  ],
}
```

A pályaválasztó és a teljes logika tetszőleges `N×N` méretet kezel – a
`game.js`-hez nem kell hozzányúlni. A hozzáadott pályát a `npm test` ellenőrzi.
