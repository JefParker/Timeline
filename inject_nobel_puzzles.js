const fs = require('fs');

const path = 'functions/api/puzzles.js';
let content = fs.readFileSync(path, 'utf8');

const injectBlock = `
    // Special Override for Nobel Prize in Medicine (2026-10-05)
    for (let i = 0; i < puzzles.length; i++) {
        if (puzzles[i].date === "2026-10-05") {
            puzzles[i] = {
                date: "2026-10-05",
                category: "Nobel Prize in Medicine",
                events: [
                    { event: "Emil von Behring wins for serum therapy.", year: 1901 },
                    { event: "Frederick Banting and John Macleod win for discovering insulin.", year: 1923 },
                    { event: "Alexander Fleming, Ernst Chain, and Howard Florey win for discovering penicillin.", year: 1945 },
                    { event: "Hans Krebs wins for discovering the citric acid cycle.", year: 1953 },
                    { event: "Watson, Crick, and Wilkins win for discovering the structure of DNA.", year: 1962 },
                    { event: "Shinya Yamanaka and John Gurdon win for reprogramming mature cells into stem cells.", year: 2012 },
                    { event: "Katalin Karikó and Drew Weissman win for developing mRNA vaccines.", year: 2023 }
                ]
            };
        }
    }

    // Special Override for Nobel Prize in Physics (2026-10-06)
    for (let i = 0; i < puzzles.length; i++) {
        if (puzzles[i].date === "2026-10-06") {
            puzzles[i] = {
                date: "2026-10-06",
                category: "Nobel Prize in Physics",
                events: [
                    { event: "Wilhelm Röntgen wins for discovering X-rays.", year: 1901 },
                    { event: "Albert Einstein wins for discovering the photoelectric effect.", year: 1921 },
                    { event: "Werner Heisenberg wins for creating quantum mechanics.", year: 1932 },
                    { event: "Enrico Fermi wins for discovering new radioactive elements.", year: 1938 },
                    { event: "Richard Feynman wins for his work in quantum electrodynamics.", year: 1965 },
                    { event: "Peter Higgs and François Englert win for discovering the Higgs mechanism.", year: 2013 },
                    { event: "Roger Penrose wins for proving that black holes are a prediction of general relativity.", year: 2020 }
                ]
            };
        }
    }

    // Special Override for Nobel Prize in Chemistry (2026-10-07)
    for (let i = 0; i < puzzles.length; i++) {
        if (puzzles[i].date === "2026-10-07") {
            puzzles[i] = {
                date: "2026-10-07",
                category: "Nobel Prize in Chemistry",
                events: [
                    { event: "Marie Curie wins for discovering radium and polonium.", year: 1911 },
                    { event: "Linus Pauling wins for his research on the chemical bond.", year: 1954 },
                    { event: "Paul Berg wins for studying the biochemistry of nucleic acids.", year: 1980 },
                    { event: "Kary Mullis wins for inventing PCR.", year: 1993 },
                    { event: "Chalfie, Shimomura, and Tsien win for discovering green fluorescent protein.", year: 2008 },
                    { event: "Goodenough, Whittingham, and Yoshino win for developing lithium-ion batteries.", year: 2019 },
                    { event: "Emmanuelle Charpentier and Jennifer Doudna win for developing CRISPR gene editing.", year: 2020 }
                ]
            };
        }
    }

    // Special Override for Nobel Prize in Literature (2026-10-08)
    for (let i = 0; i < puzzles.length; i++) {
        if (puzzles[i].date === "2026-10-08") {
            puzzles[i] = {
                date: "2026-10-08",
                category: "Nobel Prize in Literature",
                events: [
                    { event: "Rudyard Kipling wins for his original imagination and observation.", year: 1907 },
                    { event: "George Bernard Shaw wins for his idealism and humanity.", year: 1925 },
                    { event: "Ernest Hemingway wins for his narrative mastery in 'The Old Man and the Sea'.", year: 1954 },
                    { event: "Toni Morrison wins for her visionary novels of American reality.", year: 1993 },
                    { event: "Harold Pinter wins for uncovering the oppression in everyday prattle.", year: 2005 },
                    { event: "Bob Dylan wins for creating new poetic expressions within American song.", year: 2016 },
                    { event: "Annie Ernaux wins for uncovering the roots of personal memory.", year: 2022 }
                ]
            };
        }
    }

    // Special Override for Nobel Peace Prize (2026-10-09)
    for (let i = 0; i < puzzles.length; i++) {
        if (puzzles[i].date === "2026-10-09") {
            puzzles[i] = {
                date: "2026-10-09",
                category: "Nobel Peace Prize",
                events: [
                    { event: "Henry Dunant wins for founding the Red Cross.", year: 1901 },
                    { event: "Martin Luther King Jr. wins for his non-violent civil rights struggle.", year: 1964 },
                    { event: "Mother Teresa wins for bringing help to suffering humanity.", year: 1979 },
                    { event: "Mikhail Gorbachev wins for his leading role in the peace process.", year: 1990 },
                    { event: "Nelson Mandela and F.W. de Klerk win for peacefully terminating apartheid.", year: 1993 },
                    { event: "Malala Yousafzai and Kailash Satyarthi win for children's right to education.", year: 2014 },
                    { event: "Maria Ressa and Dmitry Muratov win for safeguarding freedom of expression.", year: 2021 }
                ]
            };
        }
    }

    // Special Override for Nobel Prize in Economics (2026-10-12)
    for (let i = 0; i < puzzles.length; i++) {
        if (puzzles[i].date === "2026-10-12") {
            puzzles[i] = {
                date: "2026-10-12",
                category: "Nobel Prize in Economics",
                events: [
                    { event: "Ragnar Frisch and Jan Tinbergen win for dynamic models of economic processes.", year: 1969 },
                    { event: "Milton Friedman wins for consumption analysis and monetary theory.", year: 1976 },
                    { event: "John Nash wins for analyzing equilibria in non-cooperative games.", year: 1994 },
                    { event: "Amartya Sen wins for contributions to welfare economics.", year: 1998 },
                    { event: "Paul Krugman wins for analyzing global trade patterns.", year: 2008 },
                    { event: "Banerjee, Duflo, and Kremer win for experimental approaches to alleviating poverty.", year: 2019 },
                    { event: "Claudia Goldin wins for her research on women's labor market outcomes.", year: 2023 }
                ]
            };
        }
    }

    return new Response(JSON.stringify(puzzles), {`;

content = content.replace('    return new Response(JSON.stringify(puzzles), {', injectBlock);
fs.writeFileSync(path, content);
console.log("Successfully injected Nobel Prize overrides.");
