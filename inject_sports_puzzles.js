const fs = require('fs');

const path = 'functions/api/puzzles.js';
let content = fs.readFileSync(path, 'utf8');

const injectBlock = `
    // Special Override for NFL Super Bowl (2027-02-14)
    for (let i = 0; i < puzzles.length; i++) {
        if (puzzles[i].date === "2027-02-14") {
            puzzles[i] = {
                date: "2027-02-14",
                category: "NFL Super Bowl Champions",
                events: [
                    { event: "Green Bay Packers win the first ever Super Bowl.", year: 1967 },
                    { event: "Miami Dolphins win, completing the only perfect, undefeated season in NFL history.", year: 1973 },
                    { event: "Chicago Bears win, dominating with their legendary '85 defense.", year: 1986 },
                    { event: "Dallas Cowboys win, launching their 1990s dynasty.", year: 1993 },
                    { event: "New York Giants win, pulling off a massive upset to end the Patriots' perfect season.", year: 2008 },
                    { event: "New England Patriots win after completing the largest comeback in Super Bowl history (28-3).", year: 2017 },
                    { event: "Kansas City Chiefs win, cementing their modern dynasty.", year: 2024 }
                ]
            };
        }
    }

    // Special Override for NBA Finals (2027-06-03)
    for (let i = 0; i < puzzles.length; i++) {
        if (puzzles[i].date === "2027-06-03") {
            puzzles[i] = {
                date: "2027-06-03",
                category: "NBA Finals Champions",
                events: [
                    { event: "Boston Celtics win, capping off Bill Russell's legendary 11th championship.", year: 1969 },
                    { event: "Los Angeles Lakers win, highlighting the peak of the Magic Johnson vs. Larry Bird rivalry.", year: 1987 },
                    { event: "Chicago Bulls win, securing their first \\"three-peat\\" led by Michael Jordan.", year: 1993 },
                    { event: "Detroit Pistons win with a massive defensive upset over the star-studded Lakers.", year: 2004 },
                    { event: "Miami Heat win, saved in Game 6 by Ray Allen's iconic game-tying three-pointer.", year: 2013 },
                    { event: "Cleveland Cavaliers win, completing a historic 3-1 series comeback against the Warriors.", year: 2016 },
                    { event: "Golden State Warriors win, cementing the legacy of their modern dynasty.", year: 2022 }
                ]
            };
        }
    }

    // Special Override for MLB World Series (2026-10-23)
    for (let i = 0; i < puzzles.length; i++) {
        if (puzzles[i].date === "2026-10-23") {
            puzzles[i] = {
                date: "2026-10-23",
                category: "MLB World Series Champions",
                events: [
                    { event: "Boston Americans win the first modern World Series.", year: 1903 },
                    { event: "New York Yankees win, dominating with their legendary \\"Murderers' Row\\" lineup.", year: 1927 },
                    { event: "Brooklyn Dodgers win their first and only World Series before moving to Los Angeles.", year: 1955 },
                    { event: "New York Mets win, famously aided by the infamous Bill Buckner error in Game 6.", year: 1986 },
                    { event: "Arizona Diamondbacks win a dramatic, emotional 7-game series against the Yankees.", year: 2001 },
                    { event: "Boston Red Sox win, finally breaking the 86-year \\"Curse of the Bambino.\\"", year: 2004 },
                    { event: "Chicago Cubs win, ending their 108-year championship drought in a legendary Game 7.", year: 2016 }
                ]
            };
        }
    }

    return new Response(JSON.stringify(puzzles), {`;

content = content.replace('    return new Response(JSON.stringify(puzzles), {', injectBlock);
fs.writeFileSync(path, content);
console.log("Successfully injected sports overrides.");
