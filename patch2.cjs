const fs = require('fs');
let lines = fs.readFileSync('src/components/NotulenGenerator.tsx', 'utf8').split('\n');
const index = lines.findIndex(l => l.includes('{/* 8 Regular Monthly Meetings */}'));
if (index !== -1) {
    lines.splice(index, 0, '          )}');
}
fs.writeFileSync('src/components/NotulenGenerator.tsx', lines.join('\n'));
