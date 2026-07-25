import fs from 'fs';

async function test() {
    // Mock the Request and Response classes
    global.Response = class {
        constructor(body, options) {
            this.body = body;
            this.options = options;
        }
    };
    
    const pkg = await import('./functions/api/puzzles.js');
    const res = await pkg.onRequestGet({});
    const puzzles = JSON.parse(res.body);
    
    const used = new Set();
    let duplicates = 0;
    
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
