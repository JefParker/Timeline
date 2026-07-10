const fs = require('fs');
const puzzles = [
    {
        date: "2026-07-14",
        category: "Pop Stars",
        events: [
            { event: "Bob Dylan – born Robert Zimmerman", year: 1941 },
            { event: "Freddie Mercury – born Farrokh Bulsara", year: 1946 },
            { event: "Stevie Wonder – born Stevland Hardaway Judkins", year: 1950 },
            { event: "Shania Twain – born Eilleen Regina Edwards", year: 1965 },
            { event: "Katy Perry – born Katheryn Elizabeth Hudson", year: 1984 },
            { event: "Lady Gaga – born Stefani Joanne Angelina Germanotta", year: 1986 },
            { event: "The Weeknd – born Abel Makkonen Tesfaye", year: 1990 }
        ]
    },
    {
        date: "2026-08-03",
        category: "Firsts in Space",
        events: [
            { event: "Sputnik 1 launched – First artificial satellite", year: 1957 },
            { event: "Yuri Gagarin orbits Earth – First human in space", year: 1961 },
            { event: "Apollo 11 Moon landing – First humans to walk on the moon", year: 1969 },
            { event: "Hubble Space Telescope launched – First major optical telescope in space", year: 1990 },
            { event: "International Space Station (ISS) – First module launched", year: 1998 },
            { event: "Curiosity rover lands on Mars – First of the modern, large-scale Mars rovers", year: 2012 },
            { event: "James Webb Space Telescope launched – The most powerful space telescope ever built", year: 2021 }
        ]
    },
    {
        date: "2026-09-04",
        category: "Game Night Classics",
        events: [
            { event: "Monopoly – First published by Parker Brothers", year: 1935 },
            { event: "Scrabble – The classic crossword game", year: 1948 },
            { event: "Risk – The game of global domination", year: 1959 },
            { event: "Twister – The game that ties you up in knots", year: 1966 },
            { event: "UNO – The famous color and number matching card game", year: 1971 },
            { event: "Trivial Pursuit – The pop-culture and history trivia game", year: 1981 },
            { event: "The Settlers of Catan – The pioneer of modern strategy board games", year: 1995 }
        ]
    },
    {
        date: "2026-10-19",
        category: "Pen Names",
        events: [
            { event: "Lewis Carroll – born Charles Lutwidge Dodgson", year: 1832 },
            { event: "Mark Twain – born Samuel Langhorne Clemens", year: 1835 },
            { event: "George Orwell – born Eric Arthur Blair", year: 1903 },
            { event: "Dr. Seuss – born Theodor Seuss Geisel", year: 1904 },
            { event: "Stan Lee – born Stanley Martin Lieber", year: 1922 },
            { event: "J.K. Rowling – born Joanne Rowling; also writes as Robert Galbraith", year: 1965 },
            { event: "Lemony Snicket – born Daniel Handler", year: 1970 }
        ]
    },
    {
        date: "2026-11-02",
        category: "Tech Revolutions",
        events: [
            { event: "Sony Walkman – The first portable cassette player", year: 1979 },
            { event: "Apple Macintosh – The first successful PC with a graphical user interface", year: 1984 },
            { event: "Nintendo Game Boy – The iconic handheld gaming console", year: 1989 },
            { event: "Sony PlayStation – The CD-ROM based console that revolutionized gaming", year: 1994 },
            { event: "Apple iPod – '1,000 songs in your pocket'", year: 2001 },
            { event: "Apple iPhone - The first mobile phone to use multi-touch technology", year: 2007 },
            { event: "Amazon Echo (Alexa) – The first major smart speaker", year: 2014 }
        ]
    },
    {
        date: "2026-12-04",
        category: "Holiday Classics",
        events: [
            { event: "It's a Wonderful Life – The classic starring Jimmy Stewart", year: 1946 },
            { event: "Rudolph the Red-Nosed Reindeer – The stop-motion TV special", year: 1964 },
            { event: "A Christmas Story – 'You\\'ll shoot your eye out!'", year: 1983 },
            { event: "Home Alone – Kevin McCallister defends his house", year: 1990 },
            { event: "The Nightmare Before Christmas – Tim Burton's Halloween/Christmas mashup", year: 1993 },
            { event: "How the Grinch Stole Christmas! – The live-action version starring Jim Carrey", year: 2000 },
            { event: "Elf – Starring Will Ferrell as Buddy", year: 2003 }
        ]
    }
];

let publicPuzzles = JSON.parse(fs.readFileSync('public/puzzles.json', 'utf8'));
for (const p of puzzles) {
    const idx = publicPuzzles.findIndex(x => x.date === p.date);
    if (idx >= 0) publicPuzzles[idx] = p;
    else publicPuzzles.push(p);
}
fs.writeFileSync('public/puzzles.json', JSON.stringify(publicPuzzles, null, 2));

let swScript = fs.readFileSync('public/sw.js', 'utf8');
let match = swScript.match(/timeline-cache-v(\d+)/);
if (match) {
    let nextV = parseInt(match[1]) + 1;
    swScript = swScript.replace(match[0], `timeline-cache-v${nextV}`);
    fs.writeFileSync('public/sw.js', swScript);
}
console.log('Successfully updated public/puzzles.json and bumped sw.js cache');
