const fs = require('fs');
let code = fs.readFileSync('functions/api/puzzles.js', 'utf8');
code = code.replace('export async function onRequestGet(context) {', 'async function onRequestGet(dateOverride) {');
code = code.replace('const laTime = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" });', 'const laTime = dateOverride;');
code += `
async function test() {
    let res1 = await onRequestGet("7/6/2026, 1:27:15 PM");
    let data1 = await res1.json();
    let p1 = data1.find(p => p.date === "2026-07-04");
    console.log(p1.category, p1.events.map(e => e.event));
}
test();
`;
fs.writeFileSync('test_puzzles3.js', code);
