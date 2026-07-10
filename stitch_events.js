const fs = require('fs');

const categories = ['Sports', 'Landmarks', 'History', 'Entertainment', 'Business', 'Technology', 'Cinema', 'Science', 'Pop History', 'Geography'];
const fallbackData = {};

categories.forEach(cat => {
    fallbackData[cat] = JSON.parse(fs.readFileSync(`events_${cat}.json`, 'utf8'));
});

let apiScript = fs.readFileSync('functions/api/puzzles.js', 'utf8');

// Replace CATEGORIES
apiScript = apiScript.replace(/const CATEGORIES = \[.*?\];/, `const CATEGORIES = ${JSON.stringify(categories)};`);

// Replace FALLBACK_DATA
const fallbackStr = `const FALLBACK_DATA = ${JSON.stringify(fallbackData, null, 4)};`;
apiScript = apiScript.replace(/const FALLBACK_DATA = \{[\s\S]*?\n\};\n/, fallbackStr + '\n');

// Update loop to use globalUsedEvents
if (!apiScript.includes('globalUsedEvents')) {
    apiScript = apiScript.replace(/for \(let i = 0; i < 60; i\+\+\) \{/, `const globalUsedEvents = new Set();\n\n    for (let i = 0; i < 60; i++) {`);
    
    // Replace the inner loop logic
    const oldInnerLoop = `        for (const ev of shuffledList) {\n            if (!usedYears.has(ev.year)) {\n                usedYears.add(ev.year);\n                selected.push(ev);\n                if (selected.length === 7) break;\n            }\n        }`;
    const newInnerLoop = `        for (const ev of shuffledList) {\n            if (!usedYears.has(ev.year) && !globalUsedEvents.has(ev.event)) {\n                usedYears.add(ev.year);\n                selected.push(ev);\n                globalUsedEvents.add(ev.event);\n                if (selected.length === 7) break;\n            }\n        }`;
    
    apiScript = apiScript.replace(oldInnerLoop, newInnerLoop);
}

fs.writeFileSync('functions/api/puzzles.js', apiScript);
console.log('Stitched 900 events and updated logic!');
