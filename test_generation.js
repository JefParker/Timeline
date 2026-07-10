const fs = require('fs');
const { onRequestGet } = require('./functions/api/puzzles.js');

async function test() {
    const res = await onRequestGet({});
    const puzzles = JSON.parse(res.body || res._bodyInit || await res.text());
    
    const used = new Set();
    let duplicates = 0;
    
    // Skip the chocolate day override to just check the generator loop
    puzzles.forEach(p => {
        if (p.category === 'Chocolate') return;
        p.events.forEach(e => {
            if (used.has(e.event)) {
                duplicates++;
            }
            used.add(e.event);
        });
    });
    
    console.log(`Generated ${puzzles.length} puzzles with ${duplicates} duplicates.`);
}

test();
