const fs = require('fs');
let code = fs.readFileSync('functions/api/puzzles.js', 'utf8');
code = code.replace('export async function onRequestGet(context) {', 'async function onRequestGet(dateOverride) {');
code = code.replace('const laTime = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" });', 'const laTime = dateOverride;');
// FIX THE BUG
code = code.replace('for (let i = 0; i <= daysSinceEpochToStart; i++)', 'for (let i = 0; i < daysSinceEpochToStart; i++)');

code += `
async function test() {
    let res1 = await onRequestGet("7/6/2026, 1:27:15 PM");
    let data1 = await res1.json();
    let p1 = data1.find(p => p.date === "2026-07-04");
    
    let res2 = await onRequestGet("7/7/2026, 1:27:15 PM");
    let data2 = await res2.json();
    let p2 = data2.find(p => p.date === "2026-07-04");
    
    console.log("Day 1:", p1.category, p1.events.map(e => e.event));
    console.log("Day 2:", p2.category, p2.events.map(e => e.event));
}
test();
`;
fs.writeFileSync('test_puzzles4.js', code);
