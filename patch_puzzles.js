const fs = require('fs');
let code = fs.readFileSync('functions/api/puzzles.js', 'utf8');

// 1. Add URL parsing at the top of onRequestGet
code = code.replace(
    'export async function onRequestGet(context) {',
    'export async function onRequestGet(context) {\n    const url = new URL(context.request.url);\n    const requestedDate = url.searchParams.get("date");'
);

// 2. Replace the date generation logic
const oldLogic = `    const puzzles = [];
    
    // Use LA Time for start date to match game logic
    const laTime = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" });
    const startDate = new Date(laTime);
    startDate.setHours(0,0,0,0);
    
    // Start from 2 days ago to give some padding for timezones
    startDate.setDate(startDate.getDate() - 2);
    
    const epoch = new Date("2024-01-01T00:00:00Z");
    
    // Create a PRNG for category selection
    const catRandom = mulberry32(123456789);
    const recentCategories = [];
    
    // Generate categories from epoch to our start date to build the recentCategories state
    const daysSinceEpochToStart = Math.floor((startDate - epoch) / (1000 * 60 * 60 * 24));
    
    for (let i = 0; i < daysSinceEpochToStart; i++) {
        let availableCategories = CATEGORIES.filter(c => !recentCategories.includes(c));
        if (availableCategories.length === 0) availableCategories = [...CATEGORIES];
        const category = availableCategories[Math.floor(catRandom() * availableCategories.length)];
        recentCategories.push(category);
        if (recentCategories.length > 6) recentCategories.shift();
    }

    const globalUsedEvents = new Set();

    for (let i = 0; i < 60; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        const dateStr = \`\${date.getFullYear()}-\${String(date.getMonth() + 1).padStart(2, '0')}-\${String(date.getDate()).padStart(2, '0')}\`;`;

const newLogic = `    const allPuzzles = [];
    
    // Use LA Time for start date to match game logic
    const laTime = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" });
    const startDate = new Date(laTime);
    startDate.setHours(0,0,0,0);
    
    // Start from 2 days ago to give some padding for timezones
    startDate.setDate(startDate.getDate() - 2);
    
    const epoch = new Date("2024-01-01T00:00:00Z");
    
    let targetEndDate = new Date(startDate);
    targetEndDate.setDate(targetEndDate.getDate() + 60);
    if (requestedDate) {
        targetEndDate = new Date(requestedDate);
        targetEndDate.setHours(0,0,0,0);
        targetEndDate.setDate(targetEndDate.getDate() + 1);
    }
    
    const daysToGenerate = Math.floor((targetEndDate - epoch) / (1000 * 60 * 60 * 24));
    
    // Create a PRNG for category selection
    const catRandom = mulberry32(123456789);
    const recentCategories = [];
    const globalUsedEvents = new Set();

    for (let i = 0; i < daysToGenerate; i++) {
        const date = new Date(epoch);
        date.setDate(date.getDate() + i);
        const dateStr = \`\${date.getFullYear()}-\${String(date.getMonth() + 1).padStart(2, '0')}-\${String(date.getDate()).padStart(2, '0')}\`;`;

code = code.replace(oldLogic, newLogic);

// 3. Replace the push to puzzles array and add the sliding window and filtering
const oldPush = `        puzzles.push({
            date: dateStr,
            category: category,
            events: selected
        });
    }`;

const newPush = `        allPuzzles.push({
            date: dateStr,
            category: category,
            events: selected
        });
        
        // Maintain 60-day memory bank
        if (allPuzzles.length >= 60) {
            const oldPuzzle = allPuzzles[allPuzzles.length - 60];
            oldPuzzle.events.forEach(e => globalUsedEvents.delete(e.event));
        }
    }

    let puzzles = [];
    if (requestedDate) {
        puzzles = allPuzzles.filter(p => p.date === requestedDate);
    } else {
        const startStr = \`\${startDate.getFullYear()}-\${String(startDate.getMonth() + 1).padStart(2, '0')}-\${String(startDate.getDate()).padStart(2, '0')}\`;
        const startIndex = allPuzzles.findIndex(p => p.date === startStr);
        if (startIndex !== -1) {
            puzzles = allPuzzles.slice(startIndex, startIndex + 60);
        }
    }`;

code = code.replace(oldPush, newPush);

fs.writeFileSync('functions/api/puzzles.js', code);
console.log('puzzles.js patched!');
