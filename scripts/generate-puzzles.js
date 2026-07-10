const fs = require('fs');

const CATEGORIES = ['Sports', 'Landmarks', 'History', 'Entertainment', 'Business', 'Technology', 'Cinema', 'Television'];

// A hardcoded fallback dataset to ensure 60 days of high quality puzzles without relying on flaky APIs.
const FALLBACK_DATA = {
    'Cinema': [
        { event: "The Matrix released", year: 1999 },
        { event: "Star Wars Episode IV released", year: 1977 },
        { event: "First Academy Awards ceremony", year: 1929 },
        { event: "Avatar released", year: 2009 },
        { event: "The Godfather released", year: 1972 },
        { event: "Titanic released", year: 1997 },
        { event: "Jurassic Park released", year: 1993 },
        { event: "Avengers: Endgame released", year: 2019 },
        { event: "Pulp Fiction released", year: 1994 },
        { event: "The Wizard of Oz released", year: 1939 },
        { event: "Gone with the Wind released", year: 1939 },
        { event: "First Toy Story movie released", year: 1995 },
        { event: "Casablanca released", year: 1942 },
        { event: "The Dark Knight released", year: 2008 },
        { event: "Snow White and the Seven Dwarfs released", year: 1937 }
    ],
    'Sports': [
        { event: "First modern Olympic Games", year: 1896 },
        { event: "First FIFA World Cup", year: 1930 },
        { event: "Jackie Robinson breaks baseball color barrier", year: 1947 },
        { event: "Muhammad Ali lights Olympic cauldron", year: 1996 },
        { event: "First Super Bowl", year: 1967 },
        { event: "Babe Ruth hits 60 home runs", year: 1927 },
        { event: "Miracle on Ice", year: 1980 },
        { event: "Roger Bannister breaks 4-minute mile", year: 1954 },
        { event: "Michael Jordan's 'Flu Game'", year: 1997 },
        { event: "Usain Bolt sets 100m world record", year: 2009 },
        { event: "Title IX passed in USA", year: 1972 },
        { event: "First Wimbledon Championship", year: 1877 },
        { event: "Tiger Woods wins first Masters", year: 1997 },
        { event: "Nadia Comăneci scores perfect 10", year: 1976 },
        { event: "First Tour de France", year: 1903 }
    ],
    'Landmarks': [
        { event: "Eiffel Tower completed", year: 1889 },
        { event: "Statue of Liberty dedicated", year: 1886 },
        { event: "Empire State Building completed", year: 1931 },
        { event: "Taj Mahal construction completed", year: 1653 },
        { event: "Colosseum completed", year: 80 },
        { event: "Great Wall of China Ming Dynasty construction begins", year: 1368 },
        { event: "Burj Khalifa opened", year: 2010 },
        { event: "Sydney Opera House opened", year: 1973 },
        { event: "Machu Picchu discovered by Hiram Bingham", year: 1911 },
        { event: "Mount Rushmore completed", year: 1941 },
        { event: "Golden Gate Bridge opened", year: 1937 },
        { event: "Leaning Tower of Pisa construction begins", year: 1173 },
        { event: "Christ the Redeemer statue completed", year: 1931 },
        { event: "Hoover Dam dedicated", year: 1935 },
        { event: "Stonehenge erected (approximate main phase)", year: -2500 }
    ],
    'History': [
        { event: "Declaration of Independence signed", year: 1776 },
        { event: "Fall of the Berlin Wall", year: 1989 },
        { event: "Magna Carta signed", year: 1215 },
        { event: "Christopher Columbus reaches the Americas", year: 1492 },
        { event: "End of World War II", year: 1945 },
        { event: "French Revolution begins", year: 1789 },
        { event: "Sinking of the Titanic", year: 1912 },
        { event: "Apollo 11 moon landing", year: 1969 },
        { event: "Nelson Mandela released from prison", year: 1990 },
        { event: "First successful airplane flight by Wright brothers", year: 1903 },
        { event: "Assassination of Archduke Franz Ferdinand", year: 1914 },
        { event: "American Civil War begins", year: 1861 },
        { event: "Sputnik 1 launched", year: 1957 },
        { event: "Chernobyl disaster", year: 1986 },
        { event: "Printing press invented by Gutenberg", year: 1440 }
    ],
    'Business': [
        { event: "Apple Computer founded", year: 1976 },
        { event: "Amazon.com goes online", year: 1995 },
        { event: "Ford Motor Company incorporated", year: 1903 },
        { event: "McDonald's founded", year: 1940 },
        { event: "Google incorporated", year: 1998 },
        { event: "Facebook launched", year: 2004 },
        { event: "Bitcoin network created", year: 2009 },
        { event: "Standard Oil founded", year: 1870 },
        { event: "Walmart founded", year: 1962 },
        { event: "Coca-Cola invented", year: 1886 },
        { event: "Disney founded", year: 1923 },
        { event: "Microsoft founded", year: 1975 },
        { event: "Wall Street Crash (Black Tuesday)", year: 1929 },
        { event: "Tesla Motors incorporated", year: 2003 },
        { event: "Netflix founded", year: 1997 }
    ],
    'Technology': [
        { event: "First iPhone announced", year: 2007 },
        { event: "World Wide Web invented", year: 1989 },
        { event: "First personal computer (Altair 8800)", year: 1974 },
        { event: "First email sent", year: 1971 },
        { event: "First commercial microprocessor (Intel 4004)", year: 1971 },
        { event: "Windows 1.0 released", year: 1985 },
        { event: "First SMS text message sent", year: 1992 },
        { event: "Nintendo Entertainment System released in US", year: 1985 },
        { event: "Sony PlayStation released", year: 1994 },
        { event: "First successful artificial satellite (Sputnik)", year: 1957 },
        { event: "ENIAC computer completed", year: 1945 },
        { event: "First commercial cellular network (1G)", year: 1979 },
        { event: "First version of Linux kernel released", year: 1991 },
        { event: "Bluetooth technology invented", year: 1994 },
        { event: "First YouTube video uploaded", year: 2005 }
    ],
    'Entertainment': [
        { event: "First television broadcast", year: 1928 },
        { event: "Beatles appear on Ed Sullivan Show", year: 1964 },
        { event: "First MTV broadcast", year: 1981 },
        { event: "Michael Jackson releases Thriller", year: 1982 },
        { event: "First Grammy Awards", year: 1959 },
        { event: "Woodstock music festival", year: 1969 },
        { event: "Live Aid concerts", year: 1985 },
        { event: "Harry Potter and the Philosopher's Stone published", year: 1997 },
        { event: "First episode of The Simpsons", year: 1989 },
        { event: "Elvis Presley records 'That's All Right'", year: 1954 },
        { event: "First Tony Awards", year: 1947 },
        { event: "First comic book superhero (Superman) debuts", year: 1938 },
        { event: "Saturday Night Live premieres", year: 1975 },
        { event: "First color TV broadcast in US", year: 1954 },
        { event: "First Spotify launch", year: 2008 }
    ]
};

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

async function main() {
    console.log("Generating 60 puzzles from curated dataset...");

    const puzzles = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 2); // Start 2 days ago to cover timezones
    startDate.setHours(0,0,0,0);
    
    const recentCategories = [];

    for (let i = 0; i < 60; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        
        // Filter out categories used in the last 6 days
        let availableCategories = CATEGORIES.filter(c => !recentCategories.includes(c));
        if (availableCategories.length === 0) {
            availableCategories = [...CATEGORIES]; // fallback
        }
        
        const category = availableCategories[Math.floor(Math.random() * availableCategories.length)];
        
        // Keep track of recent categories (last 6)
        recentCategories.push(category);
        if (recentCategories.length > 6) {
            recentCategories.shift();
        }
        
        const categoryList = FALLBACK_DATA[category];
        
        // Shuffle and take 7 items (we know there are at least 15 in fallback)
        const selected = shuffle([...categoryList]).slice(0, 7);

        puzzles.push({
            date: dateStr,
            category: category,
            events: selected
        });
    }

    fs.writeFileSync('./public/puzzles.json', JSON.stringify(puzzles, null, 2));
    console.log("Generated 60 puzzles in public/puzzles.json");
}

main().catch(console.error);
