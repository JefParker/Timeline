const fs = require('fs');
const puzzles = JSON.parse(fs.readFileSync('public/puzzles.json', 'utf8'));

const newPuzzles = [
  {
    category: "Science",
    events: [
      { event: "Galileo observes the moons of Jupiter", year: 1610 },
      { event: "Isaac Newton publishes Principia Mathematica", year: 1687 },
      { event: "Charles Darwin publishes On the Origin of Species", year: 1859 },
      { event: "Albert Einstein publishes General Relativity", year: 1915 },
      { event: "Alexander Fleming discovers Penicillin", year: 1928 },
      { event: "Yuri Gagarin becomes the first human in space", year: 1961 },
      { event: "Dolly the sheep becomes the first cloned mammal", year: 1996 }
    ]
  },
  {
    category: "Science",
    events: [
      { event: "Invention of the printing press by Gutenberg", year: 1440 },
      { event: "Discovery of Uranus by William Herschel", year: 1781 },
      { event: "Marie Curie discovers Radium", year: 1898 },
      { event: "Wright Brothers' first successful airplane flight", year: 1903 },
      { event: "Discovery of the double-helix structure of DNA", year: 1953 },
      { event: "Apollo 11 moon landing", year: 1969 },
      { event: "Hubble Space Telescope launched", year: 1990 }
    ]
  },
  {
    category: "Literature",
    events: [
      { event: "Shakespeare writes Romeo and Juliet", year: 1597 },
      { event: "Mary Shelley publishes Frankenstein", year: 1818 },
      { event: "Herman Melville publishes Moby-Dick", year: 1851 },
      { event: "Mark Twain publishes The Adventures of Tom Sawyer", year: 1876 },
      { event: "F. Scott Fitzgerald publishes The Great Gatsby", year: 1925 },
      { event: "J.R.R. Tolkien publishes The Hobbit", year: 1937 },
      { event: "J.K. Rowling publishes Harry Potter and the Sorcerer's Stone", year: 1997 }
    ]
  },
  {
    category: "Literature",
    events: [
      { event: "Miguel de Cervantes publishes Don Quixote", year: 1605 },
      { event: "Jane Austen publishes Pride and Prejudice", year: 1813 },
      { event: "Charles Dickens publishes A Tale of Two Cities", year: 1859 },
      { event: "Lewis Carroll publishes Alice's Adventures in Wonderland", year: 1865 },
      { event: "Arthur Conan Doyle publishes first Sherlock Holmes story", year: 1887 },
      { event: "George Orwell publishes 1984", year: 1949 },
      { event: "Harper Lee publishes To Kill a Mockingbird", year: 1960 }
    ]
  },
  {
    category: "Geography",
    events: [
      { event: "Christopher Columbus reaches the Americas", year: 1492 },
      { event: "Ferdinand Magellan's expedition completes circumnavigation", year: 1522 },
      { event: "James Cook reaches Australia", year: 1770 },
      { event: "Lewis and Clark expedition begins", year: 1804 },
      { event: "Completion of the Suez Canal", year: 1869 },
      { event: "Roald Amundsen reaches the South Pole", year: 1911 },
      { event: "Edmund Hillary and Tenzing Norgay summit Mount Everest", year: 1953 }
    ]
  },
  {
    category: "Geography",
    events: [
      { event: "Vasco da Gama reaches India by sea", year: 1498 },
      { event: "Founding of Jamestown, Virginia", year: 1607 },
      { event: "Discovery of Antarctica", year: 1820 },
      { event: "Completion of the Transcontinental Railroad (USA)", year: 1869 },
      { event: "Completion of the Panama Canal", year: 1914 },
      { event: "Discovery of the wreck of the Titanic", year: 1985 },
      { event: "Construction of the Channel Tunnel begins", year: 1988 }
    ]
  }
];

// Check constraints
for (const p of newPuzzles) {
  const years = p.events.map(e => e.year);
  const uniqueYears = new Set(years);
  if (years.length !== uniqueYears.size) {
    console.error("Duplicate year found in puzzle: ", p);
    process.exit(1);
  }
}

puzzles.push(...newPuzzles);
fs.writeFileSync('public/puzzles.json', JSON.stringify(puzzles, null, 4));
console.log("Added new puzzles successfully.");
