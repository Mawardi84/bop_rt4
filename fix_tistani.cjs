const fs = require('fs');

const file = './src/data/initialData.ts';
let content = fs.readFileSync(file, 'utf-8');

// The user asked for "Ibu Tistani Subandiyah". We used Tisnani. Let's fix it.
content = content.replace(/Tisnani Subandiyah/g, "Tistani Subandiyah");
content = content.replace(/TISNANI SUBANDIYAH/g, "TISTANI SUBANDIYAH");

fs.writeFileSync(file, content);
console.log('Fixed initialData.ts');
